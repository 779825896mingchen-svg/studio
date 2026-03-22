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
    private Rectangle _viewBtnRect;
    private bool _viewHover;

    private static readonly Font sWeb = EmperorPosTheme.FontSemi(11f);
    private static readonly Font sName = EmperorPosTheme.FontSemi(11f);
    private static readonly Font sBody = EmperorPosTheme.FontUi(9.25f);
    private static readonly Font sItems = EmperorPosTheme.FontUi(9f);
    private static readonly Font sTotal = EmperorPosTheme.FontSemi(12.5f);
    private static readonly Font sStatus = EmperorPosTheme.FontSemi(8.5f);
    private static readonly Font sBtn = EmperorPosTheme.FontSemi(8.75f);

    private const int Radius = 14;
    private const int Pad = 18;

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
        _web = string.IsNullOrEmpty(orderNumber) ? "—" : orderNumber;
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
        Height = 140;
        Cursor = Cursors.Hand;
        BackColor = EmperorPosTheme.BgMain;
        SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
        DoubleBuffered = true;
    }

    protected override void OnMouseMove(MouseEventArgs e)
    {
        base.OnMouseMove(e);
        var over = _viewBtnRect.Contains(e.Location);
        if (over == _viewHover) return;
        _viewHover = over;
        Invalidate();
    }

    protected override void OnMouseLeave(EventArgs e)
    {
        base.OnMouseLeave(e);
        if (!_viewHover) return;
        _viewHover = false;
        Invalidate();
    }

    protected override void OnMouseClick(MouseEventArgs e)
    {
        base.OnMouseClick(e);
        if (_viewBtnRect.Contains(e.Location))
        {
            ViewDetailsClicked?.Invoke(this, OrderId);
            return;
        }

        OrderSelected?.Invoke(this, OrderId);
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        var card = new Rectangle(4, 0, Width - 8, Height - 8);
        EmperorDrawing.DrawCardShadow(g, card, Radius);
        using (var b = new SolidBrush(EmperorPosTheme.CardWhite))
            EmperorDrawing.FillRounded(g, b, card, Radius);
        using var border = new Pen(EmperorPosTheme.BorderWarm, 1f);
        EmperorDrawing.DrawRounded(g, border, card, Radius);

        var x = card.X + Pad;
        var y = card.Y + Pad;
        var midSplit = (int)(card.Width * 0.42) + card.X;

        TextRenderer.DrawText(g, _web, sWeb, new Rectangle(x, y, midSplit - x - 8, 22), EmperorPosTheme.TextPrimary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);
        var webW = TextRenderer.MeasureText(_web, sWeb).Width + 14;
        TextRenderer.DrawText(g, _name, sName, new Rectangle(x + webW, y, midSplit - x - webW - 8, 22), EmperorPosTheme.TextPrimary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);

        y += 26;
        TextRenderer.DrawText(g, _when, sBody, new Rectangle(x, y, midSplit - x, 20), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter);
        y += 22;
        TextRenderer.DrawText(g, _email, sBody, new Rectangle(x, y, midSplit - x, 20), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.EndEllipsis);
        y += 22;
        TextRenderer.DrawText(g, _phone, sBody, new Rectangle(x, y, midSplit - x, 20), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.VerticalCenter);

        using var div = new Pen(EmperorPosTheme.BorderWarm, 1f);
        g.DrawLine(div, midSplit, card.Y + 16, midSplit, card.Bottom - 16);

        var itemsX = midSplit + 16;
        var itemsW = card.Right - Pad - 120 - itemsX;
        TextRenderer.DrawText(g, _itemsBlock, sItems, new Rectangle(itemsX, card.Y + 16, itemsW, card.Height - 52), EmperorPosTheme.TextSecondary,
            TextFormatFlags.Left | TextFormatFlags.WordBreak);

        var pillW = TextRenderer.MeasureText(_status, sStatus).Width + 18;
        var pillR = new Rectangle(card.Right - Pad - pillW, card.Y + 14, pillW, 22);
        using (var pb = new SolidBrush(_statusBack))
            EmperorDrawing.FillRounded(g, pb, pillR, 11);
        TextRenderer.DrawText(g, _status, sStatus, pillR, _statusFore,
            TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);

        var totSz = TextRenderer.MeasureText(_total, sTotal);
        TextRenderer.DrawText(g, _total, sTotal, new Point(card.Right - Pad - totSz.Width, card.Y + 40), EmperorPosTheme.TextPrimary);

        _viewBtnRect = new Rectangle(card.Right - Pad - 118, card.Bottom - 42, 118, 36);
        EmperorButtonChrome.PaintCompactPrimary(g, _viewBtnRect, "View Details", "Full summary", _viewHover);
    }
}
