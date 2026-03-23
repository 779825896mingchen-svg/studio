/*
  One-shot: normalizes store login typos to match OrderWatchingDesktop + website checkout.

  Target userName = N'suj9988' (same as ORDERWATCHING_UI in .env and OrderWatch:StoreUserName in appsettings.json).

  Run in SSMS against database hokkaido5 (or change USE below).

  If RowsUpdated = 0, your orders use a different userName — run OrderWatchQueries.sql first,
  then add that value to the IN (...) list below.
*/

USE [hokkaido5];
GO

SET NOCOUNT ON;

DECLARE @TargetUserName NVARCHAR(256) = N'suj9988';

BEGIN TRANSACTION;

UPDATE dbo.CSK_Store_Order
SET userName = @TargetUserName
WHERE userName IN (
    N'suji9888'
);

DECLARE @n INT = @@ROWCOUNT;
SELECT @n AS RowsUpdated;

IF @n = 0
BEGIN
    ROLLBACK TRANSACTION;
    PRINT N'No rows matched. Run OrderWatchQueries.sql, see userName column, add that exact value to the IN (...) list in this script.';
    RETURN;
END

COMMIT TRANSACTION;
PRINT N'OK: normalized userName -> ''' + @TargetUserName + N''' (' + CAST(@n AS NVARCHAR(20)) + N' row(s)).';
