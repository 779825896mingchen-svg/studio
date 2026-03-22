using System.Drawing;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

/// <summary>Pretty-prints checkout / special-instructions blobs into structured sections for the detail pane.</summary>
internal static class OrderNotesFormatter
{
    /// <summary>Inserts line breaks before common tokens when the POS text is glued together.</summary>
    public static string Normalize(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "";
        var s = raw.Replace("\r\n", "\n", StringComparison.Ordinal).Trim();

        // Break before labels when stuck to previous character (e.g. "ASAPPhone:")
        s = Regex.Replace(s, @"(?<=[^\s:])(?=Phone:)", "\n", RegexOptions.IgnoreCase);
        foreach (var token in new[] { "Pickup:", "Delivery:", "Notes:", "Address:" })
            s = Regex.Replace(s, $@"(?<=[^\n])(?={Regex.Escape(token)})", "\n", RegexOptions.IgnoreCase);

        s = Regex.Replace(s, @"(?<=[^\n])(?=---)", "\n");
        s = Regex.Replace(s, "(?i)---\\s*items\\s*---", "\n--- Items ---\n");
        s = Regex.Replace(s, "\n{3,}", "\n\n");
        return s.Trim();
    }

    public static void ApplyToRichText(RichTextBox box, string? raw)
    {
        box.Clear();

        using var fontHead = new Font("Segoe UI Semibold", 10.5f, FontStyle.Bold, GraphicsUnit.Point);
        using var fontBody = new Font("Segoe UI", 10f, FontStyle.Regular, GraphicsUnit.Point);
        using var fontMuted = new Font("Segoe UI", 9f, FontStyle.Italic, GraphicsUnit.Point);

        void AppendHead(string line)
        {
            box.SelectionStart = box.TextLength;
            box.SelectionLength = 0;
            box.SelectionFont = fontHead;
            box.SelectionColor = EmperorPosTheme.OrangePrimary;
            box.AppendText(line + "\n");
        }

        void AppendMuted(string line)
        {
            box.SelectionStart = box.TextLength;
            box.SelectionLength = 0;
            box.SelectionFont = fontMuted;
            box.SelectionColor = EmperorPosTheme.TextSecondary;
            box.AppendText(line + "\n");
        }

        void AppendBody(string line)
        {
            box.SelectionStart = box.TextLength;
            box.SelectionLength = 0;
            box.SelectionFont = fontBody;
            box.SelectionColor = EmperorPosTheme.TextPrimary;
            box.AppendText(line + "\n");
        }

        void AppendKv(string label, string value)
        {
            box.SelectionStart = box.TextLength;
            box.SelectionLength = 0;
            box.SelectionFont = fontHead;
            box.SelectionColor = EmperorPosTheme.OrangePrimary;
            box.AppendText(label);
            box.SelectionFont = fontBody;
            box.SelectionColor = EmperorPosTheme.TextPrimary;
            box.AppendText(" " + value + "\n");
        }

        if (string.IsNullOrWhiteSpace(raw))
        {
            AppendMuted("(No notes or line items.)");
            return;
        }

        var norm = Normalize(raw);
        var lower = norm.ToLowerInvariant();
        const string marker = "--- items ---";
        var idx = lower.IndexOf(marker, StringComparison.Ordinal);

        string meta;
        string items;
        if (idx >= 0)
        {
            meta = norm[..idx].Trim();
            items = norm[(idx + marker.Length)..].Trim();
        }
        else
        {
            meta = norm;
            items = "";
        }

        if (!string.IsNullOrWhiteSpace(meta))
        {
            AppendHead("Order info");
            foreach (var line in meta.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            {
                var t = line.Trim();
                if (t.Length == 0) continue;
                var c = t.IndexOf(':');
                if (c > 0 && c < 48)
                {
                    var label = t[..c].Trim();
                    var val = t[(c + 1)..].Trim();
                    if (val.Length > 0)
                        AppendKv(label + ":", val);
                    else
                        AppendBody(t);
                }
                else
                    AppendBody(t);
            }
            if (!string.IsNullOrWhiteSpace(items))
                AppendBody("");
        }

        if (!string.IsNullOrWhiteSpace(items))
        {
            // Split "…$8.751x Other" style runs into separate lines
            items = Regex.Replace(items, @"(?<=\S)(?=\d+x\s)", "\n", RegexOptions.IgnoreCase);
            AppendHead("Line items");
            foreach (var line in items.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            {
                var t = line.Trim();
                if (t.Length == 0) continue;
                var pretty = FormatItemLine(t);
                box.SelectionStart = box.TextLength;
                box.SelectionLength = 0;
                box.SelectionFont = fontBody;
                box.SelectionColor = EmperorPosTheme.TextPrimary;
                box.AppendText("    •  ");
                box.SelectionColor = EmperorPosTheme.OrangePrimary;
                box.AppendText(pretty + "\n");
            }
        }
    }

    private static string FormatItemLine(string line)
    {
        // e.g. "1x Chow Mein (Choice: Chicken) @ $8.75"
        var m = Regex.Match(line, @"^(?<qty>\d+)\s*x\s*(?<name>.+?)\s*@\s*\$?\s*(?<price>[\d.]+)\s*$",
            RegexOptions.IgnoreCase);
        if (m.Success)
            return $"{m.Groups["qty"].Value}× {m.Groups["name"].Value.Trim()}  —  ${m.Groups["price"].Value}";

        m = Regex.Match(line, @"^(?<qty>\d+)\s*x\s*(?<rest>.+)$", RegexOptions.IgnoreCase);
        if (m.Success)
            return $"{m.Groups["qty"].Value}× {m.Groups["rest"].Value.Trim()}";

        return line;
    }

    /// <summary>Only the line-items bullets (for a dedicated “Items ordered” section).</summary>
    public static void ApplyLineItemsOnly(RichTextBox box, string? raw)
    {
        box.Clear();
        using var fontHead = new Font("Segoe UI Semibold", 10.5f, FontStyle.Bold, GraphicsUnit.Point);
        using var fontBody = new Font("Segoe UI", 10f, FontStyle.Regular, GraphicsUnit.Point);
        using var fontMuted = new Font("Segoe UI", 9f, FontStyle.Italic, GraphicsUnit.Point);

        void AppendMuted(string line)
        {
            box.SelectionStart = box.TextLength;
            box.SelectionLength = 0;
            box.SelectionFont = fontMuted;
            box.SelectionColor = EmperorPosTheme.TextSecondary;
            box.AppendText(line + "\n");
        }

        if (string.IsNullOrWhiteSpace(raw))
        {
            AppendMuted("(No line items.)");
            return;
        }

        var norm = Normalize(raw);
        var lower = norm.ToLowerInvariant();
        const string marker = "--- items ---";
        var idx = lower.IndexOf(marker, StringComparison.Ordinal);
        var items = idx >= 0 ? norm[(idx + marker.Length)..].Trim() : norm;

        if (string.IsNullOrWhiteSpace(items))
        {
            AppendMuted("(No line items.)");
            return;
        }

        items = Regex.Replace(items, @"(?<=\S)(?=\d+x\s)", "\n", RegexOptions.IgnoreCase);
        foreach (var line in items.Split('\n', StringSplitOptions.RemoveEmptyEntries))
        {
            var t = line.Trim();
            if (t.Length == 0) continue;
            var pretty = FormatItemLine(t);
            box.SelectionStart = box.TextLength;
            box.SelectionLength = 0;
            box.SelectionFont = fontBody;
            box.SelectionColor = EmperorPosTheme.TextPrimary;
            box.AppendText("  •  ");
            box.SelectionColor = EmperorPosTheme.OrangePrimary;
            box.AppendText(pretty + "\n");
        }
    }
}
