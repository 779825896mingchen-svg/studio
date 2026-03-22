using System.Data;
using System.Drawing;
using System.Globalization;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal sealed class HistoryOrdersPageControl : UserControl
{
    private readonly OrderDataService _service;
    private readonly int _pageSize;
    private readonly Action<string> _setSidebarStats;

    private readonly TextBox _search = new();
    private readonly ComboBox _status = new();
    private readonly ComboBox _dateRange = new();
    private readonly ComboBox _sort = new();
    private readonly Panel _toolbarChrome = new();
    private readonly SplitContainer _split;
    private readonly Panel _scrollHost = new();
    private readonly FlowLayoutPanel _flow = new();
    private readonly EmperorOrderDetailPanel _detail = new();
    private readonly PaginationControl _pager = new();

    private DataTable? _loadedRaw;
    private List<DataRow> _filtered = [];
    private int _selectedOrderId = -1;

    public HistoryOrdersPageControl(OrderDataService service, int pageSize, Action<string> setSidebarStats)
    {
        _service = service;
        _pageSize = Math.Max(4, pageSize);
        _setSidebarStats = setSidebarStats;

        Dock = DockStyle.Fill;
        BackColor = EmperorPosTheme.BgMain;

        var header = new Panel
        {
            Dock = DockStyle.Top,
            Height = 52,
            BackColor = EmperorPosTheme.BgMain,
            Padding = new Padding(24, 8, 24, 4),
        };
        header.Controls.Add(new Label
        {
            Text = "Order History",
            Font = EmperorPosTheme.FontSemi(18f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Location = new Point(4, 6),
        });

        BuildToolbar();

        _split = new SplitContainer
        {
            Dock = DockStyle.Fill,
            Orientation = Orientation.Vertical,
            SplitterWidth = 8,
            BackColor = EmperorPosTheme.BgMain,
            Panel1MinSize = 40,
            Panel2MinSize = 40,
        };
        _split.Panel1.BackColor = EmperorPosTheme.BgMain;
        _split.Panel2.BackColor = EmperorPosTheme.BgMain;

        var listShell = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 2,
            BackColor = EmperorPosTheme.BgMain,
        };
        listShell.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));
        listShell.RowStyles.Add(new RowStyle(SizeType.Absolute, 56f));

        _scrollHost.Dock = DockStyle.Fill;
        _scrollHost.Padding = new Padding(20, 8, 10, 8);
        _scrollHost.AutoScroll = true;
        _scrollHost.BackColor = EmperorPosTheme.BgMain;
        _flow.Dock = DockStyle.Top;
        _flow.AutoSize = true;
        _flow.AutoSizeMode = AutoSizeMode.GrowAndShrink;
        _flow.FlowDirection = FlowDirection.TopDown;
        _flow.WrapContents = false;
        _flow.BackColor = EmperorPosTheme.BgMain;
        _scrollHost.Controls.Add(_flow);
        _scrollHost.Resize += (_, _) => SyncFlowWidth();

        _pager.Dock = DockStyle.Fill;
        _pager.PageChanged += (_, _) => RebuildCurrentPage();

        listShell.Controls.Add(_scrollHost, 0, 0);
        listShell.Controls.Add(_pager, 0, 1);

        _split.Panel1.Controls.Add(listShell);
        _detail.Dock = DockStyle.Fill;
        _split.Panel2.Controls.Add(_detail);

        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 3,
            BackColor = EmperorPosTheme.BgMain,
        };
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 52f));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 108f));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));
        root.Controls.Add(header, 0, 0);
        root.Controls.Add(_toolbarChrome, 0, 1);
        root.Controls.Add(_split, 0, 2);

        Controls.Add(root);

        Resize += (_, _) => ApplySplitter();
        HandleCreated += (_, _) => BeginInvoke(new Action(ApplySplitter));
    }

    private void BuildToolbar()
    {
        _toolbarChrome.Dock = DockStyle.Fill;
        _toolbarChrome.Padding = new Padding(20, 4, 20, 12);
        _toolbarChrome.BackColor = EmperorPosTheme.BgMain;

        var card = new RoundedCardPanel(14)
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(16, 14, 16, 14),
            BackColor = EmperorPosTheme.CardWhite,
        };

        var row = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 6,
            RowCount = 1,
            BackColor = EmperorPosTheme.CardWhite,
        };
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 36f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 42f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 118f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 128f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 118f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 108f));
        row.RowStyles.Add(new RowStyle(SizeType.Absolute, 54f));

        var icon = new Label
        {
            Text = "\uD83D\uDD0D",
            Font = new Font("Segoe UI Emoji", 11f),
            ForeColor = EmperorPosTheme.TextSecondary,
            TextAlign = ContentAlignment.MiddleCenter,
            Dock = DockStyle.Fill,
        };

        _search.Dock = DockStyle.Fill;
        _search.Font = EmperorPosTheme.FontUi(10.25f);
        _search.BorderStyle = BorderStyle.FixedSingle;
        _search.BackColor = EmperorPosTheme.InputBg;
        _search.ForeColor = EmperorPosTheme.TextPrimary;
        _search.PlaceholderText = "Search by web order #, customer, phone, date";

        StyleCombo(_status, ["All statuses", "Pending", "Completed", "Canceled"], 2);
        StyleCombo(_dateRange, ["Last 7 days", "Last 30 days", "Last 90 days", "All orders"], 1);
        StyleCombo(_sort, ["Newest first", "Oldest first", "Total: high to low", "Total: low to high"], 0);

        var filterBtn = new EmperorRichButton
        {
            Caption = "Filter",
            SubCaption = "Apply search & sort",
            VisualStyle = EmperorRichButtonStyle.OutlineAccent,
            Dock = DockStyle.Fill,
            Margin = new Padding(8, 2, 0, 2),
            TabIndex = 20,
        };
        filterBtn.Click += async (_, _) => await ReloadFromServerAndApplyAsync();

        row.Controls.Add(icon, 0, 0);
        row.Controls.Add(_search, 1, 0);
        row.Controls.Add(_status, 2, 0);
        row.Controls.Add(_dateRange, 3, 0);
        row.Controls.Add(_sort, 4, 0);
        row.Controls.Add(filterBtn, 5, 0);

        card.Controls.Add(row);
        _toolbarChrome.Controls.Add(card);
    }

    private static void StyleCombo(ComboBox cb, string[] items, int selected)
    {
        cb.Dock = DockStyle.Fill;
        cb.DropDownStyle = ComboBoxStyle.DropDownList;
        cb.Font = EmperorPosTheme.FontUi(9.5f);
        cb.BackColor = EmperorPosTheme.InputBg;
        cb.ForeColor = EmperorPosTheme.TextPrimary;
        cb.FlatStyle = FlatStyle.Flat;
        cb.Margin = new Padding(6, 4, 6, 4);
        cb.Items.AddRange(items);
        cb.SelectedIndex = Math.Clamp(selected, 0, items.Length - 1);
    }

    private void ApplySplitter()
    {
        var total = _split.Width;
        if (total < 80) return;
        var splitter = _split.SplitterWidth;
        var spare = total - splitter - 2;
        if (spare < 2) return;
        _split.Panel1MinSize = Math.Min(320, spare / 2);
        _split.Panel2MinSize = Math.Min(280, spare / 2);
        var maxDist = total - splitter - _split.Panel2MinSize;
        var minDist = _split.Panel1MinSize;
        if (maxDist < minDist) return;
        var dist = Math.Clamp((int)(total * 0.55), minDist, maxDist);
        try { _split.SplitterDistance = dist; } catch { /* */ }
        SyncFlowWidth();
    }

    private void SyncFlowWidth()
    {
        var w = Math.Max(360, _scrollHost.ClientSize.Width - _scrollHost.Padding.Horizontal);
        _flow.Width = w;
        foreach (Control c in _flow.Controls)
            c.Width = w - 4;
    }

    private (DateTime From, DateTime To) GetSelectedDateRange()
    {
        var to = DateTime.Today.AddDays(1).AddTicks(-1);
        return _dateRange.SelectedIndex switch
        {
            0 => (DateTime.Today.AddDays(-7), to),
            1 => (DateTime.Today.AddDays(-30), to),
            2 => (DateTime.Today.AddDays(-90), to),
            _ => (DateTime.Today.AddYears(-5), DateTime.Today.AddDays(1)),
        };
    }

    public async Task ReloadFromServerAndApplyAsync()
    {
        try
        {
            var range = GetSelectedDateRange();
            _loadedRaw = await _service.LoadHistoryAsync(range.From, range.To).ConfigureAwait(true);
            ApplyLocalFilterAndPaging(resetSelection: true);
        }
        catch (Exception ex)
        {
            _setSidebarStats("Error loading history");
            MessageBox.Show(this, ex.Message, "Order History", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }

    private void ApplyLocalFilterAndPaging(bool resetSelection)
    {
        if (_loadedRaw == null)
        {
            _filtered = [];
            _pager.PageCount = 1;
            _flow.Controls.Clear();
            _detail.Clear();
            _setSidebarStats("0 completed order(s)");
            return;
        }

        var q = _search.Text.Trim();
        IEnumerable<DataRow> rows = EnumerateRows(_loadedRaw);

        if (_status.SelectedIndex == 1) rows = rows.Where(r => GetInt(r, "orderStatusID") == 1);
        else if (_status.SelectedIndex == 2) rows = rows.Where(r => GetInt(r, "orderStatusID") == 2);
        else if (_status.SelectedIndex == 3) rows = rows.Where(r => GetInt(r, "orderStatusID") == 3);

        if (q.Length > 0)
        {
            rows = rows.Where(r =>
            {
                var blob = string.Join(" ",
                    GetStr(r, "orderNumber"),
                    CustomerName(r),
                    GetStr(r, "email"),
                    GetStr(r, "phone"),
                    GetDate(r, "orderDate").ToString("d", CultureInfo.CurrentCulture),
                    GetDate(r, "orderDate").ToString("D", CultureInfo.CurrentCulture));
                return blob.Contains(q, StringComparison.OrdinalIgnoreCase);
            });
        }

        var list = rows.ToList();
        list.Sort(CompareRows);
        _filtered = list;

        var completed = _filtered.Count(r => GetInt(r, "orderStatusID") == 2);
        _setSidebarStats($"{completed} completed order(s)");

        var pages = Math.Max(1, (int)Math.Ceiling(_filtered.Count / (double)_pageSize));
        _pager.PageCount = pages;
        var targetPage = resetSelection ? 1 : Math.Clamp(_pager.CurrentPage, 1, pages);
        _pager.SetPageSilent(targetPage);

        if (resetSelection)
            _selectedOrderId = -1;

        RebuildCurrentPage();
    }

    private int CompareRows(DataRow a, DataRow b)
    {
        return _sort.SelectedIndex switch
        {
            1 => GetDate(a, "orderDate").CompareTo(GetDate(b, "orderDate")),
            2 => Total(b).CompareTo(Total(a)),
            3 => Total(a).CompareTo(Total(b)),
            _ => GetDate(b, "orderDate").CompareTo(GetDate(a, "orderDate")),
        };
    }

    private static decimal Total(DataRow r) => GetDec(r, "subTotalAmount") + GetDec(r, "taxAmount");

    private void RebuildCurrentPage()
    {
        _flow.SuspendLayout();
        _flow.Controls.Clear();

        var start = (_pager.CurrentPage - 1) * _pageSize;
        for (var i = start; i < Math.Min(start + _pageSize, _filtered.Count); i++)
        {
            var row = _filtered[i];
            var orderId = GetInt(row, "orderID");
            var orderNumber = GetStr(row, "orderNumber");
            var name = CustomerName(row);
            var email = GetStr(row, "email");
            var phone = GetStr(row, "phone");
            var orderDate = GetDate(row, "orderDate");
            var spec = GetStr(row, "specialInstructions");
            var items = OrderDisplayHelpers.BuildHistoryItemsBlock(spec);
            var sub = GetDec(row, "subTotalAmount");
            var tax = GetDec(row, "taxAmount");
            var statusId = GetInt(row, "orderStatusID");

            var card = new HistoryOrderCardControl(orderId, orderNumber, name, email, phone, orderDate, items, sub, tax, statusId)
            {
                Width = Math.Max(480, _flow.Width - 4),
            };
            card.OrderSelected += (_, id) => SelectOrder(id);
            card.ViewDetailsClicked += (_, id) => SelectOrder(id);
            _flow.Controls.Add(card);
        }

        _flow.ResumeLayout(true);
        SyncFlowWidth();

        if (_filtered.Count == 0)
        {
            _detail.Clear();
            return;
        }

        if (_selectedOrderId < 0 || !_filtered.Any(r => GetInt(r, "orderID") == _selectedOrderId))
            _selectedOrderId = GetInt(_filtered[Math.Min(start, _filtered.Count - 1)], "orderID");

        SelectOrder(_selectedOrderId);
    }

    private void SelectOrder(int orderId)
    {
        _selectedOrderId = orderId;
        var match = _filtered.FirstOrDefault(r => GetInt(r, "orderID") == orderId);
        _detail.Bind(match);
    }

    /// <summary>Re-run local filters (search/sort/status) without hitting SQL.</summary>
    public void ApplyFiltersOnly()
    {
        if (_loadedRaw == null) return;
        ApplyLocalFilterAndPaging(resetSelection: false);
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

    private static IEnumerable<DataRow> EnumerateRows(DataTable table)
    {
        foreach (DataRow r in table.Rows)
            yield return r;
    }
}
