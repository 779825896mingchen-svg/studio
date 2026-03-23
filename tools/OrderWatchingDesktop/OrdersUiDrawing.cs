using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

/// <summary>Rounded panels + painted buttons matching the reference single-file Orders dashboard.</summary>
internal static class OrdersUiDrawing
{
    /// <summary>Capsule / pill shape: corners follow a semicircle on the short side (fully rounded ends).</summary>
    public static int PillCornerRadius(Rectangle bounds) =>
        Math.Max(1, Math.Min(bounds.Width, bounds.Height) / 2);

    public static GraphicsPath RoundedPath(Rectangle rect, int radius)
    {
        var path = new GraphicsPath();
        if (radius <= 0)
        {
            path.AddRectangle(rect);
            return path;
        }

        // Clamp so arcs fit inside the rectangle (avoids corner glitches).
        var r = Math.Min(radius, Math.Min(rect.Width, rect.Height) / 2);
        if (r <= 0)
        {
            path.AddRectangle(rect);
            return path;
        }

        var d = r * 2;
        path.AddArc(rect.X, rect.Y, d, d, 180, 90);
        path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90);
        path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90);
        path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }

    /// <summary>Positive amount expands the rect; negative shrinks (reference behavior).</summary>
    public static Rectangle InflateRect(Rectangle rect, int amount) =>
        new(rect.X - amount, rect.Y - amount, rect.Width + amount * 2, rect.Height + amount * 2);

    public static void DrawCardBackground(Graphics g, Rectangle rect, int radius, Color fill, Color border)
    {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var r = InflateRect(rect, -1);

        using var gp = RoundedPath(r, radius);
        using var sb = new SolidBrush(fill);
        using var pen = new Pen(border, 1f);
        g.FillPath(sb, gp);
        g.DrawPath(pen, gp);
    }

    public static void FillRoundedPanel(Graphics g, Rectangle rect, int radius, Color fill, Color border, int borderWidth = 1)
    {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var r = InflateRect(rect, -1);

        using var gp = RoundedPath(r, radius);
        using var sb = new SolidBrush(fill);
        g.FillPath(sb, gp);
        if (borderWidth > 0)
        {
            using var pen = new Pen(border, borderWidth);
            g.DrawPath(pen, gp);
        }
    }

    public static void NavButtonPaint(object? sender, PaintEventArgs e)
    {
        if (sender is not Button btn) return;
        var active = btn.Tag?.ToString() == "active";
        var bg = active ? EmperorPosTheme.OrangePrimary : Color.White;
        var fg = active ? Color.White : EmperorPosTheme.TextPrimary;
        var border = active ? EmperorPosTheme.OrangePrimary : EmperorPosTheme.BorderWarm;

        e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
        var pillR = PillCornerRadius(btn.ClientRectangle);
        FillRoundedPanel(e.Graphics, btn.ClientRectangle, pillR, bg, border, 1);

        var tr = btn.ClientRectangle;
        tr.X += 16;
        tr.Width -= 24;
        TextRenderer.DrawText(
            e.Graphics,
            btn.Text,
            btn.Font,
            tr,
            fg,
            TextFormatFlags.VerticalCenter | TextFormatFlags.Left | TextFormatFlags.EndEllipsis);
    }

    public static void ActionButtonPaint(object? sender, PaintEventArgs e)
    {
        if (sender is not Button btn) return;
        var tag = btn.Tag as OrdersActionButtonTag ?? new OrdersActionButtonTag();

        e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
        // Pill / capsule: fully rounded ends (like a circle on the short sides).
        var pillR = tag.UseFixedRadius ? tag.Radius : PillCornerRadius(btn.ClientRectangle);
        FillRoundedPanel(e.Graphics, btn.ClientRectangle, pillR, btn.BackColor, tag.BorderColor, tag.BorderWidth);

        TextRenderer.DrawText(
            e.Graphics,
            btn.Text,
            btn.Font,
            btn.ClientRectangle,
            btn.ForeColor,
            TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
    }

    public static Button CreateNavButton(string text, Rectangle bounds, EventHandler click)
    {
        var btn = new Button
        {
            Text = text,
            Bounds = bounds,
            FlatStyle = FlatStyle.Flat,
            Font = EmperorPosTheme.FontSemi(12.5f),
            Cursor = Cursors.Hand,
            BackColor = Color.White,
        };
        btn.FlatAppearance.BorderSize = 0;
        btn.Paint += NavButtonPaint;
        btn.Click += click;
        return btn;
    }

    public static void StyleNavButton(Button btn, bool active)
    {
        btn.Tag = active ? "active" : "inactive";
        btn.Invalidate();
    }

    public static Button CreateActionButton(
        string text,
        Rectangle bounds,
        Color bg,
        Color fg,
        int radius = 12,
        int borderWidth = 0,
        Color? borderColor = null)
    {
        var btn = new Button
        {
            Text = text,
            Bounds = bounds,
            FlatStyle = FlatStyle.Flat,
            Font = EmperorPosTheme.FontSemi(12f),
            BackColor = bg,
            ForeColor = fg,
            Cursor = Cursors.Hand,
            Tag = new OrdersActionButtonTag
            {
                Radius = radius,
                UseFixedRadius = false,
                BorderWidth = borderWidth,
                BorderColor = borderColor ?? bg,
            },
        };
        btn.FlatAppearance.BorderSize = 0;
        btn.Paint += ActionButtonPaint;
        return btn;
    }

    public static Button CreatePageButton(string text, Rectangle bounds, bool active)
    {
        return CreateActionButton(
            text,
            bounds,
            active ? EmperorPosTheme.OrangePrimary : Color.White,
            active ? Color.White : EmperorPosTheme.TextPrimary,
            8,
            active ? 0 : 1,
            EmperorPosTheme.BorderWarm);
    }

    public static Button CreatePlainPageButton(string text, Rectangle bounds)
    {
        return CreateActionButton(
            text,
            bounds,
            EmperorPosTheme.InputBg,
            EmperorPosTheme.TextMutedRef,
            8,
            0,
            EmperorPosTheme.InputBg);
    }
}

internal sealed class OrdersActionButtonTag
{
    /// <summary>When false, corner radius is derived from bounds (pill/capsule). When true, <see cref="Radius"/> is used.</summary>
    public bool UseFixedRadius { get; set; }

    public int Radius { get; set; } = 12;
    public int BorderWidth { get; set; }
    public Color BorderColor { get; set; } = Color.Transparent;
}
