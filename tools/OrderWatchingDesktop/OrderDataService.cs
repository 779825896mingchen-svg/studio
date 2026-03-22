using System.Data;
using System.Globalization;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace OrderWatchingDesktop;

internal sealed class OrderDataService
{
    private readonly bool _useSample;
    private readonly string? _connectionString;
    private readonly string _storeUserName;
    private readonly int _rowLimit;

    public OrderDataService(IConfiguration configuration)
    {
        _useSample = configuration.GetValue("OrderWatch:UseSampleData", false);
        _connectionString = configuration.GetConnectionString("Store");
        _storeUserName = configuration.GetSection("OrderWatch")["StoreUserName"] ?? "suj9988";
        _rowLimit = int.TryParse(configuration.GetSection("OrderWatch")["RowLimit"], out var rl) ? rl : 300;

        if (!_useSample && string.IsNullOrWhiteSpace(_connectionString))
            throw new InvalidOperationException("Missing ConnectionStrings:Store in appsettings.json (or set OrderWatch:UseSampleData to true).");
    }

    public bool UseSampleData => _useSample;

    public string StoreUserName => _storeUserName;

    public int RowLimit => _rowLimit;

    public async Task<DataTable> LoadLiveAsync(CancellationToken cancellationToken = default)
    {
        if (_useSample)
            return SampleOrderData.BuildLiveTable(_storeUserName);

        await using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);

        const string sqlLive = """
            SELECT TOP (@n)
              orderID,
              orderNumber,
              orderDate,
              orderStatusID,
              userName,
              email,
              firstName,
              lastName,
              LTRIM(RTRIM(CONCAT(ISNULL(firstName, N''), N' ', ISNULL(lastName, N'')))) AS customerName,
              shipToAddress AS phone,
              subTotalAmount,
              taxAmount,
              specialInstructions,
              createdOn,
              modifiedOn
            FROM dbo.CSK_Store_Order
            WHERE userName = @ui
            ORDER BY orderDate DESC, orderID DESC;
            """;

        await using var cmd = new SqlCommand(sqlLive, conn);
        cmd.Parameters.AddWithValue("@n", _rowLimit);
        cmd.Parameters.AddWithValue("@ui", _storeUserName);

        var table = new DataTable();
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        table.Load(reader);
        return table;
    }

    public async Task<DataTable> LoadHistoryAsync(DateTime rangeStart, DateTime rangeEnd, CancellationToken cancellationToken = default)
    {
        if (_useSample)
        {
            var all = SampleOrderData.BuildHistoryTable(_storeUserName);
            var filtered = all.Clone();
            foreach (DataRow r in all.Rows)
            {
                var d = Convert.ToDateTime(r["orderDate"], CultureInfo.InvariantCulture);
                if (d >= rangeStart && d <= rangeEnd)
                    filtered.ImportRow(r);
            }

            return filtered;
        }

        await using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync(cancellationToken).ConfigureAwait(false);

        const string sqlHistory = """
            SELECT TOP (@n)
              orderID,
              orderNumber,
              orderDate,
              orderStatusID,
              userName,
              email,
              firstName,
              lastName,
              LTRIM(RTRIM(CONCAT(ISNULL(firstName, N''), N' ', ISNULL(lastName, N'')))) AS customerName,
              shipToAddress AS phone,
              subTotalAmount,
              taxAmount,
              specialInstructions,
              createdOn,
              modifiedOn
            FROM dbo.CSK_Store_Order
            WHERE userName = @ui
              AND orderDate >= @from
              AND orderDate <= @to
            ORDER BY orderDate DESC, orderID DESC;
            """;

        await using var cmd = new SqlCommand(sqlHistory, conn);
        cmd.Parameters.AddWithValue("@n", _rowLimit);
        cmd.Parameters.AddWithValue("@ui", _storeUserName);
        cmd.Parameters.Add(new SqlParameter("@from", SqlDbType.DateTime2) { Value = rangeStart });
        cmd.Parameters.Add(new SqlParameter("@to", SqlDbType.DateTime2) { Value = rangeEnd });

        var table = new DataTable();
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken).ConfigureAwait(false);
        table.Load(reader);
        return table;
    }
}
