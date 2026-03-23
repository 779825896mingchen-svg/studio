-- OrderWatchingDesktop: run these against the same database as ConnectionStrings:Store (e.g. hokkaido5).
-- Use the userName value from results for OrderWatch:StoreUserName in appsettings.json.

-- 1) Latest orders (check userName matches StoreUserName)
SELECT TOP 50
  orderID,
  orderNumber,
  orderDate,
  orderStatusID,
  userName,
  email,
  subTotalAmount,
  taxAmount
FROM dbo.CSK_Store_Order
ORDER BY orderDate DESC, orderID DESC;

-- 2) Distinct store users (pick one for appsettings OrderWatch:StoreUserName)
SELECT userName, COUNT(*) AS orderCount
FROM dbo.CSK_Store_Order
GROUP BY userName
ORDER BY orderCount DESC;

-- 3) Today's orders
SELECT
  orderID,
  orderNumber,
  orderDate,
  userName,
  orderStatusID
FROM dbo.CSK_Store_Order
WHERE orderDate >= CAST(GETDATE() AS date)
  AND orderDate <  DATEADD(day, 1, CAST(GETDATE() AS date))
ORDER BY orderDate DESC;
