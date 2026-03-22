using System.Text.RegularExpressions;

namespace OrderWatchingDesktop;

/// <summary>Lightweight parsing of <c>specialInstructions</c> checkout blobs.</summary>
internal static class OrderCheckoutParser
{
    public static string? ExtractAfterLabel(string? raw, string label)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var norm = OrderNotesFormatter.Normalize(raw);
        foreach (var line in norm.Split('\n', StringSplitOptions.RemoveEmptyEntries))
        {
            var t = line.Trim();
            if (t.StartsWith(label + ":", StringComparison.OrdinalIgnoreCase))
                return t[(label.Length + 1)..].Trim();
        }

        var m = Regex.Match(norm, $@"{Regex.Escape(label)}:\s*(.+?)(?:\n|$)", RegexOptions.IgnoreCase | RegexOptions.Singleline);
        return m.Success ? m.Groups[1].Value.Trim() : null;
    }

    public static string PickupOrDefault(string? raw) =>
        ExtractAfterLabel(raw, "Pickup") ?? "—";

    public static string PhoneOrDefault(string? raw) =>
        ExtractAfterLabel(raw, "Phone") ?? "—";
}
