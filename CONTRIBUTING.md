# Contributing

## Development setup

The project is a Manifest V3 Chrome extension written in TypeScript. Install Node.js 22 or
later, then run:

```sh
npm ci
npm run check
npm run build
```

`npm run check` runs the typecheck, lint, formatting, and unit tests. Use
`npm run test:watch` while developing. The generated `dist/` directory is ignored by Git.

## Code organization

- `src/background/`: service worker and privileged extension operations.
- `src/features/`: feature entrypoints and feature-specific logic.
- `src/shared/`: code shared by multiple extension surfaces.
- `src/popup/`: extension popup.
- `src/templates/` and `src/styles/`: content-script UI resources.
- `tooling/`: build tooling.
- `www/`: static GitHub Pages website.

Keep feature entrypoints thin, put reusable logic in focused modules, and add unit tests for
pure business logic. Use `src/shared/browser.ts` for extension API access.

## Conventions

Use English for code, comments, logs, and developer documentation. User-facing UI and privacy
policy text remain in French. Follow the existing TypeScript, ESLint, and Prettier configuration.

Pull requests should explain the user-visible impact and include tests or a clear reason when
tests are not applicable.
