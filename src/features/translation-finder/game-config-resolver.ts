import type { GameConfig } from "./types";

const ENDPOINTS: Record<string, string> = {
  skyrim: "https://www.confrerie-des-traducteurs.fr/skyrim/api/recherche/simple",
  skyrimspecialedition: "https://www.confrerie-des-traducteurs.fr/skyrim/api/recherche/simple",
  oblivion: "https://www.confrerie-des-traducteurs.fr/oblivion/api/recherche/simple",
  morrowind: "https://www.confrerie-des-traducteurs.fr/morrowind/api/recherche/simple",
  fallout4: "https://www.confrerie-des-traducteurs.fr/fallout4/api/recherche/simple",
  newvegas: "https://www.confrerie-des-traducteurs.fr/fallout-new-vegas/api/recherche/simple",
  fallout3: "https://www.confrerie-des-traducteurs.fr/fallout3/api/recherche/simple",
};

export class GameConfigResolver {
  static resolve(gameCategory: string): GameConfig {
    const endpoint = ENDPOINTS[gameCategory] ?? ENDPOINTS["skyrim"] ?? "";
    const gameParams = this.getGameSpecificParams(gameCategory);

    return { endpoint, gameParams };
  }

  private static getGameSpecificParams(gameCategory: string): Record<string, number> {
    if (!gameCategory) {
      return {};
    }
    if (gameCategory.includes("skyrimspecialedition")) {
      return { skyrim: 0, skyrimSE: 1 };
    }
    if (gameCategory.includes("skyrim")) {
      return { skyrim: 1, skyrimSE: 0 };
    }
    return {};
  }
}
