using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal sealed class EmperorSidebarPanel : Panel
{
    private readonly Button _tabLive;
    private readonly Button _tabHistory;
    private readonly Label _footerStats;
    private PosPageKind _active = PosPageKind.Live;

    public Button RefreshButton { get; }

    public event EventHandler<PosPageKind>? PageSelected;
    public event EventHandler? RefreshClicked;

    public EmperorSidebarPanel(string storeUserDisplay)
    {
        MinimumSize = new Size(300, 400);
        Dock = DockStyle.Fill;
        BackColor = EmperorPosTheme.BgMain;
        Padding = new Padding(18, 18, 14, 18);
        AutoScroll = true;

        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 8,
            BackColor = EmperorPosTheme.BgMain,
        };
        root.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 160f));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 50f));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 50f));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 54f));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));

        var title = new Label
        {
            Text = "Orders",
            Font = EmperorPosTheme.FontSemi(29f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Margin = new Padding(8, 4, 0, 0),
        };

        var sub = new Label
        {
            Text = $"Live Store Feed  ·  {storeUserDisplay}",
            Font = EmperorPosTheme.FontUi(13f),
            ForeColor = EmperorPosTheme.TextMutedRef,
            AutoSize = true,
            Margin = new Padding(10, 0, 0, 8),
        };

        var storeCard = new Panel
        {
            Dock = DockStyle.Fill,
            Margin = new Padding(8, 0, 8, 8),
            BackColor = EmperorPosTheme.CardWhite,
        };
        storeCard.Paint += (_, e) =>
        {
            OrdersUiDrawing.DrawCardBackground(e.Graphics, storeCard.ClientRectangle, 18, EmperorPosTheme.CardWhite, EmperorPosTheme.BorderWarm);
        };
        var emp = new Label
        {
            Text = "Emperor's",
            Font = EmperorPosTheme.FontUi(17f),
            ForeColor = EmperorPosTheme.TextMutedRef,
            AutoSize = true,
            Location = new Point(18, 18),
            BackColor = Color.Transparent,
        };
        var sto = new Label
        {
            Text = "Store orders",
            Font = EmperorPosTheme.FontSemi(22f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Location = new Point(18, 50),
            BackColor = Color.Transparent,
        };
        storeCard.Controls.Add(emp);
        storeCard.Controls.Add(sto);

        _tabLive = OrdersUiDrawing.CreateNavButton("Live orders", new Rectangle(0, 0, 280, 50), (_, _) => SelectPage(PosPageKind.Live));
        _tabLive.Margin = new Padding(8, 0, 8, 8);
        _tabLive.Dock = DockStyle.Fill;

        _tabHistory = OrdersUiDrawing.CreateNavButton("History", new Rectangle(0, 0, 280, 50), (_, _) => SelectPage(PosPageKind.History));
        _tabHistory.Margin = new Padding(8, 0, 8, 8);
        _tabHistory.Dock = DockStyle.Fill;

        RefreshButton = OrdersUiDrawing.CreateActionButton(
            "↻  Refresh",
            new Rectangle(0, 0, 280, 54),
            EmperorPosTheme.OrangePrimary,
            Color.White,
            12);
        RefreshButton.Margin = new Padding(8, 8, 8, 8);
        RefreshButton.Dock = DockStyle.Fill;
        RefreshButton.Click += (_, _) => RefreshClicked?.Invoke(this, EventArgs.Empty);

        _footerStats = new Label
        {
            Text = "",
            Font = EmperorPosTheme.FontUi(13f),
            ForeColor = EmperorPosTheme.TextMutedRef,
            AutoSize = true,
            Margin = new Padding(10, 4, 0, 8),
        };

        root.Controls.Add(title, 0, 0);
        root.Controls.Add(sub, 0, 1);
        root.Controls.Add(storeCard, 0, 2);
        root.Controls.Add(_tabLive, 0, 3);
        root.Controls.Add(_tabHistory, 0, 4);
        root.Controls.Add(new Panel { Dock = DockStyle.Fill, BackColor = EmperorPosTheme.BgMain }, 0, 5);
        root.Controls.Add(RefreshButton, 0, 6);
        root.Controls.Add(_footerStats, 0, 7);

        Controls.Add(root);
        SetActivePage(PosPageKind.Live);
    }

    public void SetActivePage(PosPageKind page)
    {
        _active = page;
        OrdersUiDrawing.StyleNavButton(_tabLive, page == PosPageKind.Live);
        OrdersUiDrawing.StyleNavButton(_tabHistory, page == PosPageKind.History);
    }

    public void SetFooterStats(string text)
    {
        _footerStats.Text = text;
    }

    private void SelectPage(PosPageKind page)
    {
        if (_active == page) return;
        SetActivePage(page);
        PageSelected?.Invoke(this, page);
    }
}

/// <summary>White card with rounded region and light border (toolbars, etc.).</summary>
internal sealed class RoundedCardPanel : Panel
{
    private readonly int _radius;

    public RoundedCardPanel(int radius = 12)
    {
        _radius = radius;
        BackColor = EmperorPosTheme.CardWhite;
        EmperorDrawing.EnableDoubleBuffer(this);
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var r = ClientRectangle;
        r.Inflate(-1, -1);
        using var border = new Pen(EmperorPosTheme.BorderWarm, 1f);
        EmperorDrawing.DrawRounded(g, border, r, _radius);
    }

    protected override void OnSizeChanged(EventArgs e)
    {
        base.OnSizeChanged(e);
        using var path = EmperorDrawing.RoundedRect(
            new Rectangle(0, 0, Width - 1, Height - 1), _radius);
        Region = new Region(path);
    }
}
