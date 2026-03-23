using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

/// <summary>Rounded, combo-style picker with animated popup (replaces native ComboBox drop-down).</summary>
internal sealed class RoundedDropDownPicker : UserControl
{
    private readonly List<string> _items = [];
    private int _selectedIndex;
    private PickerPopupForm? _popup;
    private bool _suppressNextClick;

    public RoundedDropDownPicker()
    {
        DoubleBuffered = true;
        TabStop = true;
        Cursor = Cursors.Hand;
        BackColor = Color.Transparent;
        Font = EmperorPosTheme.FontUi(9.5f);
        ForeColor = EmperorPosTheme.TextPrimary;
        SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
        Height = 40;
    }

    public event EventHandler? SelectedIndexChanged;

    public IReadOnlyList<string> Items => _items;

    public void SetItems(IEnumerable<string> items)
    {
        _items.Clear();
        _items.AddRange(items);
        _selectedIndex = Math.Clamp(_selectedIndex, 0, Math.Max(0, _items.Count - 1));
        Invalidate();
    }

    public int SelectedIndex
    {
        get => _selectedIndex;
        set
        {
            var v = Math.Clamp(value, 0, Math.Max(0, _items.Count - 1));
            if (_selectedIndex == v) return;
            _selectedIndex = v;
            Invalidate();
            SelectedIndexChanged?.Invoke(this, EventArgs.Empty);
        }
    }

    public string? SelectedItem =>
        _items.Count == 0 || _selectedIndex < 0 || _selectedIndex >= _items.Count
            ? null
            : _items[_selectedIndex];

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        var r = ClientRectangle;
        var pill = OrdersUiDrawing.PillCornerRadius(r);
        OrdersUiDrawing.FillRoundedPanel(g, r, pill, EmperorPosTheme.CardWhite, EmperorPosTheme.BorderWarm, 1);

        var text = SelectedItem ?? "";
        var tr = new Rectangle(r.X + 10, r.Y, r.Width - 32, r.Height);
        TextRenderer.DrawText(g, text, Font, tr, EmperorPosTheme.TextPrimary,
            TextFormatFlags.VerticalCenter | TextFormatFlags.Left | TextFormatFlags.EndEllipsis);

        var chevron = "\u25BC";
        var cw = TextRenderer.MeasureText(chevron, Font).Width;
        TextRenderer.DrawText(g, chevron, Font,
            new Rectangle(r.Right - cw - 10, r.Y, cw, r.Height),
            EmperorPosTheme.TextMutedRef,
            TextFormatFlags.VerticalCenter | TextFormatFlags.HorizontalCenter);
    }

    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e);
        if (e.Button != MouseButtons.Left) return;
        if (_popup != null && !_popup.IsDisposed)
        {
            ClosePopup();
            _suppressNextClick = true;
            return;
        }
    }

    protected override void OnClick(EventArgs e)
    {
        base.OnClick(e);
        if (_suppressNextClick)
        {
            _suppressNextClick = false;
            return;
        }
        OpenPopup();
    }

    protected override void OnKeyDown(KeyEventArgs e)
    {
        base.OnKeyDown(e);
        if (e.KeyCode is Keys.Space or Keys.Enter or Keys.Down or Keys.F4)
        {
            e.Handled = true;
            e.SuppressKeyPress = true;
            OpenPopup();
        }
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            ClosePopup();
        base.Dispose(disposing);
    }

    private void OpenPopup()
    {
        if (_items.Count == 0) return;
        if (_popup != null && !_popup.IsDisposed) return;

        var ownerForm = FindForm();
        if (ownerForm == null) return;

        _popup = new PickerPopupForm(this, _items, _selectedIndex);
        _popup.ItemPicked += OnItemPicked;
        _popup.FormClosed += (_, _) =>
        {
            OutsideClickFilter.Unregister(_popup!);
            _popup = null;
        };

        var anchor = PointToScreen(Point.Empty);
        _popup.Width = Math.Max(Width, 120);
        _popup.Location = new Point(anchor.X, anchor.Y + Height);

        var wa = Screen.FromControl(this).WorkingArea;
        var targetH = _popup.TargetHeight;
        if (anchor.Y + Height + targetH > wa.Bottom)
            _popup.Location = new Point(anchor.X, anchor.Y - targetH);

        if (_popup.Left < wa.Left) _popup.Left = wa.Left;
        if (_popup.Right > wa.Right) _popup.Left = wa.Right - _popup.Width;

        OutsideClickFilter.Register(this, _popup);
        _popup.Show(ownerForm);
    }

    private void OnItemPicked(int index)
    {
        SelectedIndex = index;
        ClosePopup();
    }

    private void ClosePopup()
    {
        if (_popup == null || _popup.IsDisposed) return;
        OutsideClickFilter.Unregister(_popup);
        try { _popup.Close(); } catch { /* */ }
        _popup = null;
    }

    private sealed class PickerPopupForm : Form
    {
        private readonly PickerListPanel _list;
        private readonly System.Windows.Forms.Timer _timer = new() { Interval = 16 };
        private int _step;
        private readonly int _targetHeight;
        private bool _timerDisposed;
        private const int AnimSteps = 10;

        public int TargetHeight => _targetHeight;

        public event Action<int>? ItemPicked;

        public PickerPopupForm(RoundedDropDownPicker owner, IReadOnlyList<string> items, int selectedIndex)
        {
            FormBorderStyle = FormBorderStyle.None;
            ShowInTaskbar = false;
            StartPosition = FormStartPosition.Manual;
            BackColor = EmperorPosTheme.CardWhite;
            KeyPreview = true;

            var rowH = LogicalToDeviceUnits(36);
            var pad = LogicalToDeviceUnits(8);
            var maxH = LogicalToDeviceUnits(280);
            var listH = pad * 2 + items.Count * rowH;
            _targetHeight = Math.Min(listH, maxH);
            Height = 1;
            Width = Math.Max(owner.Width, LogicalToDeviceUnits(120));
            Opacity = 0;

            _list = new PickerListPanel(items, selectedIndex, rowH)
            {
                Dock = DockStyle.Fill,
                TabStop = true,
            };
            _list.ItemPicked += i => { ItemPicked?.Invoke(i); };

            Padding = new Padding(pad);
            Controls.Add(_list);

            _timer.Tick += OnAnimTick;
            _timer.Start();

            Shown += (_, _) => _list.Focus();

            KeyDown += (_, e) =>
            {
                if (e.KeyCode == Keys.Escape)
                {
                    e.Handled = true;
                    Close();
                }
            };
        }

        private void OnAnimTick(object? sender, EventArgs e)
        {
            _step++;
            var t = Math.Min(1.0, _step / (double)AnimSteps);
            Opacity = t;
            Height = Math.Max(1, (int)Math.Round(1 + (_targetHeight - 1) * t));
            ApplyRoundedRegion();

            if (_step >= AnimSteps)
            {
                _timer.Stop();
                if (!_timerDisposed)
                {
                    _timer.Dispose();
                    _timerDisposed = true;
                }
                Opacity = 1;
                Height = _targetHeight;
                ApplyRoundedRegion();
            }
        }

        private void ApplyRoundedRegion()
        {
            if (Width <= 0 || Height <= 0) return;
            using var path = OrdersUiDrawing.RoundedPath(new Rectangle(0, 0, Width - 1, Height - 1), 12);
            Region = new Region(path);
        }

        protected override void OnResize(EventArgs e)
        {
            base.OnResize(e);
            ApplyRoundedRegion();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            _timer.Stop();
            if (!_timerDisposed)
            {
                _timer.Dispose();
                _timerDisposed = true;
            }
            base.OnFormClosing(e);
        }
    }

    private sealed class PickerListPanel : Panel
    {
        private readonly IReadOnlyList<string> _items;
        private readonly int _rowHeight;
        private int _hover = -1;
        private int _highlight;

        public event Action<int>? ItemPicked;

        public PickerListPanel(IReadOnlyList<string> items, int selectedIndex, int rowHeight)
        {
            _items = items;
            _rowHeight = rowHeight;
            _highlight = Math.Clamp(selectedIndex, 0, Math.Max(0, items.Count - 1));
            DoubleBuffered = true;
            BackColor = EmperorPosTheme.CardWhite;
            TabStop = true;
            Cursor = Cursors.Hand;
            AutoScroll = true;
            AutoScrollMinSize = new Size(0, Math.Max(_rowHeight, _items.Count * _rowHeight + 2));
            Scroll += (_, _) => Invalidate();
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            base.OnMouseMove(e);
            var idx = HitTest(e.Y);
            if (idx != _hover)
            {
                _hover = idx;
                Invalidate();
            }
        }

        protected override void OnMouseLeave(EventArgs e)
        {
            base.OnMouseLeave(e);
            _hover = -1;
            Invalidate();
        }

        protected override void OnMouseClick(MouseEventArgs e)
        {
            base.OnMouseClick(e);
            var idx = HitTest(e.Y);
            if (idx >= 0 && idx < _items.Count)
                ItemPicked?.Invoke(idx);
        }

        private int HitTest(int clientY)
        {
            var scrollY = VerticalScroll.Enabled ? VerticalScroll.Value : 0;
            var y = clientY + scrollY;
            if (y < 0) return -1;
            var idx = y / _rowHeight;
            if (idx >= _items.Count) return -1;
            return idx;
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            // ScrollableControl paints in viewport coords; translate to scrollable document space.
            var sy = VerticalScroll.Enabled ? VerticalScroll.Value : 0;
            g.TranslateTransform(0, -sy);
            try
            {
            for (var i = 0; i < _items.Count; i++)
            {
                var y = i * _rowHeight;
                var rowRect = new Rectangle(0, y, ClientSize.Width, _rowHeight);
                Color bg;
                if (i == _hover)
                    bg = EmperorPosTheme.OrangeSoft;
                else if (i == _highlight)
                    bg = EmperorPosTheme.InputBg;
                else
                    bg = EmperorPosTheme.CardWhite;

                using (var b = new SolidBrush(bg))
                    g.FillRectangle(b, rowRect);

                var fg = EmperorPosTheme.TextPrimary;
                TextRenderer.DrawText(g, _items[i], EmperorPosTheme.FontUi(9.5f), rowRect, fg,
                    TextFormatFlags.VerticalCenter | TextFormatFlags.Left | TextFormatFlags.EndEllipsis | TextFormatFlags.LeftAndRightPadding);
            }
            }
            finally
            {
                g.ResetTransform();
            }
        }

        protected override void OnKeyDown(KeyEventArgs e)
        {
            base.OnKeyDown(e);
            if (_items.Count == 0) return;
            switch (e.KeyCode)
            {
                case Keys.Up:
                    e.Handled = true;
                    if (_highlight > 0)
                    {
                        _highlight--;
                        EnsureVisible(_highlight);
                        Invalidate();
                    }
                    break;
                case Keys.Down:
                    e.Handled = true;
                    if (_highlight < _items.Count - 1)
                    {
                        _highlight++;
                        EnsureVisible(_highlight);
                        Invalidate();
                    }
                    break;
                case Keys.Enter:
                    e.Handled = true;
                    ItemPicked?.Invoke(_highlight);
                    break;
            }
        }

        private void EnsureVisible(int index)
        {
            if (!VerticalScroll.Enabled) return;
            var top = index * _rowHeight;
            var bottom = top + _rowHeight;
            var cur = VerticalScroll.Value;
            var vmin = VerticalScroll.Minimum;
            var vmax = VerticalScroll.Maximum;
            if (top < cur)
                VerticalScroll.Value = Math.Clamp(top, vmin, vmax);
            else if (bottom > cur + ClientSize.Height)
                VerticalScroll.Value = Math.Clamp(bottom - ClientSize.Height, vmin, vmax);
        }
    }

    /// <summary>Closes popup when user clicks outside picker and popup.</summary>
    private sealed class OutsideClickFilter : IMessageFilter
    {
        private static OutsideClickFilter? _instance;
        private RoundedDropDownPicker? _picker;
        private Form? _popup;

        public static void Register(RoundedDropDownPicker picker, Form popup)
        {
            if (_instance != null)
                Application.RemoveMessageFilter(_instance);
            _instance = new OutsideClickFilter { _picker = picker, _popup = popup };
            Application.AddMessageFilter(_instance);
        }

        public static void Unregister(Form popup)
        {
            if (_instance?._popup == popup)
            {
                Application.RemoveMessageFilter(_instance);
                _instance = null;
            }
        }

        public bool PreFilterMessage(ref Message m)
        {
            if (_picker == null || _popup == null || _popup.IsDisposed) return false;
            const int wmLButtonDown = 0x0201;
            const int wmRButtonDown = 0x0204;
            if (m.Msg != wmLButtonDown && m.Msg != wmRButtonDown) return false;

            var screen = new Point(Cursor.Position.X, Cursor.Position.Y);
            var pickRect = _picker.RectangleToScreen(_picker.ClientRectangle);
            var popRect = _popup.Bounds;

            if (pickRect.Contains(screen) || popRect.Contains(screen))
                return false;

            try { _popup.Close(); } catch { /* */ }
            return false;
        }
    }
}
