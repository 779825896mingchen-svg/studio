/*
  Orderwatching / website checkout — verify dbo.CSK_Store_Order
  
  Run in SSMS against the SAME database your connection string uses
  (e.g. hokkaido5 on localhost, or the production catalog behind hkinfo.asmx).

  What to check:
  - Table exists
  - Columns match what the website inserts (see store-sql-order.ts)
  - Rows for userName = 'suj9988' (or your ORDERWATCHING_UI) show up for "today"
*/

USE [hokkaido5]; -- change if your DB name differs
GO

-- 1) Table exists?
IF OBJECT_ID(N'dbo.CSK_Store_Order', N'U') IS NULL
BEGIN
  RAISERROR('dbo.CSK_Store_Order not found in this database.', 16, 1);
END
ELSE
  SELECT 'OK: dbo.CSK_Store_Order exists' AS [status];
GO

-- 2) Column list (compare to INSERT in CSK_Store_OrderTableAdapter / store-sql-order.ts)
SELECT
  c.name AS column_name,
  t.name AS type_name,
  c.max_length,
  c.precision,
  c.scale,
  c.is_nullable
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID(N'dbo.CSK_Store_Order')
ORDER BY c.column_id;
GO

-- 3) Recent orders for the store user the desktop app uses (Form1_chinese.cs → get_order(..., 'suj9988'))
DECLARE @ui VARCHAR(100) = 'suj9988'; -- set to ORDERWATCHING_UI if different

SELECT TOP 25
  orderID,
  orderNumber,
  orderDate,
  orderStatusID,
  userName,
  email,
  firstName,
  lastName,
  subTotalAmount,
  taxAmount,
  LEFT(specialInstructions, 120) AS specialInstructions_preview,
  createdOn,
  createdBy
FROM dbo.CSK_Store_Order
WHERE userName = @ui
ORDER BY orderDate DESC, orderID DESC;
GO

-- 4) Count today (same date window orderwatching uses: start of day → end of day)
DECLARE @ui2 VARCHAR(100) = 'suj9988';

SELECT COUNT(*) AS orders_today_for_ui
FROM dbo.CSK_Store_Order
WHERE userName = @ui2
  AND orderDate >= CAST(GETDATE() AS DATE)
  AND orderDate < DATEADD(DAY, 1, CAST(GETDATE() AS DATE));
GO
