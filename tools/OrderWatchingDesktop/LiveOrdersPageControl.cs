using System.Data;
using System.Drawing;
using System.Globalization;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal sealed class LiveOrdersPageControl : UserControl
{
    private readonly OrderDataService _service;
    private readonly int _pollSeconds;
    private readonly Action<string> _setSidebarStats;

    private readonly SplitContainer _split;
    private readonly Panel _scrollHost;
    private readonly FlowLayoutPanel _flow;
    private readonly EmperorOrderDetailPanel _detail;

    private DataTable? _table;
    private int _selectedOrderId = -1;

    public LiveOrdersPageControl(OrderDataService service, int pollSeconds, Action<string> setSidebarStats)
    {
        _service = service;
        _pollSeconds = pollSeconds;
        _setSidebarStats = setSidebarStats;

        Dock = DockStyle.Fill;
        BackColor = EmperorPosTheme.BgMain;
        Padding = new Padding(0, 0, 0, 0);

        var header = BuildHeader();

        // Keep mins tiny until layout: default SplitContainer width is ~150px; large mins throw
        // "SplitterDistance must be between Panel1MinSize and Width - Panel2MinSize" during ctor.
        _split = new SplitContainer
        {
            Dock = DockStyle.Fill,
            Orientation = Orientation.Vertical,
            SplitterWidth = 8,
            BackColor = EmperorPosTheme.BgMain,
            Panel1MinSize = 40,
            Panel2MinSize = 40,
            FixedPanel = FixedPanel.None,
        };
        _split.Panel1.BackColor = EmperorPosTheme.BgMain;
        _split.Panel2.BackColor = EmperorPosTheme.BgMain;

        _scrollHost = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(20, 12, 10, 16),
            AutoScroll = true,
            BackColor = EmperorPosTheme.BgMain,
        };
        _flow = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            AutoSize = true,
            AutoSizeMode = AutoSizeMode.GrowAndShrink,
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            BackColor = EmperorPosTheme.BgMain,
            Padding = new Padding(0),
        };
        _scrollHost.Controls.Add(_flow);
        _scrollHost.Resize += (_, _) => SyncFlowWidth();

        _detail = new EmperorOrderDetailPanel { Dock = DockStyle.Fill };

        _split.Panel1.Controls.Add(_scrollHost);
        _split.Panel2.Controls.Add(_detail);

        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 2,
            BackColor = EmperorPosTheme.BgMain,
        };
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 56f));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));
        root.Controls.Add(header, 0, 0);
        root.Controls.Add(_split, 0, 1);

        Controls.Add(root);

        Resize += (_, _) => ApplySplitter();
        HandleCreated += (_, _) => BeginInvoke(new Action(ApplySplitter));
    }

    private Panel BuildHeader()
    {
        var p = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = EmperorPosTheme.BgMain,
            Padding = new Padding(24, 12, 24, 8),
        };
        var title = new Label
        {
            Text = "Live Orders",
            Font = EmperorPosTheme.FontSemi(18f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Location = new Point(4, 4),
        };
        var live = new Label
        {
            Text = "Live",
            Font = EmperorPosTheme.FontSemi(8.75f),
            ForeColor = Color.White,
            BackColor = EmperorPosTheme.OrangePrimary,
            AutoSize = false,
            TextAlign = ContentAlignment.MiddleCenter,
            Size = new Size(52, 24),
            Padding = new Padding(0),
        };
        using var path = EmperorDrawing.RoundedRect(new Rectangle(0, 0, live.Width - 1, live.Height - 1), 10);
        live.Region = new Region(path);
        p.Controls.Add(title);
        p.Controls.Add(live);
        p.Resize += (_, _) => { live.Left = p.ClientSize.Width - live.Width - 8; live.Top = 10; };
        return p;
    }

    private void ApplySplitter()
    {
        var total = _split.Width;
        if (total < 80) return;
        var splitter = _split.SplitterWidth;
        var spare = total - splitter - 2;
        if (spare < 2) return;
        _split.Panel1MinSize = Math.Min(280, spare / 2);
        _split.Panel2MinSize = Math.Min(300, spare / 2);
        var maxDist = total - splitter - _split.Panel2MinSize;
        var minDist = _split.Panel1MinSize;
        if (maxDist < minDist) return;
        var dist = Math.Clamp((int)(total * 0.48), minDist, maxDist);
        try { _split.SplitterDistance = dist; } catch { /* layout race */ }
        SyncFlowWidth();
    }

    private void SyncFlowWidth()
    {
        var w = Math.Max(320, _scrollHost.ClientSize.Width - _scrollHost.Padding.Horizontal);
        _flow.Width = w;
        foreach (Control c in _flow.Controls)
            c.Width = w - 4;
    }

    public async Task RefreshDataAsync()
    {
        try
        {
            var table = await _service.LoadLiveAsync().ConfigureAwait(true);
            RebuildCards(table);
            _setSidebarStats($"{table.Rows.Count} order(s) · auto-refresh every {_pollSeconds}s");
        }
        catch (Exception ex)
        {
            _setSidebarStats("Error loading live orders");
            MessageBox.Show(this, ex.Message, "Live Orders", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }

    private void RebuildCards(DataTable table)
    {
        _table = table;
        _flow.SuspendLayout();
        _flow.Controls.Clear();

        foreach (DataRow row in table.Rows)
        {
            var orderId = GetInt(row, "orderID");
            var orderNumber = GetStr(row, "orderNumber");
            var name = CustomerName(row);
            var email = GetStr(row, "email");
            var orderDate = GetDate(row, "orderDate");
            var spec = GetStr(row, "specialInstructions");
            var pickup = OrderCheckoutParser.PickupOrDefault(spec);
            var phone = OrderCheckoutParser.PhoneOrDefault(spec);
            var phoneCol = GetStr(row, "phone");
            if (phone == "—" && !string.IsNullOrWhiteSpace(phoneCol))
                phone = phoneCol.Trim();
            var items = OrderDisplayHelpers.BuildCardItemsPreview(spec);
            var sub = GetDec(row, "subTotalAmount");
            var tax = GetDec(row, "taxAmount");
            var statusId = GetInt(row, "orderStatusID");

            var card = new LiveOrderCardControl(orderId, orderNumber, name, email, orderDate, pickup, phone, items, sub, tax, statusId)
            {
                Width = Math.Max(400, _flow.Width - 4),
            };
            card.OrderSelected += (_, id) => SelectOrder(id);
            _flow.Controls.Add(card);
        }

        _flow.ResumeLayout(true);
        SyncFlowWidth();

        if (table.Rows.Count == 0)
        {
            _selectedOrderId = -1;
            _detail.Clear();
            return;
        }

        var stillThere = false;
        if (_selectedOrderId >= 0)
        {
            foreach (DataRow r in table.Rows)
            {
                if (GetInt(r, "orderID") == _selectedOrderId)
                {
                    stillThere = true;
                    break;
                }
            }
        }

        var pick = stillThere
            ? _selectedOrderId
            : GetInt(table.Rows[0], "orderID");
        SelectOrder(pick);
    }

    private void SelectOrder(int orderId)
    {
        _selectedOrderId = orderId;
        foreach (LiveOrderCardControl c in _flow.Controls.OfType<LiveOrderCardControl>())
            c.Selected = c.OrderId == orderId;

        if (_table == null)
        {
            _detail.Clear();
            return;
        }

        DataRow? match = null;
        foreach (DataRow r in _table.Rows)
        {
            if (GetInt(r, "orderID") == orderId)
            {
                match = r;
                break;
            }
        }

        _detail.Bind(match);
    }

    private static int GetInt(DataRow r, string col) =>
        r.Table.Columns.Contains(col) && r[col] != DBNull.Value
            ? Convert.ToInt32(r[col], CultureInfo.InvariantCulture)
            : 0;

    private static string GetStr(DataRow r, string col) =>
        r.Table.Columns.Contains(col) ? r[col]?.ToString() ?? "" : "";

    private static decimal GetDec(DataRow r, string col) =>
        r.Table.Columns.Contains(col) && r[col] != DBNull.Value
            ? Convert.ToDecimal(r[col], CultureInfo.InvariantCulture)
            : 0m;

    private static DateTime GetDate(DataRow r, string col) =>
        r.Table.Columns.Contains(col) && r[col] != DBNull.Value
            ? Convert.ToDateTime(r[col], CultureInfo.InvariantCulture)
            : DateTime.MinValue;

    private static string CustomerName(DataRow row)
    {
        var name = GetStr(row, "customerName").Trim();
        if (!string.IsNullOrWhiteSpace(name)) return name;
        var fn = GetStr(row, "firstName");
        var ln = GetStr(row, "lastName");
        return $"{fn} {ln}".Trim();
    }
}
