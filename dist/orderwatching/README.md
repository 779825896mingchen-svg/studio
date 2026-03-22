# orderwatching (Windows desktop)

Built **.NET Framework 4.8** WinForms app for watching/printing store orders (SOAP `hkinfo.asmx`).

## Run

1. Double‑click **`orderwatching.exe`** (same folder as `orderwatching.exe.config`).
2. The config file must sit next to the exe — it carries the web service URL and optional SQL connection strings.

## Rebuild (from source)

Source lives under **`Documents\Website App\orderwatching`**.

```powershell
dotnet build "C:\Users\video\Documents\Website App\orderwatching\orderwatching.Sdk.csproj" -c Release
```

Output: `bin\Release\net48\orderwatching.exe`

The **`orderwatching.Sdk.csproj`** SDK-style project was added so `dotnet build` works without full Visual Studio. The legacy **`orderwatching.csproj`** (net4.0) still exists but needs .NET Framework developer packs + MSBuild in PATH.

## Notes

- Decompiler fixes were applied in the source tree (backing fields for form controls, event names, etc.).
- See **`docs/orderwatching-integration.md`** in the website repo for checkout → SQL integration.
