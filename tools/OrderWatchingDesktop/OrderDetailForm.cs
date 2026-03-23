using System.Data;
using System.Drawing;
using System.Windows.Forms;

namespace OrderWatchingDesktop;

/// <summary>Modal order summary using <see cref="EmperorOrderDetailPanel"/> (reference: details via View Details).</summary>
internal sealed class OrderDetailForm : Form
{
    private readonly EmperorOrderDetailPanel _detail = new() { Dock = DockStyle.Fill };

    public OrderDetailForm()
    {
        Text = "Order details";
        Size = new Size(560, 760);
        MinimumSize = new Size(480, 560);
        StartPosition = FormStartPosition.CenterParent;
        BackColor = EmperorPosTheme.BgMain;
        Font = EmperorPosTheme.FontUi(9.25f);
        Padding = new Padding(12, 12, 12, 12);

        var foot = new FlowLayoutPanel
        {
            Dock = DockStyle.Bottom,
            FlowDirection = FlowDirection.RightToLeft,
            Height = 44,
            Padding = new Padding(0, 4, 0, 8),
            BackColor = EmperorPosTheme.BgMain,
            WrapContents = false,
        };
        var closeBtn = OrdersUiDrawing.CreateActionButton(
            "Close",
            new Rectangle(0, 0, 120, 36),
            EmperorPosTheme.OrangePrimary,
            Color.White,
            12);
        closeBtn.AutoSize = false;
        closeBtn.Size = new Size(120, 36);
        closeBtn.Margin = new Padding(0);
        closeBtn.Click += (_, _) => Close();
        foot.Controls.Add(closeBtn);

        var host = new Panel { Dock = DockStyle.Fill, BackColor = EmperorPosTheme.BgMain };
        host.Controls.Add(_detail);

        Controls.Add(foot);
        Controls.Add(host);
    }

    public void Bind(DataRow row)
    {
        _detail.Bind(row);
    }
}
