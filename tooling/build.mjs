import { build } from "esbuild";
import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";

const root = process.cwd();
const srcDir = join(root, "src");
const distDir = join(root, "dist");
const staticExtensions = new Set([".css", ".html", ".json", ".png", ".svg", ".ttf"]);

rmSync(distDir, { recursive: true, force: true });

await build({
  entryPoints: {
    "background/service-worker": join(srcDir, "background/service-worker.ts"),
    "popup/popup": join(srcDir, "popup/popup.ts"),
    "scripts/mo2-download": join(srcDir, "features/mo2-download/index.ts"),
    "scripts/translation-finder": join(srcDir, "features/translation-finder/index.ts"),
  },
  bundle: true,
  format: "iife",
  target: "es2022",
  outdir: distDir,
  logLevel: "info",
});

copyStaticFiles(srcDir);

function copyStaticFiles(directory) {
  for (const entry of readdirSync(directory)) {
    const sourcePath = join(directory, entry);
    const stat = statSync(sourcePath);

    if (stat.isDirectory()) {
      copyStaticFiles(sourcePath);
      continue;
    }

    if (!staticExtensions.has(extname(entry))) {
      continue;
    }

    const outputPath = join(distDir, relative(srcDir, sourcePath));
    mkdirSync(dirname(outputPath), { recursive: true });
    copyFileSync(sourcePath, outputPath);
  }
}
