using System.Windows.Forms;

namespace OrderWatchingDesktop;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
        Application.ThreadException += (_, args) =>
        {
            ShowFatal(args.Exception, "Unhandled UI error");
        };
        AppDomain.CurrentDomain.UnhandledException += (_, args) =>
        {
            if (args.ExceptionObject is Exception ex)
                ShowFatal(ex, "Unhandled error");
        };

        try
        {
            Application.Run(new MainForm());
        }
        catch (Exception ex)
        {
            ShowFatal(ex, "Startup error");
        }
    }

    private static void ShowFatal(Exception ex, string title)
    {
        try
        {
            var msg = ex.ToString();
            if (msg.Length > 8000)
                msg = msg[..8000] + "\r\n…";
            MessageBox.Show(msg, $"Emperor's Choice · Orders — {title}", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        catch
        {
            /* last resort */
        }
    }
}
