import { describe, expect, it } from "vitest";
import { ModManagerLinkGenerator } from "./mod-manager-link";

describe("ModManagerLinkGenerator", () => {
  it("returns null when downloadUrl is missing", () => {
    const generator = new ModManagerLinkGenerator("skyrim");
    expect(generator.generate(null, "file.zip")).toBeNull();
  });

  it("returns null when gameId is empty", () => {
    const generator = new ModManagerLinkGenerator("");
    expect(generator.generate("https://example.com/mod.zip", "file.zip")).toBeNull();
  });

  it("generates a link without filename", () => {
    const generator = new ModManagerLinkGenerator("skyrim");
    const link = generator.generate("https://example.com/mod.zip");
    expect(link).toBe("modl://skyrim/?url=https%3A%2F%2Fexample.com%2Fmod.zip");
  });

  it("generates a link with filename", () => {
    const generator = new ModManagerLinkGenerator("skyrimse");
    const link = generator.generate("https://example.com/mod.zip", "My Mod.zip");
    expect(link).toBe(
      "modl://skyrimse/?url=https%3A%2F%2Fexample.com%2Fmod.zip&filename=My%20Mod.zip",
    );
  });
});
