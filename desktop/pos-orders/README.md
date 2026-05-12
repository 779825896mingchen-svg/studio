# EmperorsChoicePOS (Electron)

Windows desktop app to view live pickup orders.

## Backend prerequisite

Run the Next.js site (`npm run dev` from the repo root). Orders are loaded from **`GET /api/pos/orders`** using a shared **`POS_API_KEY`** (see root `.env`).

## Configure this app

You can either:

- Use the in-app **Settings** (stored on the PC), or
- Create `.env` from `.env.example`

You must provide:

- `VITE_POS_SITE_URL` — website origin only (e.g. `http://localhost:9003`)
- `VITE_POS_API_KEY` — **exactly the same** as `POS_API_KEY` in the Next.js `.env`

**Packaged Windows app:** put a `.env` file **in the same folder as** `EmperorsChoicePOS.exe` (for example `...\release\win-unpacked\`). Values match `VITE_*` above.

**Dev:** `.env` lives in `desktop/pos-orders/`. After changing it, restart `npm run dev`.

## Dev

```bash
npm run dev
```

## Build Windows installer (.exe)

```bash
npm run dist
```

Output is under `release/` (installer + `win-unpacked/`). That folder is **gitignored** — it is hundreds of MB and must not be committed; distribute builds via Drive / releases page instead.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
