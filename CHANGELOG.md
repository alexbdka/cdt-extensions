# Changelog

## 1.2.0 - 2026-07-06

### Added

- Full tooling: ESLint, Prettier, Vitest, and strict TypeScript.
- npm scripts: `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `check`, `build:watch`.
- Unit tests for shared code and both features:
  - `messages`, `settings`, `string-utils`.
  - `mo2-download`: CdT link parsing, `modl://` link generation.
  - `translation-finder`: result parsing, config resolution, search strategies.

### Changed

- Refactored the codebase to support strict TypeScript (`strict: true`, `noUncheckedIndexedAccess`).
- Removed explicit `any` types and unsafe casts.
- Strictly typed messages between the background, popup, and content scripts.
- Loggers no longer depend on the `debug` flag to simplify testing.
- Category and endpoint mappings are now pure, testable constants.

### Fixed

- `calculateSimilarity` returned `NaN` when both strings normalized to empty strings.
- `browser.ts` is now compatible with the Vitest/jsdom test environment.

## 1.1.1 - 2026-02-06

### Fixed

- Fixed the MO2 download flow:
  - Allows redirects to `*.confrerie-des-traducteurs.com`.
  - Resolves the final download URL and extracts the filename.
  - Adds the `filename` parameter to the `modl://` link to preserve the archive name.

## 1.1.0 - 2026-02-06

### Fixed

- Removed the `tabs` permission to resolve the "Purple Potassium" violation reported by the Google review team. The permission was not required because the extension does not access sensitive tab properties.

## 1.0.0 - 2026-02-01

- Initial release: CdT search from Nexus Mods and MODL link generation for MO2.
- Movable buttons and locally stored settings.
