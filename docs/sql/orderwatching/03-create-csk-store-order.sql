/*
  CREATE dbo.CSK_Store_Order — matches orderwatching DataSet1 + website insert (store-sql-order.ts).

  Run in SSMS after you have a user database (e.g. hokkaido5).
  If production already has this table, prefer: backup/restore or Generate Scripts from prod instead.

  Steps:
  1) New Query
  2) Change USE line to your database name
  3) Execute (F5)
*/

USE [hokkaido5];  -- <-- change if your database name differs
GO

IF OBJECT_ID(N'dbo.CSK_Store_Order', N'U') IS NOT NULL
BEGIN
  RAISERROR('Table dbo.CSK_Store_Order already exists. Drop it first only if you are sure.', 16, 1);
  RETURN;
END
GO

CREATE TABLE [dbo].[CSK_Store_Order] (
  [orderID]                  INT IDENTITY(1,1) NOT NULL,
  [orderGuid]                NVARCHAR(50)  NOT NULL,
  [orderNumber]              NVARCHAR(50)  NULL,
  [orderDate]                SMALLDATETIME NOT NULL,
  [orderStatusID]            INT           NOT NULL,
  [userName]                 NVARCHAR(100) NOT NULL,
  [email]                    NVARCHAR(50)  NULL,
  [firstName]                NVARCHAR(50)  NULL,
  [lastName]                 NVARCHAR(50)  NULL,
  [shippingMethod]           NVARCHAR(100) NULL,
  [subTotalAmount]           MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_subTotal] DEFAULT (0),
  [shippingAmount]           MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_ship] DEFAULT (0),
  [handlingAmount]           MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_hand] DEFAULT (0),
  [taxAmount]                MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_tax] DEFAULT (0),
  [taxRate]                  DECIMAL(18,4) NOT NULL CONSTRAINT [DF_CSK_Store_Order_taxRate] DEFAULT (0),
  [couponCodes]              NVARCHAR(50)  NULL,
  [discountAmount]           MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_disc] DEFAULT (0),
  [specialInstructions]      NVARCHAR(500) NULL,
  [shipToAddress]            NVARCHAR(500) NULL,
  [billToAddress]            NVARCHAR(500) NULL,
  [userIP]                   NVARCHAR(50)  NOT NULL CONSTRAINT [DF_CSK_Store_Order_ip] DEFAULT (N'0.0.0.0'),
  [shippingTrackingNumber]   NVARCHAR(500) NULL,
  [numberOfPackages]         INT           NOT NULL CONSTRAINT [DF_CSK_Store_Order_pkgs] DEFAULT (0),
  [packagingNotes]           NVARCHAR(2500) NULL,
  [createdOn]                DATETIME2(7)  NOT NULL CONSTRAINT [DF_CSK_Store_Order_createdOn] DEFAULT (SYSUTCDATETIME()),
  [createdBy]                NVARCHAR(50)  NULL,
  [modifiedOn]               DATETIME2(7)  NOT NULL CONSTRAINT [DF_CSK_Store_Order_modOn] DEFAULT (SYSUTCDATETIME()),
  [modifiedBy]               NVARCHAR(50)  NULL,
  [address1]                 NVARCHAR(50)  NULL,
  [paymentMethod]            NVARCHAR(50)  NULL,
  [address2]                 NVARCHAR(50)  NULL,
  [city]                     NVARCHAR(50)  NULL,
  CONSTRAINT [PK_CSK_Store_Order] PRIMARY KEY CLUSTERED ([orderID] ASC)
);
GO

CREATE NONCLUSTERED INDEX [IX_CSK_Store_Order_userName_orderDate]
  ON [dbo].[CSK_Store_Order] ([userName] ASC, [orderDate] DESC);
GO

PRINT 'Created dbo.CSK_Store_Order.';
GO
