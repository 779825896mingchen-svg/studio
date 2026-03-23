using System.Drawing;
using Microsoft.Extensions.Configuration;

namespace OrderWatchingDesktop;

/// <summary>Emperor's — light POS shell: sidebar + live/history pages.</summary>
public sealed class MainForm : Form
{
    private readonly OrderDataService _service;
    private readonly EmperorSidebarPanel _sidebar;
    private readonly Panel _host;
    private readonly LiveOrdersPageControl _live;
    private readonly HistoryOrdersPageControl _history;
    private readonly Label _footerStatus;
    private readonly System.Windows.Forms.Timer _timer = new();
    private readonly int _pollSeconds;
    private PosPageKind _activePage = PosPageKind.Live;

    public MainForm()
    {
        Text = "Orders";
        MinimumSize = new Size(1400, 900);
        Size = new Size(1550, 980);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = EmperorPosTheme.BgMain;
        ForeColor = EmperorPosTheme.TextPrimary;
        Font = EmperorPosTheme.FontUi(10f);
        DoubleBuffered = true;

        var basePath = AppContext.BaseDirectory;
        var cfg = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        _service = new OrderDataService(cfg);
        _pollSeconds = int.TryParse(cfg.GetSection("OrderWatch")["PollSeconds"], out var ps) ? ps : 60;
        var historyPageSize = cfg.GetValue("OrderWatch:HistoryPageSize", 8);

        _sidebar = new EmperorSidebarPanel(_service.StoreUserName);
        _sidebar.SetActivePage(PosPageKind.Live);
        _sidebar.PageSelected += async (_, page) =>
        {
            try
            {
                await SwitchPageAsync(page).ConfigureAwait(true);
            }
            catch (Exception ex)
            {
                MessageBox.Show(this, ex.Message, "Orders", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        };
        _sidebar.RefreshClicked += async (_, _) =>
        {
            try
            {
                await RefreshCurrentAsync().ConfigureAwait(true);
            }
            catch (Exception ex)
            {
                MessageBox.Show(this, ex.Message, "Orders", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        };

        _live = new LiveOrdersPageControl(_service, _pollSeconds, _sidebar.SetFooterStats);
        _history = new HistoryOrdersPageControl(_service, historyPageSize, _sidebar.SetFooterStats);

        _host = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = EmperorPosTheme.BgMain,
            Padding = new Padding(0, 18, 18, 18),
        };
        _host.Controls.Add(_live);

        _footerStatus = new Label
        {
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleLeft,
            Font = EmperorPosTheme.FontUi(9f),
            ForeColor = EmperorPosTheme.TextSecondary,
            Text = "Ready",
            Padding = new Padding(28, 6, 28, 8),
        };
        var foot = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = EmperorPosTheme.BgMain,
        };
        foot.Paint += (_, e) =>
        {
            using var pen = new Pen(EmperorPosTheme.BorderWarm, 1f);
            e.Graphics.DrawLine(pen, 0, 0, foot.Width, 0);
        };
        foot.Controls.Add(_footerStatus);

        var mainGrid = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 1,
            BackColor = EmperorPosTheme.BgMain,
        };
        mainGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 300f));
        mainGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
        mainGrid.Controls.Add(_sidebar, 0, 0);
        mainGrid.Controls.Add(_host, 1, 0);

        var layout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 2,
            BackColor = EmperorPosTheme.BgMain,
        };
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 36f));
        layout.Controls.Add(mainGrid, 0, 0);
        layout.Controls.Add(foot, 0, 1);

        Controls.Add(layout);

        _timer.Interval = Math.Max(10, _pollSeconds) * 1000;
        _timer.Tick += async (_, _) =>
        {
            if (_activePage != PosPageKind.Live) return;
            try
            {
                await _live.RefreshDataAsync().ConfigureAwait(true);
                _footerStatus.Text = $"Live orders updated {DateTime.Now:T}";
            }
            catch
            {
                /* errors surfaced on manual refresh */
            }
        };
        _timer.Start();

        Shown += async (_, _) =>
        {
            try
            {
                await _live.RefreshDataAsync().ConfigureAwait(true);
                _footerStatus.Text = _service.UseSampleData
                    ? $"Demo data loaded {DateTime.Now:T}"
                    : $"Connected · live orders loaded {DateTime.Now:T}";
            }
            catch (Exception ex)
            {
                _footerStatus.Text = ex.Message;
            }
        };
    }

    private async Task SwitchPageAsync(PosPageKind page)
    {
        _activePage = page;
        _sidebar.SetActivePage(page);
        _host.Controls.Clear();

        if (page == PosPageKind.Live)
        {
            _timer.Enabled = true;
            _host.Controls.Add(_live);
            await _live.RefreshDataAsync().ConfigureAwait(true);
            _footerStatus.Text = $"Live orders · updated {DateTime.Now:T}";
        }
        else if (page == PosPageKind.History)
        {
            _timer.Enabled = false;
            _host.Controls.Add(_history);
            await _history.ReloadFromServerAndApplyAsync().ConfigureAwait(true);
            _footerStatus.Text = $"History loaded {DateTime.Now:T}";
        }
        else
        {
            throw new ArgumentOutOfRangeException(nameof(page), page, "Unknown page.");
        }
    }

    private async Task RefreshCurrentAsync()
    {
        _sidebar.RefreshButton.Enabled = false;
        try
        {
            if (_activePage == PosPageKind.Live)
            {
                await _live.RefreshDataAsync().ConfigureAwait(true);
                _footerStatus.Text = $"Live orders refreshed {DateTime.Now:T}";
            }
            else if (_activePage == PosPageKind.History)
            {
                await _history.ReloadFromServerAndApplyAsync().ConfigureAwait(true);
                _footerStatus.Text = $"History refreshed {DateTime.Now:T}";
            }
            else
            {
                throw new ArgumentOutOfRangeException(nameof(_activePage), _activePage, "Unknown page.");
            }
        }
        finally
        {
            _sidebar.RefreshButton.Enabled = true;
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            _timer.Dispose();
        base.Dispose(disposing);
    }
}
