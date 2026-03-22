using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

/// <summary>Visual styles for premium POS buttons (custom paint — sharp ClearType + optional two-line "rich" caption).</summary>
internal enum EmperorRichButtonStyle
{
    /// <summary>Orange gradient, white text, soft shadow.</summary>
    PrimaryAction,
    /// <summary>Orange fill, white text (sidebar tab selected).</summary>
    NavActive,
    /// <summary>Light fill, dark text, warm border (sidebar tab).</summary>
    NavIdle,
    /// <summary>White card, border, dark text (Filter, secondary).</summary>
    OutlineAccent,
    /// <summary>Compact pagination arrow / page chip idle.</summary>
    Pagination,
    /// <summary>Orange chip, white text.</summary>
    PaginationActive,
}

/// <summary>
/// Custom button with anti-aliased geometry, optional subtitle line (semibold + muted body = rich typography),
/// and hover/press states. Not literal RTF — uses two fonts for a crisp dashboard look.
/// </summary>
internal sealed class EmperorRichButton : Control
{
    private bool _hover;
    private bool _pressed;
    private string _caption = "";
    private string _subCaption = "";

    public string Caption
    {
        get => _caption;
        set
        {
            _caption = value ?? "";
            Invalidate();
        }
    }

    /// <summary>Second line — smaller, secondary color (empty hides the line).</summary>
    public string SubCaption
    {
        get => _subCaption;
        set
        {
            _subCaption = value ?? "";
            Invalidate();
        }
    }

    public EmperorRichButtonStyle VisualStyle { get; set; } = EmperorRichButtonStyle.PrimaryAction;

    /// <summary>When true, caption block is left-aligned with padding; otherwise centered.</summary>
    public bool LeftAlignContent { get; set; }

    public int ContentPaddingLeft { get; set; } = 20;

    /// <summary>When set, used as the flat color under rounded corners (avoids dark AA fringes).</summary>
    public Color? ChromeBackgroundOverride { get; set; }

    public EmperorRichButton()
    {
        SetStyle(
            ControlStyles.AllPaintingInWmPaint |
            ControlStyles.OptimizedDoubleBuffer |
            ControlStyles.UserPaint |
            ControlStyles.ResizeRedraw |
            ControlStyles.Selectable |
            ControlStyles.StandardClick |
            ControlStyles.StandardDoubleClick,
            true);
        TabStop = true;
        Cursor = Cursors.Hand;
        ForeColor = EmperorPosTheme.TextPrimary;
        BackColor = EmperorPosTheme.BgMain;
        Font = EmperorPosTheme.FontSemi(10.5f);
    }

    /// <summary>Opaque color behind the control: matches first non-transparent parent, else theme.</summary>
    private Color ResolveChromeBackground()
    {
        if (ChromeBackgroundOverride.HasValue)
            return ChromeBackgroundOverride.Value;

        for (Control? p = Parent; p != null; p = p.Parent)
        {
            var c = p.BackColor;
            if (c.A == 255 && c != Color.Transparent)
                return c;
        }

        return EmperorPosTheme.BgMain;
    }

    protected override void OnParentChanged(EventArgs e)
    {
        base.OnParentChanged(e);
        Invalidate();
    }

    protected override void OnMouseEnter(EventArgs e)
    {
        base.OnMouseEnter(e);
        if (!Enabled) return;
        _hover = true;
        Invalidate();
    }

    protected override void OnMouseLeave(EventArgs e)
    {
        base.OnMouseLeave(e);
        _hover = false;
        _pressed = false;
        Invalidate();
    }

    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e);
        if (!Enabled || e.Button != MouseButtons.Left) return;
        _pressed = true;
        Invalidate();
    }

    protected override void OnMouseUp(MouseEventArgs e)
    {
        base.OnMouseUp(e);
        _pressed = false;
        Invalidate();
    }

    protected override void OnEnabledChanged(EventArgs e)
    {
        base.OnEnabledChanged(e);
        Cursor = Enabled ? Cursors.Hand : Cursors.Default;
        Invalidate();
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        // Fill buffer with real background first — transparent / default buffer causes black AA halos on curves.
        g.Clear(ResolveChromeBackground());
        g.SmoothingMode = SmoothingMode.AntiAlias;

        var isChip = VisualStyle is EmperorRichButtonStyle.Pagination or EmperorRichButtonStyle.PaginationActive;
        // Small chips: half-pixel alignment reduces dark AA at edges; ClearType fringes on non-white fills.
        g.PixelOffsetMode = isChip ? PixelOffsetMode.Half : PixelOffsetMode.HighQuality;
        g.TextRenderingHint = isChip ? TextRenderingHint.AntiAlias : TextRenderingHint.ClearTypeGridFit;

        var rect = ClientRectangle;
        // Leave a 2px inset on tiny pagination controls so stroke AA doesn't clip to black at the HWND edge.
        var r = isChip ? Rectangle.Inflate(rect, -2, -2) : Rectangle.Inflate(rect, -1, -1);
        var radius = isChip ? 8 : 12;

        if (VisualStyle == EmperorRichButtonStyle.PrimaryAction && Enabled)
        {
            var shadowR = r;
            shadowR.Offset(0, 2);
            // Warm-tinted shadow (not pure RGB black) reads softer on cream backgrounds.
            using var sh = new SolidBrush(Color.FromArgb(14, 0x3A, 0x34, 0x2E));
            EmperorDrawing.FillRounded(g, sh, shadowR, radius);
        }

        var fill = GetFillRect(r, radius);
        DrawBackground(g, fill, radius);
        DrawBorder(g, fill, radius);
        DrawCaptionBlock(g, fill);

        if (Focused && Enabled)
        {
            var fr = Rectangle.Inflate(rect, -3, -3);
            ControlPaint.DrawFocusRectangle(g, fr);
        }
    }

    private Rectangle GetFillRect(Rectangle r, int radius)
    {
        if (!_pressed || !Enabled) return r;
        return Rectangle.Inflate(r, -1, -1);
    }

    private void DrawBackground(Graphics g, Rectangle r, int radius)
    {
        if (!Enabled)
        {
            using var b = new SolidBrush(Color.FromArgb(245, 242, 238));
                EmperorDrawing.FillRounded(g, b, r, radius);
            return;
        }

        switch (VisualStyle)
        {
            case EmperorRichButtonStyle.PrimaryAction:
            {
                var top = EmperorPosTheme.OrangePrimary;
                var bottom = _hover ? EmperorPosTheme.OrangeHover : EmperorPosTheme.OrangePrimary;
                if (_pressed)
                {
                    top = EmperorPosTheme.OrangeHover;
                    bottom = Color.FromArgb(0xC5, 0x55, 0x00);
                }

                using var br = new LinearGradientBrush(
                    r,
                    Color.FromArgb(255, Math.Min(255, top.R + 18), Math.Min(255, top.G + 35), Math.Min(255, top.B + 28)),
                    bottom,
                    LinearGradientMode.Vertical);
                EmperorDrawing.FillRounded(g, br, r, radius);

                // subtle top highlight
                var gloss = new Rectangle(r.X + 2, r.Y + 2, r.Width - 4, Math.Max(4, r.Height / 3));
                using var gb = new LinearGradientBrush(
                    gloss,
                    Color.FromArgb(55, 255, 255, 255),
                    Color.FromArgb(0, 255, 255, 255),
                    LinearGradientMode.Vertical);
                using var path = EmperorDrawing.RoundedRect(gloss, Math.Max(2, radius - 4));
                g.SetClip(path);
                g.FillRectangle(gb, gloss);
                g.ResetClip();
                break;
            }
            case EmperorRichButtonStyle.NavActive:
            {
                var baseC = _hover ? EmperorPosTheme.OrangeHover : EmperorPosTheme.OrangePrimary;
                if (_pressed) baseC = Color.FromArgb(0xD0, 0x62, 0x00);
                using var b = new SolidBrush(baseC);
                EmperorDrawing.FillRounded(g, b, r, radius);
                break;
            }
            case EmperorRichButtonStyle.NavIdle:
            {
                var bg = _hover ? EmperorPosTheme.InputBg : EmperorPosTheme.SidebarMutedBg;
                if (_pressed) bg = Color.FromArgb(0xF0, 0xE8, 0xE0);
                using var b = new SolidBrush(bg);
                EmperorDrawing.FillRounded(g, b, r, radius);
                break;
            }
            case EmperorRichButtonStyle.OutlineAccent:
            {
                var bg = _hover
                    ? Color.FromArgb(0xFF, 0xF5, 0xEB)
                    : EmperorPosTheme.CardWhite;
                if (_pressed) bg = Color.FromArgb(0xFF, 0xED, 0xE0);
                using var b = new SolidBrush(bg);
                EmperorDrawing.FillRounded(g, b, r, radius);
                break;
            }
            case EmperorRichButtonStyle.Pagination:
            {
                var bg = _hover ? EmperorPosTheme.InputBg : EmperorPosTheme.CardWhite;
                using var b = new SolidBrush(bg);
                EmperorDrawing.FillRounded(g, b, r, radius);
                break;
            }
            case EmperorRichButtonStyle.PaginationActive:
            {
                var c = _hover ? EmperorPosTheme.OrangeHover : EmperorPosTheme.OrangePrimary;
                using var b = new SolidBrush(c);
                EmperorDrawing.FillRounded(g, b, r, radius);
                break;
            }
        }
    }

    private void DrawBorder(Graphics g, Rectangle r, int radius)
    {
        if (VisualStyle is EmperorRichButtonStyle.PrimaryAction or EmperorRichButtonStyle.NavActive)
        {
            var edge = Color.FromArgb(90, EmperorPosTheme.OrangeHover);
            using var p = new Pen(edge, 1f);
            EmperorDrawing.DrawRounded(g, p, r, radius);
            return;
        }

        if (VisualStyle is EmperorRichButtonStyle.Pagination or EmperorRichButtonStyle.PaginationActive)
        {
            // Hairline border blended toward fill — avoids harsh dark pixels from 1px DrawPath AA at control bounds.
            var edge = VisualStyle == EmperorRichButtonStyle.PaginationActive && Enabled
                ? Color.FromArgb(0xE0, EmperorPosTheme.OrangeHover)
                : EmperorPosTheme.BorderWarm;
            using var p = new Pen(edge, 1f) { LineJoin = LineJoin.Round };
            EmperorDrawing.DrawRounded(g, p, r, radius);
            return;
        }

        using var pen = new Pen(
            _hover ? Color.FromArgb(0xD4, 0xC4, 0xB4) : EmperorPosTheme.BorderWarm,
            1f);
        EmperorDrawing.DrawRounded(g, pen, r, radius);
    }

    private void DrawCaptionBlock(Graphics g, Rectangle r)
    {
        var hasSub = !string.IsNullOrWhiteSpace(SubCaption)
                     && VisualStyle is not EmperorRichButtonStyle.Pagination
                         and not EmperorRichButtonStyle.PaginationActive;

        using var fontTitle = CreateTitleFont();
        using var fontSub = EmperorPosTheme.FontUi(8.75f);

        Color titleColor;
        Color subColor;
        if (!Enabled)
        {
            titleColor = EmperorPosTheme.TextSecondary;
            subColor = EmperorPosTheme.TextSecondary;
        }
        else if (VisualStyle is EmperorRichButtonStyle.PrimaryAction
                 or EmperorRichButtonStyle.NavActive
                 or EmperorRichButtonStyle.PaginationActive)
        {
            titleColor = Color.White;
            subColor = Color.FromArgb(235, 255, 255, 255);
        }
        else
        {
            titleColor = EmperorPosTheme.TextPrimary;
            subColor = EmperorPosTheme.TextSecondary;
        }

        if (!hasSub)
        {
            var pad = LeftAlignContent ? ContentPaddingLeft : 4;
            var textR = LeftAlignContent
                ? new Rectangle(r.X + pad, r.Y, r.Width - pad - 8, r.Height)
                : new Rectangle(r.X + 4, r.Y, r.Width - 8, r.Height);
            var f = TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis | TextFormatFlags.SingleLine;
            f |= LeftAlignContent ? TextFormatFlags.Left : TextFormatFlags.HorizontalCenter;
            TextRenderer.DrawText(g, Caption, fontTitle, textR, titleColor, f);
            return;
        }

        // Two-line block, vertically centered as a group
        var titleH = TextRenderer.MeasureText(Caption, fontTitle, Size.Empty, TextFormatFlags.SingleLine).Height;
        var subH = TextRenderer.MeasureText(SubCaption, fontSub, Size.Empty, TextFormatFlags.SingleLine).Height;
        var gap = 2;
        var blockH = titleH + gap + subH;
        var y0 = r.Y + (r.Height - blockH) / 2;

        var left = LeftAlignContent ? r.X + ContentPaddingLeft : r.X + 8;
        var w = LeftAlignContent ? r.Width - ContentPaddingLeft - 12 : r.Width - 16;
        var titleR = new Rectangle(left, y0, w, titleH);
        var subR = new Rectangle(left, y0 + titleH + gap, w, subH);

        var tfLeft = TextFormatFlags.Left | TextFormatFlags.EndEllipsis | TextFormatFlags.Top;
        var tfCenter = TextFormatFlags.HorizontalCenter | TextFormatFlags.Top | TextFormatFlags.EndEllipsis;

        if (LeftAlignContent)
        {
            TextRenderer.DrawText(g, Caption, fontTitle, titleR, titleColor, tfLeft);
            TextRenderer.DrawText(g, SubCaption, fontSub, subR, subColor, tfLeft);
        }
        else
        {
            TextRenderer.DrawText(g, Caption, fontTitle, titleR, titleColor, tfCenter);
            TextRenderer.DrawText(g, SubCaption, fontSub, subR, subColor, tfCenter);
        }
    }

    private Font CreateTitleFont() =>
        VisualStyle switch
        {
            EmperorRichButtonStyle.PrimaryAction => EmperorPosTheme.FontSemi(11.25f),
            EmperorRichButtonStyle.Pagination or EmperorRichButtonStyle.PaginationActive => EmperorPosTheme.FontSemi(9.75f),
            _ => EmperorPosTheme.FontSemi(10.5f),
        };

    protected override void OnPaintBackground(PaintEventArgs pevent)
    {
        /* fully custom */
    }
}

/// <summary>Shared drawing for inline chip buttons (e.g. history card <c>View Details</c>).</summary>
internal static class EmperorButtonChrome
{
    public static void PaintCompactPrimary(
        Graphics g,
        Rectangle r,
        string caption,
        string? subCaption,
        bool hover,
        int radius = 9)
    {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;

        // Erase chip area with card color so anti-aliased edges never blend to black.
        var wipe = Rectangle.Inflate(r, 3, 4);
        using (var wipeB = new SolidBrush(EmperorPosTheme.CardWhite))
            g.FillRectangle(wipeB, wipe);

        var shadow = r;
        shadow.Offset(0, 1);
        using (var sh = new SolidBrush(Color.FromArgb(12, 0x3A, 0x34, 0x2E)))
            EmperorDrawing.FillRounded(g, sh, shadow, radius);

        var top = EmperorPosTheme.OrangePrimary;
        var bottom = hover ? EmperorPosTheme.OrangeHover : EmperorPosTheme.OrangePrimary;
        using (var br = new LinearGradientBrush(
                   r,
                   Color.FromArgb(255, Math.Min(255, top.R + 22), Math.Min(255, top.G + 38), Math.Min(255, top.B + 30)),
                   bottom,
                   LinearGradientMode.Vertical))
            EmperorDrawing.FillRounded(g, br, r, radius);

        using var edge = new Pen(Color.FromArgb(100, EmperorPosTheme.OrangeHover), 1f);
        EmperorDrawing.DrawRounded(g, edge, r, radius);

        using var fontTitle = EmperorPosTheme.FontSemi(8.85f);
        using var fontSub = EmperorPosTheme.FontUi(7.5f);

        if (string.IsNullOrWhiteSpace(subCaption))
        {
            TextRenderer.DrawText(g, caption, fontTitle, r, Color.White,
                TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.SingleLine | TextFormatFlags.EndEllipsis);
            return;
        }

        var th = TextRenderer.MeasureText(caption, fontTitle, Size.Empty, TextFormatFlags.SingleLine).Height;
        var sh2 = TextRenderer.MeasureText(subCaption, fontSub, Size.Empty, TextFormatFlags.SingleLine).Height;
        const int gap = 1;
        var block = th + gap + sh2;
        var y0 = r.Y + (r.Height - block) / 2;
        var textR = new Rectangle(r.X + 4, y0, r.Width - 8, th);
        TextRenderer.DrawText(g, caption, fontTitle, textR, Color.White,
            TextFormatFlags.HorizontalCenter | TextFormatFlags.Top | TextFormatFlags.SingleLine | TextFormatFlags.EndEllipsis);
        var subR = new Rectangle(r.X + 4, y0 + th + gap, r.Width - 8, sh2);
        TextRenderer.DrawText(g, subCaption, fontSub, subR, Color.FromArgb(240, 255, 255, 255),
            TextFormatFlags.HorizontalCenter | TextFormatFlags.Top | TextFormatFlags.SingleLine | TextFormatFlags.EndEllipsis);
    }
}
