# CdT Extensions

Unofficial Chrome extension for Nexus Mods, Confrerie des Traducteurs (CdT), and Mod Organizer 2 workflows.

## Features

- Finds a CdT translation from a Nexus Mods mod page.
- Builds a Mod Organizer 2 compatible `modl://` download link from supported CdT mod pages.
- Provides movable buttons with settings stored locally in the browser.

## Install In Developer Mode

1. Install dependencies with `npm install`.
2. Build the extension with `npm run build`.
3. Open `chrome://extensions`.
4. Enable developer mode.
5. Load the generated `dist/` folder as an unpacked extension.

## Development

Run the full quality check (typecheck, lint, format, tests):

```sh
npm run check
```

Build the Chrome-loadable extension:

```sh
npm run build
```

Run tests in watch mode during development:

```sh
npm run test:watch
```

The source lives in `src/`; `npm run build` bundles the TypeScript entrypoints with esbuild and writes the Chrome-loadable extension to `dist/`. The generated `dist/` folder is ignored by Git.

## Privacy Policy

The public privacy policy is published with GitHub Pages:

`https://alexbdka.github.io/cdt-extensions/privacy-policy/`

## Support

Contact: `aaltchv@proton.me`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for project structure and coding conventions.

## License

See [LICENSE.md](LICENSE.md) and [licenses/](licenses/) for project and third-party licenses.
