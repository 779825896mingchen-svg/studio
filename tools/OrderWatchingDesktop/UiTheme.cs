using System.Drawing;

namespace OrderWatchingDesktop;

/// <summary>
/// Matches <c>src/app/globals.css</c> — Emperor's Choice / studio site tokens.
/// Primary #C33D22, secondary #F4AF25, background #F5F4F0, Inter + PT Sans (with Segoe fallbacks).
/// </summary>
internal static class UiTheme
{
    /* :root from globals.css — HSL approximated to RGB */
    public static readonly Color Background = Color.FromArgb(245, 244, 240);   /* #F5F4F0 */
    public static readonly Color Foreground = Color.FromArgb(45, 40, 38);       /* ~hsl(20 10% 10%) */
    public static readonly Color Card = Color.FromArgb(250, 250, 248);          /* card */
    public static readonly Color Primary = Color.FromArgb(195, 61, 34);       /* #C33D22 */
    public static readonly Color PrimaryHover = Color.FromArgb(165, 47, 24);   /* darker red */
    public static readonly Color PrimaryForeground = Color.FromArgb(252, 251, 248);
    public static readonly Color Secondary = Color.FromArgb(244, 175, 37);     /* #F4AF25 */
    public static readonly Color SecondaryForeground = Color.FromArgb(45, 40, 38);
    public static readonly Color Muted = Color.FromArgb(232, 230, 227);
    public static readonly Color MutedForeground = Color.FromArgb(120, 110, 105);
    public static readonly Color Border = Color.FromArgb(214, 211, 209);
    public static readonly Color Destructive = Color.FromArgb(220, 38, 38);

    /* Derived */
    public static readonly Color BgApp = Background;
    public static readonly Color BgHeader = Primary;
    public static readonly Color BgToolbar = Card;
    public static readonly Color BgCard = Card;
    public static readonly Color TextHeader = PrimaryForeground;
    /// <summary>Subtitle line on primary red header.</summary>
    public static readonly Color TextOnPrimaryMuted = Color.FromArgb(255, 230, 220);
    public static readonly Color TextMuted = MutedForeground;
    public static readonly Color TextPrimary = Foreground;
    public static readonly Color Accent = Primary;
    public static readonly Color AccentHover = PrimaryHover;
    public static readonly Color BorderSubtle = Border;
    public static readonly Color GridHeaderBg = Muted;
    public static readonly Color GridAltRow = Color.FromArgb(252, 251, 249);
    public static readonly Color GridSelection = Color.FromArgb(255, 235, 230); /* primary ~12% tint */
    public static readonly Color StatusOk = Color.FromArgb(22, 163, 74);
    public static readonly Color StatusErr = Destructive;

    /// <summary>Enable double-buffering on a control (reduces grid flicker).</summary>
    public static void EnableDoubleBuffer(Control c)
    {
        typeof(Control).InvokeMember(
            "DoubleBuffered",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.SetProperty,
            null,
            c,
            [true]);
    }

    /// <summary>PT Sans for headlines (matches site); falls back to Segoe UI.</summary>
    public static Font FontHeadline(float sizePt, FontStyle style = FontStyle.Bold)
    {
        try
        {
            using var ff = new FontFamily("PT Sans");
            return new Font(ff, sizePt, style, GraphicsUnit.Point);
        }
        catch (ArgumentException)
        {
            return new Font("Segoe UI Semibold", sizePt, FontStyle.Regular, GraphicsUnit.Point);
        }
    }

    /// <summary>Inter for UI (matches site); falls back to Segoe UI.</summary>
    public static Font FontBody(float sizePt, FontStyle style = FontStyle.Regular)
    {
        try
        {
            using var ff = new FontFamily("Inter");
            return new Font(ff, sizePt, style, GraphicsUnit.Point);
        }
        catch (ArgumentException)
        {
            return new Font("Segoe UI", sizePt, style, GraphicsUnit.Point);
        }
    }

    public static Font FontBodySemibold(float sizePt)
    {
        try
        {
            using var ff = new FontFamily("Inter");
            return new Font(ff, sizePt, FontStyle.Bold, GraphicsUnit.Point);
        }
        catch (ArgumentException)
        {
            return new Font("Segoe UI Semibold", sizePt, FontStyle.Regular, GraphicsUnit.Point);
        }
    }
}
