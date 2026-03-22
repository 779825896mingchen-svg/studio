using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal sealed class EmperorSidebarPanel : Panel
{
    private readonly Label _title;
    private readonly Label _subtitle;
    private readonly Panel _storeCard;
    private readonly EmperorRichButton _tabLive;
    private readonly EmperorRichButton _tabHistory;
    private readonly Label _footerStats;
    private PosPageKind _active = PosPageKind.Live;

    public EmperorRichButton RefreshButton { get; }

    public event EventHandler<PosPageKind>? PageSelected;
    public event EventHandler? RefreshClicked;

    public EmperorSidebarPanel(string storeUserDisplay)
    {
        MinimumSize = new Size(260, 400);
        Dock = DockStyle.Fill;
        BackColor = EmperorPosTheme.BgMain;
        Padding = new Padding(20, 24, 16, 20);
        AutoScroll = true;

        _title = new Label
        {
            Text = "Orders",
            Font = EmperorPosTheme.FontSemi(22f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Location = new Point(0, 0),
        };

        _subtitle = new Label
        {
            Text = $"Live Store Feed · {storeUserDisplay}",
            Font = EmperorPosTheme.FontUi(9.5f),
            ForeColor = EmperorPosTheme.TextSecondary,
            AutoSize = true,
            Location = new Point(0, 36),
        };

        _storeCard = new RoundedCardPanel(14)
        {
            Location = new Point(0, 78),
            Size = new Size(252, 88),
            BackColor = EmperorPosTheme.CardWhite,
        };
        var storeName = new Label
        {
            Text = "Emperor's",
            Font = EmperorPosTheme.FontSemi(14f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Location = new Point(18, 14),
        };
        var storeSub = new Label
        {
            Text = "Store orders",
            Font = EmperorPosTheme.FontUi(10f),
            ForeColor = EmperorPosTheme.TextSecondary,
            AutoSize = true,
            Location = new Point(18, 42),
        };
        _storeCard.Controls.Add(storeName);
        _storeCard.Controls.Add(storeSub);

        const int tabH = 56;
        const int tabGap = 8;

        _tabLive = MakeNavTab("Live orders", "Web store queue", true);
        _tabLive.Location = new Point(0, 186);
        _tabLive.Height = tabH;
        _tabLive.Click += (_, _) => SelectPage(PosPageKind.Live);

        _tabHistory = MakeNavTab("History", "Completed orders", false);
        _tabHistory.Location = new Point(0, 186 + tabH + tabGap);
        _tabHistory.Height = tabH;
        _tabHistory.Click += (_, _) => SelectPage(PosPageKind.History);

        var refreshTop = 186 + (tabH + tabGap) * 2 + 12;
        RefreshButton = new EmperorRichButton
        {
            Caption = "Refresh",
            SubCaption = "Sync latest from server",
            VisualStyle = EmperorRichButtonStyle.PrimaryAction,
            Height = 58,
            Location = new Point(0, refreshTop),
            TabIndex = 100,
        };
        RefreshButton.Click += (_, _) => RefreshClicked?.Invoke(this, EventArgs.Empty);

        var footerTop = refreshTop + 58 + 10;
        _footerStats = new Label
        {
            Text = "",
            Font = EmperorPosTheme.FontUi(8.75f),
            ForeColor = EmperorPosTheme.TextSecondary,
            AutoSize = false,
            Size = new Size(252, 44),
            Location = new Point(0, footerTop),
        };

        Controls.Add(_title);
        Controls.Add(_subtitle);
        Controls.Add(_storeCard);
        Controls.Add(_tabLive);
        Controls.Add(_tabHistory);
        Controls.Add(RefreshButton);
        Controls.Add(_footerStats);

        Resize += (_, _) => LayoutSidebar();
        LayoutSidebar();
    }

    public void SetActivePage(PosPageKind page)
    {
        _active = page;
        ApplyNavStyle(_tabLive, page == PosPageKind.Live);
        ApplyNavStyle(_tabHistory, page == PosPageKind.History);
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

    private void LayoutSidebar()
    {
        var w = Math.Max(220, ClientSize.Width - Padding.Horizontal);
        _storeCard.Width = w;
        _tabLive.Width = w;
        _tabHistory.Width = w;
        RefreshButton.Width = w;
        _footerStats.Width = w;
    }

    private static EmperorRichButton MakeNavTab(string caption, string sub, bool active)
    {
        var b = new EmperorRichButton
        {
            Caption = caption,
            SubCaption = sub,
            LeftAlignContent = true,
            ContentPaddingLeft = 20,
            TabStop = false,
        };
        ApplyNavStyle(b, active);
        return b;
    }

    private static void ApplyNavStyle(EmperorRichButton b, bool active)
    {
        b.VisualStyle = active ? EmperorRichButtonStyle.NavActive : EmperorRichButtonStyle.NavIdle;
        b.Invalidate();
    }
}

/// <summary>White card with rounded region and light border.</summary>
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
