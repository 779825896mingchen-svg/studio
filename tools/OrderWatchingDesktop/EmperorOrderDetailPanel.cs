using System.Data;
using System.Drawing;
using System.Globalization;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

/// <summary>Premium formatted order summary for the right pane.</summary>
internal sealed class EmperorOrderDetailPanel : Panel
{
    private readonly RoundedCardPanel _card;
    private readonly FlowLayoutPanel _flow;

    public EmperorOrderDetailPanel()
    {
        EmperorDrawing.EnableDoubleBuffer(this);
        BackColor = EmperorPosTheme.BgMain;
        Padding = new Padding(8, 8, 16, 16);
        AutoScroll = true;
        AutoScrollMargin = new Size(0, 12);

        _card = new RoundedCardPanel(16)
        {
            Dock = DockStyle.Top,
            AutoSize = true,
            AutoSizeMode = AutoSizeMode.GrowAndShrink,
            Padding = new Padding(22, 20, 22, 24),
            BackColor = EmperorPosTheme.CardWhite,
        };

        _flow = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            AutoSize = true,
            AutoSizeMode = AutoSizeMode.GrowAndShrink,
            BackColor = EmperorPosTheme.CardWhite,
            Padding = new Padding(0),
        };

        _card.Controls.Add(_flow);
        Controls.Add(_card);
        Resize += (_, _) =>
        {
            SyncWidths();
            UpdateScrollExtent();
        };
    }

    private void SyncWidths()
    {
        var w = Math.Max(280, ClientSize.Width - Padding.Horizontal);
        _card.Width = w;
        _flow.Width = w - _card.Padding.Horizontal;
        var innerW = _flow.ClientSize.Width;
        foreach (Control c in _flow.Controls)
        {
            c.Width = innerW;
            if (c is not FlowLayoutPanel f) continue;
            f.Width = innerW;
            foreach (Control x in f.Controls)
            {
                if (x is ItemRowPanel ip)
                    ip.Width = Math.Max(220, f.ClientSize.Width);
            }
        }
    }

    /// <summary>Ensures vertical scrollbar appears when content is taller than the viewport.</summary>
    private void UpdateScrollExtent()
    {
        if (_card == null || _flow == null) return;
        var h = _flow.PreferredSize.Height + _card.Padding.Vertical;
        _card.Height = Math.Max(1, h);
        var cw = Math.Max(1, ClientSize.Width);
        AutoScrollMinSize = new Size(cw, Padding.Vertical + _card.Height);
    }

    public void Clear()
    {
        _flow.Controls.Clear();
        UpdateScrollExtent();
        AutoScrollPosition = new Point(0, 0);
    }

    public void Bind(DataRow? row)
    {
        Clear();
        if (row == null) return;

        var orderNum = row.Table.Columns.Contains("orderNumber") ? row["orderNumber"]?.ToString() ?? "" : "";
        var web = string.IsNullOrEmpty(orderNum) ? "—" : (orderNum.StartsWith("#", StringComparison.Ordinal) ? orderNum : "#" + orderNum);

        var orderDate = row.Table.Columns.Contains("orderDate") && row["orderDate"] != DBNull.Value
            ? Convert.ToDateTime(row["orderDate"], CultureInfo.InvariantCulture)
            : DateTime.MinValue;

        var statusId = row.Table.Columns.Contains("orderStatusID") && row["orderStatusID"] != DBNull.Value
            ? Convert.ToInt32(row["orderStatusID"], CultureInfo.InvariantCulture)
            : 0;

        var name = row.Table.Columns.Contains("customerName") ? row["customerName"]?.ToString()?.Trim() ?? "" : "";
        if (string.IsNullOrWhiteSpace(name))
        {
            var fn = row.Table.Columns.Contains("firstName") ? row["firstName"]?.ToString() ?? "" : "";
            var ln = row.Table.Columns.Contains("lastName") ? row["lastName"]?.ToString() ?? "" : "";
            name = $"{fn} {ln}".Trim();
        }

        if (string.IsNullOrWhiteSpace(name)) name = "Guest";

        var email = row.Table.Columns.Contains("email") ? row["email"]?.ToString() ?? "" : "";
        var phoneCol = row.Table.Columns.Contains("phone") ? row["phone"]?.ToString() ?? "" : "";
        var spec = row.Table.Columns.Contains("specialInstructions") ? row["specialInstructions"]?.ToString() : "";
        var phone = OrderCheckoutParser.PhoneOrDefault(spec);
        if (phone == "—" && !string.IsNullOrWhiteSpace(phoneCol))
            phone = phoneCol.Trim();

        var pickup = OrderCheckoutParser.PickupOrDefault(spec);

        var sub = row.Table.Columns.Contains("subTotalAmount") && row["subTotalAmount"] != DBNull.Value
            ? Convert.ToDecimal(row["subTotalAmount"], CultureInfo.InvariantCulture)
            : 0m;
        var tax = row.Table.Columns.Contains("taxAmount") && row["taxAmount"] != DBNull.Value
            ? Convert.ToDecimal(row["taxAmount"], CultureInfo.InvariantCulture)
            : 0m;

        _flow.Controls.Add(MakeHeader(web, orderDate, statusId));
        _flow.Controls.Add(MakeSection("Customer", [
            ("Name", name),
            ("Email", string.IsNullOrEmpty(email) ? "—" : email),
            ("Phone", phone),
        ]));
        _flow.Controls.Add(MakeSection("Pickup", [
            ("Pickup time", pickup),
        ], accentValues: true));

        var items = OrderLineItemParser.ParseFromSpecialInstructions(spec);
        _flow.Controls.Add(MakeItemsSection(items, sub + tax));

        var notes = ExtractCustomerNotes(spec);
        if (!string.IsNullOrWhiteSpace(notes))
            _flow.Controls.Add(MakeSection("Customer notes", [("", notes)]));

        SyncWidths();
        UpdateScrollExtent();
        AutoScrollPosition = new Point(0, 0);
    }

    private static string? ExtractCustomerNotes(string? spec)
    {
        if (string.IsNullOrWhiteSpace(spec)) return null;
        var n = spec.Replace("\r\n", "\n", StringComparison.Ordinal);
        const string marker = "--- Items ---";
        var i = n.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        if (i <= 0) return null;
        var head = n[..i].Trim();
        // Strip structured pickup/phone lines from "notes" if they're the only head content
        var lines = head.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var keep = lines.Where(l =>
        {
            var t = l.Trim();
            if (t.StartsWith("Pickup:", StringComparison.OrdinalIgnoreCase)) return false;
            if (t.StartsWith("Phone:", StringComparison.OrdinalIgnoreCase)) return false;
            return true;
        }).ToArray();
        head = string.Join(Environment.NewLine, keep).Trim();
        return string.IsNullOrWhiteSpace(head) ? null : head;
    }

    private Panel MakeHeader(string web, DateTime orderDate, int statusId)
    {
        var p = new Panel
        {
            Height = 108,
            Margin = new Padding(0, 0, 0, 8),
            BackColor = EmperorPosTheme.CardWhite,
        };

        var title = new Label
        {
            Text = "Order Details",
            Font = EmperorPosTheme.FontSemi(22f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Location = new Point(0, 0),
        };
        var meta = new Label
        {
            Text = $"Order #  {web}\r\nPlaced on  {orderDate:dddd, MMMM d, yyyy h:mm tt}",
            Font = EmperorPosTheme.FontUi(10f),
            ForeColor = EmperorPosTheme.TextSecondary,
            AutoSize = false,
            Size = new Size(400, 44),
            Location = new Point(0, 32),
        };

        var pc = EmperorPosTheme.StatusPillColors(statusId);
        var pill = new Label
        {
            Text = EmperorPosTheme.StatusLabel(statusId),
            Font = EmperorPosTheme.FontSemi(8.75f),
            AutoSize = true,
            BackColor = pc.Back,
            ForeColor = pc.Fore,
            Padding = new Padding(12, 4, 12, 4),
            Location = new Point(0, 80),
        };

        p.Controls.Add(title);
        p.Controls.Add(meta);
        p.Controls.Add(pill);
        return p;
    }

    private Panel MakeSection(string title, (string Label, string Value)[] rows, bool accentValues = false)
    {
        var wrap = new DetailSectionPanel(title, accentValues);
        foreach (var (lbl, val) in rows)
            wrap.AddRow(lbl, val);
        wrap.FinishLayout();
        return wrap;
    }

    private Control MakeItemsSection(IReadOnlyList<ParsedLineItem> items, decimal orderTotal)
    {
        var wrap = new FlowLayoutPanel
        {
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            AutoSize = true,
            AutoSizeMode = AutoSizeMode.GrowAndShrink,
            Margin = new Padding(0, 0, 0, 12),
            BackColor = EmperorPosTheme.CardWhite,
            Padding = new Padding(0),
        };

        var ttl = new Label
        {
            Text = "ITEMS ORDERED",
            Font = EmperorPosTheme.FontSemi(8.25f),
            ForeColor = EmperorPosTheme.TextSecondary,
            AutoSize = true,
            Margin = new Padding(0, 0, 0, 10),
        };
        wrap.Controls.Add(ttl);

        if (items.Count == 0)
        {
            wrap.Controls.Add(new Label
            {
                Text = "No line items parsed from order notes.",
                Font = EmperorPosTheme.FontUi(9.5f),
                ForeColor = EmperorPosTheme.TextSecondary,
                AutoSize = true,
            });
        }
        else
        {
            foreach (var it in items)
            {
                var row = new ItemRowPanel(it);
                wrap.Controls.Add(row);
            }
        }

        var totalLbl = new Label
        {
            Text = $"Total  {orderTotal.ToString("C2", CultureInfo.CurrentCulture)}",
            Font = EmperorPosTheme.FontSemi(12f),
            ForeColor = EmperorPosTheme.OrangePrimary,
            AutoSize = true,
            Margin = new Padding(0, 14, 0, 0),
        };
        wrap.Controls.Add(totalLbl);
        return wrap;
    }
}

internal sealed class DetailSectionPanel : Panel
{
    private readonly string _title;
    private readonly bool _accentValues;
    private int _y = 36;

    public DetailSectionPanel(string title, bool accentValues = false)
    {
        _title = title;
        _accentValues = accentValues;
        BackColor = EmperorPosTheme.InputBg;
        Padding = new Padding(16, 14, 16, 14);
        Margin = new Padding(0, 0, 0, 12);
        Height = 40;
    }

    public void AddRow(string label, string value)
    {
        var textW = Math.Max(200, Width - Padding.Horizontal);
        if (label.Length == 0)
        {
            var note = new Label
            {
                Text = value,
                Font = EmperorPosTheme.FontUi(10f),
                ForeColor = EmperorPosTheme.TextPrimary,
                AutoSize = false,
                Width = textW,
                Location = new Point(Padding.Left, _y),
            };
            note.Height = TextRenderer.MeasureText(value, note.Font,
                new Size(note.Width, 800), TextFormatFlags.WordBreak).Height + 4;
            Controls.Add(note);
            _y += note.Height + 10;
            return;
        }

        var l = new Label
        {
            Text = label,
            Font = EmperorPosTheme.FontUi(9f),
            ForeColor = EmperorPosTheme.TextSecondary,
            AutoSize = true,
            Location = new Point(Padding.Left, _y),
        };
        var v = new Label
        {
            Text = value,
            Font = EmperorPosTheme.FontSemi(10f),
            ForeColor = _accentValues ? EmperorPosTheme.OrangePrimary : EmperorPosTheme.TextPrimary,
            AutoSize = false,
            Width = textW,
            Location = new Point(Padding.Left, _y + 18),
        };
        v.Height = TextRenderer.MeasureText(value, v.Font,
            new Size(v.Width, 400), TextFormatFlags.WordBreak).Height + 2;
        Controls.Add(l);
        Controls.Add(v);
        _y += 22 + v.Height + 8;
    }

    public void FinishLayout()
    {
        var ttl = new Label
        {
            Text = _title.ToUpperInvariant(),
            Font = EmperorPosTheme.FontSemi(8.25f),
            ForeColor = EmperorPosTheme.TextSecondary,
            AutoSize = true,
            Location = new Point(Padding.Left, 14),
        };
        Controls.Add(ttl);
        ttl.BringToFront();
        Height = _y + Padding.Bottom;
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var g = e.Graphics;
        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
        var r = ClientRectangle;
        r.Inflate(-1, -1);
        using var pen = new Pen(EmperorPosTheme.BorderWarm, 1f);
        EmperorDrawing.DrawRounded(g, pen, r, 12);
    }
}

internal sealed class ItemRowPanel : Panel
{
    private readonly Label? _priceLabel;

    public ItemRowPanel(ParsedLineItem it)
    {
        Height = it.Choice is { Length: > 0 } ? 68 : 52;
        Margin = new Padding(0, 0, 0, 10);
        BackColor = EmperorPosTheme.InputBg;
        Width = 400;

        var name = new Label
        {
            Text = $"{it.Qty}× {it.Name}",
            Font = EmperorPosTheme.FontSemi(10.25f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Location = new Point(14, 10),
        };
        Controls.Add(name);

        if (it.Choice is { Length: > 0 } c)
        {
            Controls.Add(new Label
            {
                Text = $"Choice: {c}",
                Font = EmperorPosTheme.FontUi(9f),
                ForeColor = EmperorPosTheme.TextSecondary,
                AutoSize = true,
                Location = new Point(14, 34),
            });
        }

        if (it.UnitPrice is { } p)
        {
            var priceTxt = (p * it.Qty).ToString("C2", CultureInfo.CurrentCulture);
            _priceLabel = new Label
            {
                Text = priceTxt,
                Font = EmperorPosTheme.FontSemi(10f),
                ForeColor = EmperorPosTheme.OrangePrimary,
                AutoSize = true,
            };
            _priceLabel.Location = new Point(Width - _priceLabel.PreferredWidth - 20, 18);
            Controls.Add(_priceLabel);
        }

        Resize += (_, _) =>
        {
            if (_priceLabel != null)
                _priceLabel.Left = Width - _priceLabel.PreferredWidth - 20;
        };
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var g = e.Graphics;
        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
        var r = ClientRectangle;
        r.Inflate(-1, -1);
        using var pen = new Pen(EmperorPosTheme.BorderWarm, 1f);
        EmperorDrawing.DrawRounded(g, pen, r, 10);
    }
}
