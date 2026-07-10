# Contributing

## Project Shape

CdT Extensions is a Chrome Manifest V3 extension written in TypeScript. Source files live in `src/`; the Chrome-loadable extension is generated in `dist/`.

## Code Organization

- `src/background/`: service worker code and privileged extension operations.
- `src/features/`: feature-specific content script entrypoints injected into supported websites.
- `src/shared/`: module-based helpers shared by feature, popup, and background entrypoints.
- `src/templates/`: HTML fragments loaded by content scripts.
- `src/styles/`: shared content-script styles.
- `src/popup/`: extension popup UI.
- `src/assets/`: fonts and icons.
- `tooling/`: build scripts and local automation.
- `docs/`: GitHub Pages source for the public privacy policy.
- `dist/`: generated extension output, ignored by Git.

## Naming

Feature files should be named after the feature, not the direction of the integration. Prefer names like `translation-finder` and `mo2-download`.

## Feature Modules

Keep feature `index.ts` files as thin entrypoints. They should initialize shared browser state, read settings, and start the feature app. Feature behavior should be split by responsibility:

- `app.ts`: feature orchestration.
- `config.ts`: constants, selectors, endpoints, and UI state definitions.
- `types.ts`: feature-local type definitions.
- `ui.ts`: feature-specific widget wiring.
- focused service files for parsing, extraction, requests, URL resolution, and domain logic.

Use `src/shared/` only for code that is genuinely reused across features or extension surfaces.

## Browser API

Use imports from `src/shared/browser.ts` for extension API access:

- `runtimeUrl(path)`
- `storageGet(defaults)`
- `storageSet(values)`
- `sendMessage(message)`
- `onStorageChanged(listener)`

Avoid repeating `typeof browser !== 'undefined'` outside `src/shared/browser.ts`.

## Language

Developer-facing files, comments, logs, and repository documentation should be written in English. User-facing UI and public privacy policy content stay in French until proper i18n is introduced.

## TypeScript

The project uses TypeScript with strict mode enabled (`strict: true`, `noUncheckedIndexedAccess`). Chrome loads the generated files referenced by `dist/manifest.json`.

Run the full quality gate:

```sh
npm run check
```

Build:

```sh
npm run build
```

## Linting and Formatting

ESLint and Prettier are enforced in CI. Run them locally with:

```sh
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Testing

Unit tests live next to the source files as `*.test.ts` and run with Vitest/jsdom.

Run tests once:

```sh
npm run test
```

Run tests in watch mode:

```sh
npm run test:watch
```

Keep business logic pure and testable. Avoid depending on browser APIs or runtime configuration in units under test; mock the `TranslationSearchClient` interface and other collaborators when needed.

## Bundling

The build uses esbuild. Extension entrypoints are declared in `tooling/build.mjs` and bundled to the paths expected by `src/manifest.json`:

- `src/background/service-worker.ts` -> `dist/background/service-worker.js`
- `src/popup/popup.ts` -> `dist/popup/popup.js`
- `src/features/mo2-download/index.ts` -> `dist/scripts/mo2-download.js`
- `src/features/translation-finder/index.ts` -> `dist/scripts/translation-finder.js`

Static files such as `manifest.json`, templates, styles, icons, and fonts are copied from `src/` to `dist/`.
