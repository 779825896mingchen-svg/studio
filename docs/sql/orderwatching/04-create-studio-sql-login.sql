/*
  SQL login for Node.js checkout (Tedious) — Windows/Trusted auth usually fails from Node.

  Run in SSMS as a sysadmin (sa or Windows admin), database context can be master.

  1) If the server is Windows-only auth: enable Mixed Mode
     Right-click server -> Properties -> Security -> "SQL Server and Windows Authentication mode" -> OK
     Restart SQL Server (SQLEXPRESS) in services.msc

  2) Edit the password in CREATE LOGIN below (use the SAME value in .env Password=...)

  3) Execute this script (F5)

  4) .env example:
     STORE_SQL_CONNECTION_STRING="Server=localhost\\SQLEXPRESS;Database=hokkaido5;User Id=studio_store;Password=YOUR_PASSWORD;Encrypt=true;TrustServerCertificate=true"
     (No Trusted_Connection when using SQL auth.)
*/

USE [master];
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'studio_store')
BEGIN
  CREATE LOGIN [studio_store] WITH PASSWORD = N'StudioStore_Dev1!';
END
ELSE
BEGIN
  -- Login already exists; reset password if .env does not match:
  -- ALTER LOGIN [studio_store] WITH PASSWORD = N'StudioStore_Dev1!';
  PRINT 'Login studio_store already exists. Skip CREATE or run ALTER LOGIN to change password.';
END
GO

USE [hokkaido5];
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'studio_store')
BEGIN
  CREATE USER [studio_store] FOR LOGIN [studio_store];
END
GO

ALTER ROLE [db_datawriter] ADD MEMBER [studio_store];
ALTER ROLE [db_datareader] ADD MEMBER [studio_store];
GO

PRINT 'Login [studio_store] ready. Put the same password in STORE_SQL_CONNECTION_STRING in .env.';
GO
