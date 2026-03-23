using System.Drawing;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal sealed class PaginationControl : Panel
{
    private readonly FlowLayoutPanel _flow = new();

    private int _page = 1;
    private int _pageCount = 1;

    public event EventHandler<int>? PageChanged;

    public PaginationControl()
    {
        EmperorDrawing.EnableDoubleBuffer(this);
        BackColor = EmperorPosTheme.InputBg;
        Padding = new Padding(16, 10, 16, 10);

        _flow.Dock = DockStyle.Fill;
        _flow.FlowDirection = FlowDirection.LeftToRight;
        _flow.WrapContents = false;
        _flow.AutoSize = true;
        _flow.AutoSizeMode = AutoSizeMode.GrowAndShrink;
        _flow.BackColor = EmperorPosTheme.InputBg;
        _flow.Padding = new Padding(0);

        Controls.Add(_flow);
        Rebuild();
    }

    public int CurrentPage
    {
        get => _page;
        set
        {
            var v = Math.Clamp(value, 1, Math.Max(1, _pageCount));
            if (_page == v) return;
            _page = v;
            Rebuild();
            PageChanged?.Invoke(this, _page);
        }
    }

    public int PageCount
    {
        get => _pageCount;
        set
        {
            _pageCount = Math.Max(1, value);
            _page = Math.Clamp(_page, 1, _pageCount);
            Rebuild();
        }
    }

    public void SetPageSilent(int page)
    {
        _page = Math.Clamp(page, 1, Math.Max(1, _pageCount));
        Rebuild();
    }

    private void Rebuild()
    {
        _flow.Controls.Clear();
        _flow.Controls.Add(MkNav("\u2039", _page > 1, () => CurrentPage = _page - 1));

        if (_pageCount <= 7)
        {
            for (var i = 1; i <= _pageCount; i++)
                ControlsAddPage(i, i == _page);
        }
        else
        {
            ControlsAddPage(1, _page == 1);
            if (_page > 3)
                _flow.Controls.Add(MkEllipsis());
            for (var i = Math.Max(2, _page - 1); i <= Math.Min(_pageCount - 1, _page + 1); i++)
                ControlsAddPage(i, i == _page);
            if (_page < _pageCount - 2)
                _flow.Controls.Add(MkEllipsis());
            ControlsAddPage(_pageCount, _page == _pageCount);
        }

        _flow.Controls.Add(MkNav("\u203A", _page < _pageCount, () => CurrentPage = _page + 1));
    }

    private void ControlsAddPage(int num, bool active)
    {
        var b = OrdersUiDrawing.CreatePageButton(num.ToString(), new Rectangle(0, 0, 40, 36), active);
        b.Size = new Size(40, 36);
        b.Margin = new Padding(4, 0, 4, 0);
        b.TabStop = false;
        var p = num;
        b.Click += (_, _) => CurrentPage = p;
        _flow.Controls.Add(b);
    }

    private Button MkNav(string text, bool enabled, Action onClick)
    {
        var b = OrdersUiDrawing.CreatePlainPageButton(text, new Rectangle(0, 0, 40, 36));
        b.Size = new Size(40, 36);
        b.Margin = new Padding(4, 0, 4, 0);
        b.Enabled = enabled;
        b.TabStop = false;
        if (enabled)
            b.Click += (_, _) => onClick();
        return b;
    }

    private Label MkEllipsis()
    {
        return new Label
        {
            Text = "…",
            AutoSize = true,
            Padding = new Padding(8, 10, 8, 0),
            ForeColor = EmperorPosTheme.TextSecondary,
            Font = EmperorPosTheme.FontUi(11f),
        };
    }
}
