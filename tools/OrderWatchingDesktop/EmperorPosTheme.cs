using System.Drawing;

namespace OrderWatchingDesktop;

/// <summary>Premium light POS palette — Emperor's (warm white + orange).</summary>
internal static class EmperorPosTheme
{
    public static readonly Color BgMain = Color.FromArgb(0xF7, 0xF3, 0xEE);
    public static readonly Color CardWhite = Color.FromArgb(0xFF, 0xFF, 0xFF);
    public static readonly Color OrangePrimary = Color.FromArgb(0xFF, 0x8A, 0x18);
    public static readonly Color OrangeHover = Color.FromArgb(0xE5, 0x6F, 0x00);
    /// <summary>Soft peach for completed-style pills.</summary>
    public static readonly Color OrangeBadgeSoft = Color.FromArgb(0xFF, 0xE8, 0xD4);
    /// <summary>Orange/gold tint for pending.</summary>
    public static readonly Color OrangeBadgeGold = Color.FromArgb(0xFF, 0xD4, 0xA0);
    public static readonly Color TextPrimary = Color.FromArgb(0x1F, 0x1F, 0x1F);
    public static readonly Color TextSecondary = Color.FromArgb(0x66, 0x66, 0x66);
    /// <summary>Reference mockup muted brown-gray.</summary>
    public static readonly Color TextMutedRef = ColorTranslator.FromHtml("#6B6660");
    public static readonly Color OrangeSoft = ColorTranslator.FromHtml("#FFF1E2");
    public static readonly Color PendingSoft = ColorTranslator.FromHtml("#FFF4D8");
    public static readonly Color PendingText = ColorTranslator.FromHtml("#C57A00");
    public static readonly Color ViewDetailsButtonBg = ColorTranslator.FromHtml("#F8F0E8");
    public static readonly Color BorderWarm = Color.FromArgb(0xE8, 0xDE, 0xD4);
    public static readonly Color InputBg = Color.FromArgb(0xFC, 0xFA, 0xF7);
    public static readonly Color SidebarMutedBg = Color.FromArgb(0xFA, 0xF7, 0xF3);
    public static readonly Color Shadow = Color.FromArgb(18, 0, 0, 0);

    public static Font FontUi(float pt, FontStyle style = FontStyle.Regular) =>
        new("Segoe UI", pt, style, GraphicsUnit.Point);

    public static Font FontSemi(float pt) =>
        new("Segoe UI Semibold", pt, FontStyle.Bold, GraphicsUnit.Point);

    public static string StatusLabel(int statusId) => statusId switch
    {
        1 => "Pending",
        2 => "Completed",
        3 => "Canceled",
        _ => $"Status {statusId}",
    };

    public static (Color Back, Color Fore) StatusPillColors(int statusId) => statusId switch
    {
        1 => (OrangeBadgeGold, TextPrimary),
        2 => (OrangeBadgeSoft, TextPrimary),
        3 => (Color.FromArgb(0xEE, 0xE0, 0xE0), TextSecondary),
        _ => (InputBg, TextSecondary),
    };
}
