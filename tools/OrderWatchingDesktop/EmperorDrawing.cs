using System.Drawing;
using System.Drawing.Drawing2D;

namespace OrderWatchingDesktop;

internal static class EmperorDrawing
{
    public static GraphicsPath RoundedRect(Rectangle bounds, int radius)
    {
        var d = radius * 2;
        var path = new GraphicsPath();
        if (radius <= 0)
        {
            path.AddRectangle(bounds);
            return path;
        }

        path.AddArc(bounds.X, bounds.Y, d, d, 180, 90);
        path.AddArc(bounds.Right - d, bounds.Y, d, d, 270, 90);
        path.AddArc(bounds.Right - d, bounds.Bottom - d, d, d, 0, 90);
        path.AddArc(bounds.X, bounds.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }

    public static void FillRounded(Graphics g, Brush brush, Rectangle r, int radius)
    {
        using var path = RoundedRect(r, radius);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.FillPath(brush, path);
    }

    public static void DrawRounded(Graphics g, Pen pen, Rectangle r, int radius)
    {
        using var path = RoundedRect(r, radius);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.DrawPath(pen, path);
    }

    /// <summary>Soft drop shadow (stacked translucent rounds).</summary>
    public static void DrawCardShadow(Graphics g, Rectangle cardBounds, int radius, bool hover = false)
    {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var layers = hover ? 6 : 3;
        for (var i = layers; i >= 1; i--)
        {
            var a = hover ? 10 + i * 6 : 8 + i * 4;
            var off = i + (hover ? 1 : 0);
            var r = Rectangle.Inflate(cardBounds, off / 2, off / 2);
            r.Offset(0, off);
            using var b = new SolidBrush(Color.FromArgb(Math.Min(80, a), 0, 0, 0));
            FillRounded(g, b, r, radius + 2);
        }
    }

    public static void EnableDoubleBuffer(Control c)
    {
        typeof(Control).InvokeMember(
            "DoubleBuffered",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.SetProperty,
            null,
            c,
            [true]);
    }
}
