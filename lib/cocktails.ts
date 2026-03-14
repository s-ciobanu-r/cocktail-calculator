export type RecipeMap = Record<string, Record<string, number>>;
export type CategoryMap = Record<string, string>;
export type TotalsMap = Record<string, number>;
export type GroupedMap = Record<string, TotalsMap>;

export const recipes: RecipeMap = {
  "Negroni": {
    "Tanqueray No. Ten": 247.5,
    "Campari": 206,
    "Carpano Antica Formula": 165,
    "Belsazar Rosé": 82.5,
    "Cointreau": 41,
    "The Bitter Truth Orange Bitters": 8,
  },
  "Boulevardier": {
    "Maker’s Mark": 310,
    "Carpano Antica Formula": 181,
    "Grand Marnier": 78,
    "Campari": 181,
  },
  "Melon Blossom": {
    "Bombay Sapphire": 400,
    "Midori": 200,
    "Monin Elderflower Syrup": 150,
  },
  "Pornstar Martini": {
    "Ketel One Vodka": 312.5,
    "Passion Fruit Purée": 250,
    "Pineapple Juice": 93.75,
    "Monin Vanilla Syrup": 93.75,
  },
  "Espresso Martini": {
    "Ketel One Vodka": 398,
    "Ocha Ocha Cold Brew": 151,
    "Baileys": 101,
    "Kahlúa": 300,
    "Monin Vanilla Syrup": 50,
    "The Bitter Truth Bitters": 10,
  },
  "Cosmopolitan": {
    "Ketel One Vodka": 300,
    "Cointreau": 112.5,
    "Sour Cherry Juice": 150,
    "Cranberry Juice": 75,
    "The Bitter Truth Orange Bitters": 17.5,
  },
  "Venus Spritz": {
    "Lillet Blanc": 200,
    "PeachTree": 100,
    "Monin Strawberry Syrup": 50,
    "Hendrick’s": 350,
  },
  "Old Fashioned": {
    "Maker’s Mark": 618,
    "Monin Simple Syrup": 40,
    "Luxardo Maraschino Liqueur": 45,
    "Angostura Bitters": 12,
    "Orange Bitters": 12,
    "Fee Brothers Black Walnut Bitters": 6,
  },
  "Whiskey Sour": {
    "Maker’s Mark": 608,
    "Monin Simple Syrup": 122,
    "Orange Bitters": 14.4,
    "Angostura Bitters": 7.2,
  },
  "Botanica": {
    "Tanqueray 0": 487,
    "Martini Floreale": 195,
    "Monin Elderflower Syrup": 68,
  },
  "Aperol Oro Spritz": {
    "Aperol": 485,
    "Campari": 92,
    "PeachTree Liqueur": 70,
    "Still Water": 102,
  },
  "Turqoise": {
    "Ananas Juice": 428,
    "Orange Juice": 214,
    "Blue Curaçao": 54,
    "Monin Coconut Syrup": 54,
  },
  "Que Bola": {
    "Havana 7": 227,
    "Ananas Juice": 273,
    "Passion Fruit Purée": 182,
    "Monin Grenadine Syrup": 68,
  },
};

export const categories: CategoryMap = {
  "Tanqueray No. Ten": "Gin",
  "Bombay Sapphire": "Gin",
  "Hendrick’s": "Gin",
  "Tanqueray 0": "Gin",
  "Maker’s Mark": "Whiskey",
  "Havana 7": "Rum",
  "Ketel One Vodka": "Vodka",
  "Carpano Antica Formula": "Vermouth",
  "Belsazar Rosé": "Aperitif",
  "Lillet Blanc": "Aperitif",
  "Martini Floreale": "Aperitif",
  "Campari": "Aperitif",
  "Aperol": "Aperitif",
  "Cointreau": "Liqueur",
  "Grand Marnier": "Liqueur",
  "Luxardo Maraschino Liqueur": "Liqueur",
  "Midori": "Liqueur",
  "PeachTree": "Liqueur",
  "PeachTree Liqueur": "Liqueur",
  "Blue Curaçao": "Liqueur",
  "Baileys": "Liqueur",
  "Kahlúa": "Liqueur",
  "Monin Simple Syrup": "Syrup",
  "Monin Vanilla Syrup": "Syrup",
  "Monin Elderflower Syrup": "Syrup",
  "Monin Grenadine Syrup": "Syrup",
  "Monin Strawberry Syrup": "Syrup",
  "Monin Coconut Syrup": "Syrup",
  "Angostura Bitters": "Bitters",
  "Orange Bitters": "Bitters",
  "Fee Brothers Black Walnut Bitters": "Bitters",
  "The Bitter Truth Orange Bitters": "Bitters",
  "The Bitter Truth Bitters": "Bitters",
  "Ocha Ocha Cold Brew": "Other",
  "Still Water": "Other",
  "Passion Fruit Purée": "Juice",
  "Pineapple Juice": "Juice",
  "Ananas Juice": "Juice",
  "Orange Juice": "Juice",
  "Sour Cherry Juice": "Juice",
  "Cranberry Juice": "Juice",
};

export const cocktailNames = Object.keys(recipes);

export function calculateTotals(submission: Record<string, string | number | null | undefined>) {
  const totals: TotalsMap = {};

  for (const [cocktail, submittedValue] of Object.entries(submission)) {
    const raw = typeof submittedValue === "number" ? submittedValue : Number.parseFloat(String(submittedValue ?? ""));
    if (!recipes[cocktail] || Number.isNaN(raw) || raw <= 0) {
      continue;
    }

    const factor = raw / 750;
    for (const [ingredient, ml] of Object.entries(recipes[cocktail])) {
      totals[ingredient] = (totals[ingredient] ?? 0) + ml * factor;
    }
  }

  const grouped: GroupedMap = {};
  for (const [ingredient, amount] of Object.entries(totals)) {
    const category = categories[ingredient] ?? "Other";
    grouped[category] ??= {};
    grouped[category][ingredient] = amount;
  }

  return { totals, grouped };
}
