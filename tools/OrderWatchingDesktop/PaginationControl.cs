using System.Drawing;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal sealed class PaginationControl : FlowLayoutPanel
{
    private int _page = 1;
    private int _pageCount = 1;

    public event EventHandler<int>? PageChanged;

    public PaginationControl()
    {
        FlowDirection = FlowDirection.LeftToRight;
        WrapContents = false;
        AutoSize = true;
        AutoSizeMode = AutoSizeMode.GrowAndShrink;
        BackColor = EmperorPosTheme.BgMain;
        Padding = new Padding(0, 16, 0, 8);
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
        Controls.Clear();
        Controls.Add(MkNav("◀", _page > 1, () => CurrentPage = _page - 1));

        if (_pageCount <= 7)
        {
            for (var i = 1; i <= _pageCount; i++)
                Controls.Add(MkPage(i, i == _page));
        }
        else
        {
            Controls.Add(MkPage(1, _page == 1));
            if (_page > 3)
                Controls.Add(MkEllipsis());
            for (var i = Math.Max(2, _page - 1); i <= Math.Min(_pageCount - 1, _page + 1); i++)
                Controls.Add(MkPage(i, i == _page));
            if (_page < _pageCount - 2)
                Controls.Add(MkEllipsis());
            Controls.Add(MkPage(_pageCount, _page == _pageCount));
        }

        Controls.Add(MkNav("▶", _page < _pageCount, () => CurrentPage = _page + 1));
    }

    private EmperorRichButton MkNav(string text, bool enabled, Action onClick)
    {
        var b = new EmperorRichButton
        {
            Caption = text,
            VisualStyle = EmperorRichButtonStyle.Pagination,
            Width = 40,
            Height = 36,
            Margin = new Padding(4, 0, 4, 0),
            Enabled = enabled,
            TabStop = false,
        };
        if (enabled)
            b.Click += (_, _) => onClick();
        return b;
    }

    private EmperorRichButton MkPage(int num, bool active)
    {
        var b = new EmperorRichButton
        {
            Caption = num.ToString(),
            VisualStyle = active ? EmperorRichButtonStyle.PaginationActive : EmperorRichButtonStyle.Pagination,
            Width = 40,
            Height = 36,
            Margin = new Padding(4, 0, 4, 0),
            TabStop = false,
        };
        var p = num;
        b.Click += (_, _) => CurrentPage = p;
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
