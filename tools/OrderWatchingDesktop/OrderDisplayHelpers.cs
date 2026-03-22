namespace OrderWatchingDesktop;

internal static class OrderDisplayHelpers
{
    /// <summary>Longer preview for cards (wraps in layout); avoids one tiny fragment.</summary>
    public static string BuildCardItemsPreview(string? specialInstructions, int maxChars = 240)
    {
        var summary = ExtractItemsSummary(specialInstructions);
        if (!string.IsNullOrWhiteSpace(summary) && summary.Length >= 40)
            return summary.Length <= maxChars ? summary : summary[..maxChars].TrimEnd() + "…";

        if (string.IsNullOrWhiteSpace(specialInstructions)) return "—";
        var n = OrderNotesFormatter.Normalize(specialInstructions);
        if (n.Length <= maxChars) return n;
        var cut = n[..maxChars];
        var sp = cut.LastIndexOf(' ');
        if (sp > maxChars * 2 / 3) cut = cut[..sp];
        return cut.TrimEnd() + "…";
    }

    /// <summary>First line item after "--- Items ---", or first meaningful line of checkout text.</summary>
    public static string ExtractItemsSummary(string? specialInstructions)
    {
        if (string.IsNullOrWhiteSpace(specialInstructions)) return "";
        var t = specialInstructions.Replace("\r\n", "\n", StringComparison.Ordinal);
        const string marker = "--- Items ---";
        var idx = t.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        if (idx >= 0)
        {
            var rest = t[(idx + marker.Length)..].Trim();
            foreach (var line in rest.Split('\n'))
            {
                var s = line.Trim();
                if (s.Length > 0) return s;
            }
        }

        foreach (var line in t.Split('\n'))
        {
            var s = line.Trim();
            if (s.Length == 0) continue;
            if (s.StartsWith("Phone:", StringComparison.OrdinalIgnoreCase)) continue;
            return s;
        }

        return t.Trim();
    }

    /// <summary>Multi-line item lines after <c>--- Items ---</c> for history cards.</summary>
    public static string BuildHistoryItemsBlock(string? specialInstructions, int maxLines = 6)
    {
        if (string.IsNullOrWhiteSpace(specialInstructions)) return "—";
        var t = specialInstructions.Replace("\r\n", "\n", StringComparison.Ordinal);
        const string marker = "--- Items ---";
        var idx = t.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return ExtractItemsSummary(specialInstructions);
        var rest = t[(idx + marker.Length)..].Trim();
        var lines = rest.Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .Where(s => s.Length > 0)
            .Take(maxLines)
            .ToArray();
        return lines.Length == 0 ? "—" : string.Join(Environment.NewLine, lines);
    }
}
