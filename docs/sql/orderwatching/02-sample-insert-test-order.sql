/*
  Manual test insert — same shape as the website (store-sql-order.ts).

  Use this ONLY on a dev database. Edit @ui to match ORDERWATCHING_UI / get_order third arg.

  After running, refresh orderwatching or wait for its timer; you should see a row for "today"
  IF the app calls get_order against the SAME server/database this script ran on.
*/

USE [hokkaido5]; -- change if needed
GO

SET NOCOUNT ON;

DECLARE @ui VARCHAR(100) = 'suj9988';
DECLARE @g UNIQUEIDENTIFIER = NEWID();
-- orderNumber max length 50 (legacy typed dataset)
DECLARE @num NVARCHAR(50) = LEFT(N'WEB-T-' + CONVERT(VARCHAR(8), GETDATE(), 112) + N'-' + RIGHT(REPLACE(CAST(@g AS VARCHAR(36)), '-', ''), 10), 50);

INSERT INTO dbo.CSK_Store_Order (
  orderGuid, orderNumber, orderDate, orderStatusID, userName, email,
  firstName, lastName, shippingMethod, subTotalAmount, shippingAmount,
  handlingAmount, taxAmount, taxRate, couponCodes, discountAmount,
  specialInstructions, shipToAddress, billToAddress, userIP,
  shippingTrackingNumber, numberOfPackages, packagingNotes, createdOn,
  createdBy, modifiedOn, modifiedBy, address1, paymentMethod, address2, city
)
VALUES (
  CAST(@g AS NVARCHAR(50)),                    -- orderGuid
  @num,
  CAST(GETDATE() AS SMALLDATETIME),            -- orderDate
  1,                                           -- orderStatusID (adjust if your DB uses another "new" status)
  @ui,
  N'test@example.com',
  N'Test', N'Customer',
  N'Pickup',
  10.00, 0, 0,
  0.80, 0.0800, N'', 0,
  N'Pickup: ASAP' + CHAR(10) + N'Phone: 9195551212' + CHAR(10) + CHAR(10) + N'--- Items ---' + CHAR(10) + N'1× Sample @ $10.00',
  N'Phone: (919) 555-1212',
  N'',
  N'127.0.0.1',
  N'', 0, N'',
  SYSUTCDATETIME(), N'website',
  SYSUTCDATETIME(), N'website',
  N'10125 US-70 BUS',
  N'Pay at pickup',
  N'',
  N'Clayton, NC 27520'
);

SELECT SCOPE_IDENTITY() AS new_orderID, @g AS orderGuid_used;
GO
