using System.Drawing;
using System.Drawing.Drawing2D;
using System.Globalization;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal sealed class LiveOrderCardControl : Control
{
    private bool _expanded = true;
    private bool _selected;

    public int OrderId { get; }

    public bool Expanded
    {
        get => _expanded;
        set
        {
            if (_expanded == value) return;
            _expanded = value;
            UpdateHeight();
            Invalidate();
        }
    }

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

    public event EventHandler<int>? OrderSelected;

    private readonly string _webNum;
    private readonly string _total;
    private readonly string _status;
    private readonly Color _statusBack;
    private readonly Color _statusFore;
    private readonly string _name;
    private readonly string _when;
    private readonly string _email;
    private readonly string _pickup;
    private readonly string _phone;
    private readonly string _itemsPreview;

    private static readonly Font sWeb = EmperorPosTheme.FontSemi(11.5f);
    private static readonly Font sAmt = EmperorPosTheme.FontSemi(13f);
    private static readonly Font sStatus = EmperorPosTheme.FontSemi(8.5f);
    private static readonly Font sName = EmperorPosTheme.FontSemi(10.5f);
    private static readonly Font sBody = EmperorPosTheme.FontUi(9.25f);
    private static readonly Font sSmall = EmperorPosTheme.FontUi(8.75f);
    private static readonly Font sArrow = EmperorPosTheme.FontSemi(11f);

    private const int Pad = 16;
    private const int Radius = 14;
    private const int ArrowBox = 32;

    public LiveOrderCardControl(
        int orderId,
        string orderNumber,
        string customerName,
        string email,
        DateTime orderDate,
        string pickup,
        string phone,
        string itemsPreview,
        decimal subTotal,
        decimal tax,
        int statusId)
    {
        OrderId = orderId;
        _webNum = string.IsNullOrEmpty(orderNumber) ? "—" : orderNumber.StartsWith("#", StringComparison.Ordinal) ? orderNumber : "#" + orderNumber;
        var total = subTotal + tax;
        _total = total.ToString("C2", CultureInfo.CurrentCulture);
        _status = EmperorPosTheme.StatusLabel(statusId);
        var pill = EmperorPosTheme.StatusPillColors(statusId);
        _statusBack = pill.Back;
        _statusFore = pill.Fore;
        _name = string.IsNullOrWhiteSpace(customerName) ? "Guest" : customerName.Trim();
        _when = orderDate.ToString("dddd, MMMM d, yyyy h:mm tt", CultureInfo.CurrentCulture);
        _email = string.IsNullOrEmpty(email) ? "—" : email;
        _pickup = string.IsNullOrEmpty(pickup) ? "—" : pickup;
        _phone = string.IsNullOrEmpty(phone) ? "—" : phone;
        _itemsPreview = string.IsNullOrWhiteSpace(itemsPreview) ? "—" : itemsPreview.Trim();

        Margin = new Padding(0, 0, 0, 14);
        Cursor = Cursors.Hand;
        BackColor = EmperorPosTheme.BgMain;
        SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
        DoubleBuffered = true;
        UpdateHeight();
    }

    private void UpdateHeight()
    {
        Height = _expanded ? 248 : 96;
    }

    protected override void OnMouseClick(MouseEventArgs e)
    {
        base.OnMouseClick(e);
        var card = CardRect();
        var arrowR = new Rectangle(card.X + Pad, card.Y + Pad, ArrowBox, ArrowBox);
        if (arrowR.Contains(e.Location))
        {
            Expanded = !Expanded;
            return;
        }

        OrderSelected?.Invoke(this, OrderId);
    }

    private Rectangle CardRect()
    {
        return new Rectangle(4, 0, Width - 8, Height - 8);
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        var card = CardRect();
        EmperorDrawing.DrawCardShadow(g, card, Radius);

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

        var arrowR = new Rectangle(card.X + Pad, card.Y + Pad, ArrowBox, ArrowBox);
        using (var ab = new SolidBrush(EmperorPosTheme.InputBg))
            EmperorDrawing.FillRounded(g, ab, arrowR, 8);
        using (var ap = new Pen(EmperorPosTheme.BorderWarm, 1f))
            EmperorDrawing.DrawRounded(g, ap, arrowR, 8);
        var arrow = _expanded ? "▼" : "▶";
        TextRenderer.DrawText(g, arrow, sArrow, arrowR, EmperorPosTheme.TextPrimary,
            TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);

        var xLeft = arrowR.Right + 10;
        var xRight = card.Right - Pad;
        var y = card.Y + Pad + 2;

        TextRenderer.DrawText(g, _webNum, sWeb, new Rectangle(xLeft, y, xRight - xLeft - 120, 24), EmperorPosTheme.TextPrimary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);

        var szAmt = TextRenderer.MeasureText(_total, sAmt);
        TextRenderer.DrawText(g, _total, sAmt, new Point(xRight - szAmt.Width, y - 2), EmperorPosTheme.TextPrimary);

        var pillW = TextRenderer.MeasureText(_status, sStatus).Width + 18;
        var pillR = new Rectangle(xRight - pillW, y + 26, pillW, 22);
        using (var pb = new SolidBrush(_statusBack))
            EmperorDrawing.FillRounded(g, pb, pillR, 11);
        TextRenderer.DrawText(g, _status, sStatus, pillR, _statusFore,
            TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);

        if (!_expanded)
            return;

        y = arrowR.Bottom + 10;
        TextRenderer.DrawText(g, _name, sName, new Rectangle(xLeft, y, card.Width - Pad * 2, 22), EmperorPosTheme.TextPrimary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter);
        y += 24;
        TextRenderer.DrawText(g, _when, sBody, new Rectangle(xLeft, y, card.Width - Pad * 2, 20), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter);
        y += 22;
        TextRenderer.DrawText(g, _email, sBody, new Rectangle(xLeft, y, card.Width - Pad * 2, 20), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.EndEllipsis);
        y += 22;
        TextRenderer.DrawText(g, $"Pickup: {_pickup}", sBody, new Rectangle(xLeft, y, card.Width - Pad * 2, 20), EmperorPosTheme.TextPrimary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter);
        y += 22;
        TextRenderer.DrawText(g, $"Phone: {_phone}", sBody, new Rectangle(xLeft, y, card.Width - Pad * 2, 20), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter);
        y += 26;

        using var line = new Pen(EmperorPosTheme.BorderWarm, 1f);
        g.DrawLine(line, xLeft, y, xRight, y);
        y += 12;

        TextRenderer.DrawText(g, _itemsPreview, sSmall, new Rectangle(xLeft, y, card.Width - Pad * 2, card.Bottom - y - 8), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.WordBreak);
    }
}
