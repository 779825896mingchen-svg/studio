using System.Drawing;
using System.Drawing.Drawing2D;
using System.Globalization;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal sealed class HistoryOrderCardControl : Control
{
    public int OrderId { get; }

    public event EventHandler<int>? ViewDetailsClicked;
    public event EventHandler<int>? OrderSelected;

    private bool _selected;
    private bool _hover;
    private bool _expanded;
    private float _expandT; // 0..1 animated

    private readonly System.Windows.Forms.Timer _animTimer = new() { Interval = 16 };

    public bool Selected
    {
        get => _selected;
        set
        {
            if (_selected == value) return;
            _selected = value;
            Invalidate();
        }
    }

    private readonly string _web;
    private readonly string _name;
    private readonly string _when;
    private readonly string _email;
    private readonly string _phone;
    private readonly string _itemsBlock;
    private readonly string _status;
    private readonly Color _statusBack;
    private readonly Color _statusFore;
    private readonly string _total;

    private static readonly Font sWeb = EmperorPosTheme.FontSemi(12f);
    private static readonly Font sWhen = EmperorPosTheme.FontUi(9.25f);
    private static readonly Font sMail = EmperorPosTheme.FontUi(9.25f);
    private static readonly Font sPhone = EmperorPosTheme.FontUi(9.25f);
    private static readonly Font sItems = EmperorPosTheme.FontUi(9f);
    private static readonly Font sTotal = EmperorPosTheme.FontSemi(13f);
    private static readonly Font sStatus = EmperorPosTheme.FontSemi(8.5f);
    private static readonly Font sExpand = EmperorPosTheme.FontUi(8.75f);

    private const int Radius = 14;
    private const int Pad = 18;
    private const int CollapsedHeight = 152;
    private const int ExpandedExtra = 118;

    public HistoryOrderCardControl(
        int orderId,
        string orderNumber,
        string customerName,
        string email,
        string phone,
        DateTime orderDate,
        string itemsSummary,
        decimal subTotal,
        decimal tax,
        int statusId)
    {
        OrderId = orderId;
        var raw = string.IsNullOrEmpty(orderNumber) ? "—" : orderNumber.Trim();
        _web = raw == "—" ? raw : (raw.StartsWith("#", StringComparison.Ordinal) ? raw : "#" + raw);
        _name = string.IsNullOrWhiteSpace(customerName) ? "Guest" : customerName.Trim();
        _when = orderDate.ToString("MM/dd/yyyy hh:mm tt", CultureInfo.CurrentCulture);
        _email = string.IsNullOrEmpty(email) ? "—" : email;
        _phone = string.IsNullOrEmpty(phone) ? "—" : phone;
        _itemsBlock = string.IsNullOrWhiteSpace(itemsSummary) ? "—" : itemsSummary.Trim();
        _status = EmperorPosTheme.StatusLabel(statusId);
        var pc = EmperorPosTheme.StatusPillColors(statusId);
        _statusBack = pc.Back;
        _statusFore = pc.Fore;
        _total = (subTotal + tax).ToString("C2", CultureInfo.CurrentCulture);

        Margin = new Padding(0, 0, 0, 14);
        Cursor = Cursors.Hand;
        BackColor = EmperorPosTheme.BgMain;
        SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
        DoubleBuffered = true;

        _animTimer.Tick += OnAnimTick;
        UpdateHeightFromAnim();
    }

    private void OnAnimTick(object? sender, EventArgs e)
    {
        const float step = 0.14f;
        if (_expanded && _expandT < 1f)
            _expandT = Math.Min(1f, _expandT + step);
        else if (!_expanded && _expandT > 0f)
            _expandT = Math.Max(0f, _expandT - step);
        else
        {
            _animTimer.Stop();
            return;
        }

        UpdateHeightFromAnim();
        Invalidate();
    }

    private void UpdateHeightFromAnim()
    {
        Height = CollapsedHeight + (int)Math.Round(ExpandedExtra * _expandT) + 8;
    }

    protected override void OnMouseEnter(EventArgs e)
    {
        base.OnMouseEnter(e);
        _hover = true;
        Invalidate();
    }

    protected override void OnMouseLeave(EventArgs e)
    {
        base.OnMouseLeave(e);
        _hover = false;
        Invalidate();
    }

    protected override void OnMouseClick(MouseEventArgs e)
    {
        base.OnMouseClick(e);
        if (e.Button != MouseButtons.Left || e.Clicks > 1) return;

        _expanded = !_expanded;
        _animTimer.Start();
        OrderSelected?.Invoke(this, OrderId);
    }

    protected override void OnMouseDoubleClick(MouseEventArgs e)
    {
        base.OnMouseDoubleClick(e);
        if (e.Button == MouseButtons.Left)
            ViewDetailsClicked?.Invoke(this, OrderId);
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        var card = new Rectangle(4, 0, Width - 8, Height - 8);

        var s = g.Save();
        try
        {
            var cx = card.X + card.Width / 2f;
            var cy = card.Y + card.Height / 2f;
            if (_hover)
            {
                g.TranslateTransform(cx, cy);
                g.ScaleTransform(1.02f, 1.02f);
                g.TranslateTransform(-cx, -cy);
            }

            EmperorDrawing.DrawCardShadow(g, card, Radius, _hover);

            using (var b = new SolidBrush(EmperorPosTheme.CardWhite))
                EmperorDrawing.FillRounded(g, b, card, Radius);

            if (_selected)
            {
                using var glow = new Pen(Color.FromArgb(220, EmperorPosTheme.OrangePrimary), 2.5f);
                EmperorDrawing.DrawRounded(g, glow, Rectangle.Inflate(card, -1, -1), Radius - 1);
            }
            else
            {
                using var border = new Pen(EmperorPosTheme.BorderWarm, 1f);
                EmperorDrawing.DrawRounded(g, border, card, Radius);
            }

            PaintCardContent(g, card);
        }
        finally
        {
            g.Restore(s);
        }
    }

    private void PaintCardContent(Graphics g, Rectangle card)
    {
        var dividerX = card.X + Math.Min(440, Math.Max(220, (int)(card.Width * 0.48f)));

        var x = card.X + Pad;
        var y = card.Y + Pad;

        var line1 = $"{_web}  {_name}";
        TextRenderer.DrawText(g, line1, sWeb, new Rectangle(x, y, dividerX - x - 12, 24), EmperorPosTheme.TextPrimary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);

        y += 26;
        TextRenderer.DrawText(g, _when, sWhen, new Rectangle(x, y, dividerX - x - 12, 20), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter);

        y += 22;
        var mailLine = "\u2709  " + _email;
        TextRenderer.DrawText(g, mailLine, sMail, new Rectangle(x, y, dividerX - x - 12, 22), EmperorPosTheme.OrangePrimary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);

        y += 24;
        var phoneLine = "\u260E  " + _phone;
        TextRenderer.DrawText(g, phoneLine, sPhone, new Rectangle(x, y, dividerX - x - 12, 22), EmperorPosTheme.TextMutedRef,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter);

        using var div = new Pen(EmperorPosTheme.BorderWarm, 1f);
        g.DrawLine(div, dividerX, card.Y + 14, dividerX, card.Bottom - 14);

        var itemsX = dividerX + 16;
        var itemsW = card.Right - Pad - 128 - itemsX;
        var compactRightCol = _expandT > 0.08f;
        var itemsH = compactRightCol
            ? 72
            : Math.Max(24, card.Bottom - card.Y - 36);
        TextRenderer.DrawText(g, _itemsBlock, sItems, new Rectangle(itemsX, card.Y + 16, itemsW, itemsH), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.WordBreak);

        var pillW = TextRenderer.MeasureText(_status, sStatus).Width + 18;
        var pillR = new Rectangle(card.Right - Pad - pillW, card.Y + 14, pillW, 22);
        using (var pb = new SolidBrush(_statusBack))
            EmperorDrawing.FillRounded(g, pb, pillR, 11);
        TextRenderer.DrawText(g, _status, sStatus, pillR, _statusFore,
            TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);

        var totSz = TextRenderer.MeasureText(_total, sTotal);
        TextRenderer.DrawText(g, _total, sTotal, new Point(card.Right - Pad - totSz.Width, card.Y + 40), EmperorPosTheme.OrangePrimary);

        if (_expandT <= 0.02f) return;

        var alpha = (int)Math.Clamp(255 * _expandT, 0, 255);
        var fade = Color.FromArgb(alpha, EmperorPosTheme.TextSecondary);
        var fadeDark = Color.FromArgb(alpha, EmperorPosTheme.TextPrimary);
        var lineC = Color.FromArgb(alpha, EmperorPosTheme.BorderWarm);

        var expandTop = card.Y + 108;
        using (var lp = new Pen(lineC, 1f))
            g.DrawLine(lp, card.X + Pad, expandTop, card.Right - Pad, expandTop);

        var hint = "Double-click for full order details";
        TextRenderer.DrawText(g, hint, sExpand,
            new Rectangle(card.X + Pad, expandTop + 8, card.Width - Pad * 2, 18),
            fade, TextFormatFlags.Left | TextFormatFlags.VerticalCenter);

        TextRenderer.DrawText(g, _itemsBlock, sItems,
            new Rectangle(card.X + Pad, expandTop + 30, card.Width - Pad * 2, card.Bottom - expandTop - 38),
            fadeDark, TextFormatFlags.Left | TextFormatFlags.WordBreak);
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _animTimer.Stop();
            _animTimer.Dispose();
        }
        base.Dispose(disposing);
    }
}
