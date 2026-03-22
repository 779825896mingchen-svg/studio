using System.Globalization;
using System.Text.RegularExpressions;

namespace OrderWatchingDesktop;

internal readonly record struct ParsedLineItem(int Qty, string Name, string? Choice, decimal? UnitPrice);

/// <summary>Parses checkout lines after <c>--- Items ---</c>.</summary>
internal static class OrderLineItemParser
{
    private static readonly Regex LineRe = new(
        @"^\s*(\d+)\s*[x×]\s*(.+?)(?:\s*@\s*\$?\s*([\d.]+))?\s*$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static IReadOnlyList<ParsedLineItem> ParseFromSpecialInstructions(string? raw)
    {
        var list = new List<ParsedLineItem>();
        if (string.IsNullOrWhiteSpace(raw)) return list;

        var norm = raw.Replace("\r\n", "\n", StringComparison.Ordinal);
        const string marker = "--- Items ---";
        var idx = norm.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        var block = idx >= 0 ? norm[(idx + marker.Length)..] : norm;

        foreach (var line in block.Split('\n'))
        {
            var t = line.Trim();
            if (t.Length == 0) continue;
            if (t.StartsWith("Pickup:", StringComparison.OrdinalIgnoreCase)) continue;
            if (t.StartsWith("Phone:", StringComparison.OrdinalIgnoreCase)) continue;

            var m = LineRe.Match(t);
            if (!m.Success) continue;

            var qty = int.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture);
            var rest = m.Groups[2].Value.Trim();
            decimal? price = null;
            if (m.Groups[3].Success && decimal.TryParse(m.Groups[3].Value, NumberStyles.Number, CultureInfo.InvariantCulture, out var p))
                price = p;

            string? choice = null;
            var name = rest;
            var o = rest.IndexOf("(Choice:", StringComparison.OrdinalIgnoreCase);
            if (o >= 0)
            {
                var close = rest.IndexOf(')', o);
                if (close > o)
                {
                    choice = rest.Substring(o + "(Choice:".Length, close - o - "(Choice:".Length).Trim();
                    name = rest[..o].Trim();
                }
            }

            list.Add(new ParsedLineItem(qty, string.IsNullOrEmpty(name) ? rest : name, choice, price));
        }

        return list;
    }
}
