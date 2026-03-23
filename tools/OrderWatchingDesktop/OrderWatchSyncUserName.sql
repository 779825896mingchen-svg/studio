/*
  OrderWatchingDesktop — make CSK_Store_Order.userName match appsettings.json

  Step 1: Run the whole file once (Section A only runs — preview).
  Step 2: Note the wrong userName from the results.
  Step 3: Uncomment Section B, set @OldUserName, run Section B only (or the whole file).

  Database: change USE [hokkaido5] if your Initial Catalog in appsettings differs.
  Target: must match OrderWatch:StoreUserName (default suj9988).
*/

USE [hokkaido5];
GO

SET NOCOUNT ON;

/* ===================== Section A — PREVIEW (safe) ===================== */
PRINT N'--- userName counts (pick the value to replace) ---';
SELECT userName, COUNT(*) AS orderCount
FROM dbo.CSK_Store_Order
GROUP BY userName
ORDER BY orderCount DESC;
GO

/*
===================== Section B — UPDATE (uncomment when ready) =====================

USE [hokkaido5];
GO

SET NOCOUNT ON;

DECLARE @TargetUserName NVARCHAR(256) = N'suj9988';
DECLARE @OldUserName NVARCHAR(256) = N'suji9888';

BEGIN TRANSACTION;

UPDATE dbo.CSK_Store_Order
SET userName = @TargetUserName
WHERE userName = @OldUserName;

SELECT @@ROWCOUNT AS RowsUpdated;

-- Check the count, then run ONE of:
COMMIT TRANSACTION;
-- ROLLBACK TRANSACTION;

====================================================================================
*/
