import { describe, expect, it } from "vitest";
import { GameConfigResolver } from "./game-config-resolver";

describe("GameConfigResolver.resolve", () => {
  it("returns skyrim endpoint by default", () => {
    expect(GameConfigResolver.resolve("")).toEqual({
      endpoint: "https://www.confrerie-des-traducteurs.fr/skyrim/api/recherche/simple",
      gameParams: {},
    });
  });

  it("returns skyrim endpoint for unknown category", () => {
    expect(GameConfigResolver.resolve("unknown")).toEqual({
      endpoint: "https://www.confrerie-des-traducteurs.fr/skyrim/api/recherche/simple",
      gameParams: {},
    });
  });

  it("returns game-specific endpoint and params", () => {
    expect(GameConfigResolver.resolve("fallout4")).toEqual({
      endpoint: "https://www.confrerie-des-traducteurs.fr/fallout4/api/recherche/simple",
      gameParams: {},
    });
  });

  it("detects Skyrim Special Edition", () => {
    expect(GameConfigResolver.resolve("skyrimspecialedition")).toEqual({
      endpoint: "https://www.confrerie-des-traducteurs.fr/skyrim/api/recherche/simple",
      gameParams: { skyrim: 0, skyrimSE: 1 },
    });
  });

  it("detects legacy Skyrim", () => {
    expect(GameConfigResolver.resolve("skyrim")).toEqual({
      endpoint: "https://www.confrerie-des-traducteurs.fr/skyrim/api/recherche/simple",
      gameParams: { skyrim: 1, skyrimSE: 0 },
    });
  });
});
