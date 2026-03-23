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
    private readonly System.Windows.Forms.Timer _searchDebounce = new() { Interval = 280 };
    private readonly RoundedDropDownPicker _status = new();
    private readonly RoundedDropDownPicker _dateRange = new();
    private readonly RoundedDropDownPicker _sort = new();
    private readonly Panel _toolbarChrome = new();
    private readonly Panel _scrollHost = new();
    private readonly FlowLayoutPanel _flow = new();
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
            Height = 56,
            BackColor = EmperorPosTheme.BgMain,
            Padding = new Padding(24, 10, 24, 4),
        };
        header.Controls.Add(new Label
        {
            Text = "Order History",
            Font = EmperorPosTheme.FontSemi(28f),
            ForeColor = EmperorPosTheme.TextPrimary,
            AutoSize = true,
            Location = new Point(4, 6),
        });

        BuildToolbar();

        _searchDebounce.Tick += (_, _) =>
        {
            _searchDebounce.Stop();
            if (_loadedRaw != null)
                ApplyFiltersOnly();
        };

        var listShell = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 2,
            BackColor = EmperorPosTheme.BgMain,
        };
        listShell.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));
        listShell.RowStyles.Add(new RowStyle(SizeType.Absolute, 64f));

        _scrollHost.Dock = DockStyle.Fill;
        _scrollHost.Padding = new Padding(20, 8, 20, 8);
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

        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 3,
            BackColor = EmperorPosTheme.BgMain,
        };
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 56f));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 72f));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));
        root.Controls.Add(header, 0, 0);
        root.Controls.Add(_toolbarChrome, 0, 1);
        root.Controls.Add(listShell, 0, 2);

        Controls.Add(root);
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _searchDebounce.Stop();
            _searchDebounce.Dispose();
        }
        base.Dispose(disposing);
    }

    private void BuildToolbar()
    {
        _toolbarChrome.Dock = DockStyle.Fill;
        _toolbarChrome.Padding = new Padding(20, 2, 20, 8);
        _toolbarChrome.BackColor = EmperorPosTheme.BgMain;

        var outer = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = EmperorPosTheme.CardWhite,
            Padding = new Padding(1),
        };
        var card = new RoundedCardPanel(14)
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(12, 10, 12, 10),
            BackColor = EmperorPosTheme.InputBg,
        };

        var row = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 6,
            RowCount = 1,
            BackColor = EmperorPosTheme.InputBg,
        };
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 36f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 38f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 128f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 132f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 118f));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 108f));
        row.RowStyles.Add(new RowStyle(SizeType.Absolute, 48f));

        var icon = new Label
        {
            Text = "\uD83D\uDD0D",
            Font = new Font("Segoe UI Emoji", 11f),
            ForeColor = EmperorPosTheme.TextMutedRef,
            TextAlign = ContentAlignment.MiddleCenter,
            Dock = DockStyle.Fill,
        };

        var searchWrap = new Panel
        {
            Dock = DockStyle.Fill,
            Margin = new Padding(0, 2, 0, 2),
            BackColor = EmperorPosTheme.CardWhite,
        };
        _search.Dock = DockStyle.Fill;
        _search.Font = EmperorPosTheme.FontUi(10.25f);
        _search.BorderStyle = BorderStyle.FixedSingle;
        _search.BackColor = EmperorPosTheme.CardWhite;
        _search.ForeColor = EmperorPosTheme.TextPrimary;
        _search.PlaceholderText = "Search orders…";

        var clearSearch = new Button
        {
            Text = "\u2715",
            Dock = DockStyle.Right,
            Width = 30,
            Height = 36,
            FlatStyle = FlatStyle.Flat,
            TabStop = false,
            Font = EmperorPosTheme.FontSemi(10f),
            ForeColor = EmperorPosTheme.TextMutedRef,
            BackColor = EmperorPosTheme.CardWhite,
            Visible = false,
            Cursor = Cursors.Hand,
        };
        clearSearch.FlatAppearance.BorderSize = 0;
        clearSearch.Click += (_, _) =>
        {
            _search.Clear();
            _searchDebounce.Stop();
            if (_loadedRaw != null)
                ApplyFiltersOnly();
            clearSearch.Visible = false;
        };
        _search.TextChanged += (_, _) =>
        {
            clearSearch.Visible = _search.TextLength > 0;
            _searchDebounce.Stop();
            _searchDebounce.Start();
        };

        searchWrap.Controls.Add(_search);
        searchWrap.Controls.Add(clearSearch);
        clearSearch.BringToFront();

        StylePicker(_status, ["All statuses", "Pending", "Completed", "Canceled"], 2);
        StylePicker(_dateRange, ["All Time", "Today", "This Week", "This Month"], 0);
        StylePicker(_sort, ["Newest first", "Oldest first"], 0);

        var filterBtn = OrdersUiDrawing.CreateActionButton(
            "Filter",
            new Rectangle(0, 0, 100, 40),
            EmperorPosTheme.OrangePrimary,
            Color.White,
            12);
        filterBtn.Dock = DockStyle.Fill;
        filterBtn.Margin = new Padding(8, 2, 0, 2);
        filterBtn.TabIndex = 20;
        filterBtn.Click += async (_, _) => await ReloadFromServerAndApplyAsync();

        row.Controls.Add(icon, 0, 0);
        row.Controls.Add(searchWrap, 1, 0);
        row.Controls.Add(_status, 2, 0);
        row.Controls.Add(_dateRange, 3, 0);
        row.Controls.Add(_sort, 4, 0);
        row.Controls.Add(filterBtn, 5, 0);

        card.Controls.Add(row);
        outer.Controls.Add(card);
        _toolbarChrome.Controls.Add(outer);
    }

    private static void StylePicker(RoundedDropDownPicker picker, string[] items, int selected)
    {
        picker.Dock = DockStyle.Fill;
        picker.Margin = new Padding(6, 4, 6, 4);
        picker.SetItems(items);
        picker.SelectedIndex = Math.Clamp(selected, 0, items.Length - 1);
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
        var today = DateTime.Today;
        var endOfToday = today.AddDays(1).AddTicks(-1);
        return _dateRange.SelectedIndex switch
        {
            0 => (today.AddYears(-5), today.AddDays(1)),
            1 => (today, endOfToday),
            2 => (StartOfWeek(today), endOfToday),
            3 => (new DateTime(today.Year, today.Month, 1), endOfToday),
            _ => (today.AddYears(-5), today.AddDays(1)),
        };
    }

    private static DateTime StartOfWeek(DateTime dt)
    {
        var fd = CultureInfo.CurrentCulture.DateTimeFormat.FirstDayOfWeek;
        var diff = (7 + (dt.DayOfWeek - fd)) % 7;
        return dt.AddDays(-diff).Date;
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
            _ => GetDate(b, "orderDate").CompareTo(GetDate(a, "orderDate")),
        };
    }

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
            card.ViewDetailsClicked += (_, id) => OpenOrderDetail(id);
            _flow.Controls.Add(card);
        }

        _flow.ResumeLayout(true);
        SyncFlowWidth();

        if (_filtered.Count == 0)
            return;

        if (_selectedOrderId < 0 || !_filtered.Any(r => GetInt(r, "orderID") == _selectedOrderId))
            _selectedOrderId = GetInt(_filtered[Math.Min(start, _filtered.Count - 1)], "orderID");

        ApplySelectionHighlight();
    }

    private void SelectOrder(int orderId)
    {
        _selectedOrderId = orderId;
        ApplySelectionHighlight();
    }

    private void ApplySelectionHighlight()
    {
        foreach (HistoryOrderCardControl c in _flow.Controls.OfType<HistoryOrderCardControl>())
            c.Selected = c.OrderId == _selectedOrderId;
    }

    private void OpenOrderDetail(int orderId)
    {
        var match = _filtered.FirstOrDefault(r => GetInt(r, "orderID") == orderId);
        if (match == null) return;
        using var dlg = new OrderDetailForm();
        dlg.Bind(match);
        dlg.ShowDialog(this);
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
