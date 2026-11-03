export interface CardData {
  name: string;
  set: string;
  setCode?: string;
  number: string;
  market: number;
  low: number;
  mid: number;
  change: number;
  volume?: number;
  grade?: string;
  _apiId?: string;
  _image?: string;
  _variant?: string;
}

export interface SealedProduct {
  image?: string;
  sourceUpdated?: string;
  name: string;
  type: string;
  market: number;
  change: number;
  low: number;
}

export const rawCards: CardData[] = [
  // === VINTAGE / WOTC ERA (1999–2003) ===
  { name: "Espeon ★", set: "POP Series 5", number: "16", market: 1900.00, low: 5500.00, mid: 5500.00, change: 2.34, _apiId: "pop5-16", _image: "https://images.pokemontcg.io/pop5/16.png" },
  { name: "Lugia", set: "Neo Genesis", number: "9", market: 1299.96, low: 1899.98, mid: 2300.00, change: -1.12, _apiId: "neo1-9", _image: "https://images.pokemontcg.io/neo1/9.png" },
  { name: "Dark Charizard", set: "Team Rocket", number: "4", market: 680.37, low: 521.75, mid: 559.99, change: 3.87, _apiId: "base5-4", _image: "https://images.pokemontcg.io/base5/4.png" },
  { name: "Umbreon", set: "Skyridge", number: "H30", market: 659.99, low: 1100.00, mid: 1100.00, change: 0.42, _apiId: "ecard3-H30", _image: "https://images.pokemontcg.io/ecard3/H30.png" },
  { name: "Dark Gengar", set: "Neo Destiny", number: "6", market: 615.20, low: 449.99, mid: 774.99, change: -0.89, _apiId: "neo4-6", _image: "https://images.pokemontcg.io/neo4/6.png" },
  { name: "Charizard", set: "Expedition Base Set", number: "6", market: 583.33, low: 500.00, mid: 501.98, change: 1.55, _apiId: "ecard1-6", _image: "https://images.pokemontcg.io/ecard1/6.png" },
  { name: "Gengar", set: "Expedition Base Set", number: "13", market: 555.00, low: 750.00, mid: 750.00, change: 0.00, _apiId: "ecard1-13", _image: "https://images.pokemontcg.io/ecard1/13.png" },
  { name: "Charizard δ", set: "Crystal Guardians", number: "4", market: 536.99, low: 499.99, mid: 575.00, change: -2.10, _apiId: "ex14-4", _image: "https://images.pokemontcg.io/ex14/4.png" },
  { name: "Mewtwo", set: "Legendary Collection", number: "29", market: 517.02, low: 499.99, mid: 550.00, change: 0.78, _apiId: "base6-29", _image: "https://images.pokemontcg.io/base6/29.png" },
  { name: "Pikachu", set: "Poké Rumble", number: "7", market: 505.00, low: 485.00, mid: 520.00, change: 1.22, _apiId: "rumble-7", _image: "https://images.pokemontcg.io/rumble/7.png" },
  { name: "Mewtwo", set: "Expedition Base Set", number: "20", market: 500.98, low: 450.00, mid: 499.99, change: 0.33, _apiId: "ecard1-20", _image: "https://images.pokemontcg.io/ecard1/20.png" },
  { name: "Blaine's Charizard", set: "Gym Challenge", number: "2", market: 499.52, low: 425.00, mid: 475.00, change: -0.65, _apiId: "gym2-2", _image: "https://images.pokemontcg.io/gym2/2.png" },
  { name: "Charizard", set: "Base Set", number: "4", market: 494.23, low: 350.00, mid: 475.00, change: 4.12, _apiId: "base1-4", _image: "https://images.pokemontcg.io/base1/4.png" },
  { name: "Charizard", set: "Base Set 2", number: "4", market: 486.99, low: 399.99, mid: 450.00, change: 0.88, _apiId: "base2-4", _image: "https://images.pokemontcg.io/base2/4.png" },
  { name: "Dragonite", set: "Fossil", number: "4", market: 460.73, low: 350.00, mid: 425.00, change: -1.44, _apiId: "base3-4", _image: "https://images.pokemontcg.io/base3/4.png" },
  { name: "Rocket's Mewtwo", set: "Gym Challenge", number: "14", market: 450.96, low: 399.99, mid: 440.00, change: 0.56, _apiId: "gym2-14", _image: "https://images.pokemontcg.io/gym2/14.png" },
  { name: "Umbreon", set: "Neo Discovery", number: "13", market: 439.96, low: 375.00, mid: 410.00, change: 2.01, _apiId: "neo3-13", _image: "https://images.pokemontcg.io/neo3/13.png" },
  { name: "Blastoise", set: "Base Set", number: "2", market: 400.00, low: 299.99, mid: 375.00, change: -0.22, _apiId: "base1-2", _image: "https://images.pokemontcg.io/base1/2.png" },
  { name: "Venusaur", set: "Base Set", number: "15", market: 280.00, low: 220.00, mid: 260.00, change: 1.05, _apiId: "base1-15", _image: "https://images.pokemontcg.io/base1/15.png" },
  { name: "Alakazam", set: "Base Set", number: "1", market: 195.00, low: 150.00, mid: 180.00, change: 0.67, _apiId: "base1-1", _image: "https://images.pokemontcg.io/base1/1.png" },

  // === EX ERA (2003–2007) ===
  { name: "Gold Star Rayquaza", set: "Deoxys", number: "107", market: 1200.00, low: 950.00, mid: 1100.00, change: 3.21, _apiId: "ex6-107", _image: "https://images.pokemontcg.io/ex6/107.png" },
  { name: "Gold Star Charizard", set: "Dragon Frontiers", number: "100", market: 980.00, low: 800.00, mid: 920.00, change: 2.55, _apiId: "ex15-100", _image: "https://images.pokemontcg.io/ex15/100.png" },
  { name: "Gold Star Umbreon", set: "Unseen Forces", number: "17", market: 750.00, low: 600.00, mid: 700.00, change: 1.88, _apiId: "ex8-17", _image: "https://images.pokemontcg.io/ex8/17.png" },
  { name: "Charizard ex", set: "FireRed & LeafGreen", number: "105", market: 420.00, low: 350.00, mid: 400.00, change: -0.45, _apiId: "ex3-105", _image: "https://images.pokemontcg.io/ex3/105.png" },

  // === DP / PLATINUM ERA (2007–2010) ===
  { name: "Charizard G LV.X", set: "Supreme Victors", number: "143", market: 380.00, low: 300.00, mid: 350.00, change: 2.10, _apiId: "pl3-143", _image: "https://images.pokemontcg.io/pl3/143.png" },
  { name: "Rayquaza C LV.X", set: "Supreme Victors", number: "145", market: 220.00, low: 175.00, mid: 200.00, change: 1.33, _apiId: "pl3-145", _image: "https://images.pokemontcg.io/pl3/145.png" },
  { name: "Arceus LV.X", set: "Arceus", number: "96", market: 180.00, low: 140.00, mid: 165.00, change: 0.88, _apiId: "pl4-96", _image: "https://images.pokemontcg.io/pl4/96.png" },
  { name: "Lugia LEGEND", set: "HeartGold & SoulSilver", number: "114", market: 310.00, low: 250.00, mid: 290.00, change: -0.55, _apiId: "hgss1-114", _image: "https://images.pokemontcg.io/hgss1/114.png" },

  // === BW / XY ERA (2011–2017) ===
  { name: "Charizard EX", set: "Flashfire", number: "100", market: 250.00, low: 200.00, mid: 230.00, change: 1.45, _apiId: "xy2-100", _image: "https://images.pokemontcg.io/xy2/100.png" },
  { name: "Mega Charizard EX", set: "Flashfire", number: "107", market: 320.00, low: 260.00, mid: 300.00, change: 2.22, _apiId: "xy2-107", _image: "https://images.pokemontcg.io/xy2/107.png" },
  { name: "Pikachu EX", set: "XY", number: "174", market: 145.00, low: 110.00, mid: 130.00, change: 0.77, _apiId: "xy0-174", _image: "https://images.pokemontcg.io/xy0/174.png" },
  { name: "Mega Rayquaza EX", set: "Roaring Skies", number: "105", market: 185.00, low: 145.00, mid: 170.00, change: -1.05, _apiId: "xy6-105", _image: "https://images.pokemontcg.io/xy6/105.png" },
  { name: "Charizard", set: "Evolutions", number: "11", market: 165.00, low: 130.00, mid: 155.00, change: 3.10, _apiId: "xy12-11", _image: "https://images.pokemontcg.io/xy12/11.png" },

  // === SUN & MOON ERA (2017–2020) ===
  { name: "Charizard GX", set: "Burning Shadows", number: "150", market: 350.00, low: 280.00, mid: 330.00, change: 2.88, _apiId: "sm3-150", _image: "https://images.pokemontcg.io/sm3/150.png" },
  { name: "Charizard GX", set: "Hidden Fates", number: "SV49", market: 290.00, low: 230.00, mid: 275.00, change: 1.55, _apiId: "sm115-SV49", _image: "https://images.pokemontcg.io/sm115/SV49.png" },
  { name: "Espeon GX", set: "Sun & Moon", number: "140", market: 125.00, low: 95.00, mid: 115.00, change: 0.92, _apiId: "sm1-140", _image: "https://images.pokemontcg.io/sm1/140.png" },
  { name: "Mewtwo GX", set: "Shining Legends", number: "76", market: 110.00, low: 85.00, mid: 100.00, change: -0.33, _apiId: "sm35-76", _image: "https://images.pokemontcg.io/sm35/76.png" },

  // === MODERN ERA (2020–Present) ===
  { name: "Charizard VMAX", set: "Shining Fates", number: "SV107", market: 385.00, low: 320.00, mid: 360.00, change: 2.88, _apiId: "swsh45-SV107", _image: "https://images.pokemontcg.io/swsh45/SV107.png" },
  { name: "Umbreon VMAX", set: "Evolving Skies", number: "215", market: 370.00, low: 300.00, mid: 350.00, change: 3.45, _apiId: "swsh7-215", _image: "https://images.pokemontcg.io/swsh7/215.png" },
  { name: "Pikachu VMAX", set: "Vivid Voltage", number: "188", market: 320.00, low: 260.00, mid: 300.00, change: 1.77, _apiId: "swsh4-188", _image: "https://images.pokemontcg.io/swsh4/188.png" },
  { name: "Moonbreon", set: "Evolving Skies", number: "203", market: 295.00, low: 240.00, mid: 280.00, change: 4.12, _apiId: "swsh7-203", _image: "https://images.pokemontcg.io/swsh7/203.png" },
  { name: "Charizard ex", set: "Obsidian Flames", number: "234", market: 275.00, low: 220.00, mid: 260.00, change: -0.95, _apiId: "sv3-234", _image: "https://images.pokemontcg.io/sv3/234.png" },
  { name: "Giratina VSTAR", set: "Lost Origin", number: "TG30", market: 260.00, low: 210.00, mid: 245.00, change: 1.33, _apiId: "swsh11-TG30", _image: "https://images.pokemontcg.io/swsh11/TG30.png" },
  { name: "Rayquaza VMAX", set: "Evolving Skies", number: "218", market: 240.00, low: 195.00, mid: 225.00, change: 0.67, _apiId: "swsh7-218", _image: "https://images.pokemontcg.io/swsh7/218.png" },
  { name: "Mew VMAX", set: "Fusion Strike", number: "269", market: 210.00, low: 170.00, mid: 200.00, change: -1.55, _apiId: "swsh8-269", _image: "https://images.pokemontcg.io/swsh8/269.png" },
  { name: "Lugia V", set: "Silver Tempest", number: "186", market: 185.00, low: 150.00, mid: 175.00, change: 2.22, _apiId: "swsh12-186", _image: "https://images.pokemontcg.io/swsh12/186.png" },
  { name: "Charizard ex", set: "Paldea Evolved", number: "228", market: 165.00, low: 130.00, mid: 155.00, change: -0.44, _apiId: "sv2-228", _image: "https://images.pokemontcg.io/sv2/228.png" },
  { name: "Miraidon ex", set: "Scarlet & Violet", number: "244", market: 145.00, low: 115.00, mid: 135.00, change: 1.88, _apiId: "sv1-244", _image: "https://images.pokemontcg.io/sv1/244.png" },
  { name: "Gengar VMAX", set: "Fusion Strike", number: "271", market: 130.00, low: 100.00, mid: 120.00, change: 0.95, _apiId: "swsh8-271", _image: "https://images.pokemontcg.io/swsh8/271.png" },
  { name: "Charizard ex", set: "151", number: "199", market: 195.00, low: 155.00, mid: 180.00, change: 2.15, _apiId: "sv3pt5-199", _image: "https://images.pokemontcg.io/sv3pt5/199.png" },
  { name: "Eevee", set: "Prismatic Evolutions", number: "190", market: 88.00, low: 65.00, mid: 80.00, change: 5.22, _apiId: "sv8a-190", _image: "https://images.pokemontcg.io/sv8a/190.png" },
  { name: "Umbreon ex", set: "Prismatic Evolutions", number: "195", market: 155.00, low: 120.00, mid: 140.00, change: 3.88, _apiId: "sv8a-195", _image: "https://images.pokemontcg.io/sv8a/195.png" },
];

export const gradedCards: CardData[] = [
  { name: "Charizard", set: "Base Set 1st Ed", number: "4", market: 42000.00, low: 38000.00, mid: 41000.00, change: 1.85, grade: "PSA 10" },
  { name: "Pikachu Illustrator", set: "Promo", number: "—", market: 28500.00, low: 25000.00, mid: 27500.00, change: 0.92, grade: "PSA 9" },
  { name: "Lugia", set: "Neo Genesis 1st Ed", number: "9", market: 18750.00, low: 16000.00, mid: 18000.00, change: -0.44, grade: "PSA 10" },
  { name: "Espeon ★", set: "POP Series 5", number: "16", market: 12800.00, low: 10500.00, mid: 12000.00, change: 3.21, grade: "PSA 10" },
  { name: "Shadowless Charizard", set: "Base Set", number: "4", market: 9850.00, low: 8500.00, mid: 9500.00, change: 0.65, grade: "CGC 9.5" },
  { name: "Dark Charizard", set: "Team Rocket 1st Ed", number: "4", market: 7200.00, low: 6000.00, mid: 7000.00, change: -1.22, grade: "PSA 10" },
  { name: "Umbreon", set: "Skyridge", number: "H30", market: 5450.00, low: 4800.00, mid: 5200.00, change: 2.10, grade: "BGS 9.5" },
  { name: "Gold Star Rayquaza", set: "Deoxys", number: "107", market: 4800.00, low: 4200.00, mid: 4600.00, change: 0.33, grade: "PSA 9" },
  { name: "Shining Charizard", set: "Neo Destiny 1st Ed", number: "107", market: 4200.00, low: 3500.00, mid: 4000.00, change: -0.78, grade: "PSA 9" },
  { name: "Crystal Charizard", set: "Skyridge", number: "146", market: 3900.00, low: 3200.00, mid: 3700.00, change: 1.45, grade: "CGC 9" },
];

export const sealedProducts: SealedProduct[] = [
  { name: "Base Set Booster Box", type: "Booster Box", market: 45000.00, change: 0.55, low: 40000.00 },
  { name: "Neo Genesis Booster Box", type: "Booster Box", market: 18500.00, change: -0.32, low: 16000.00 },
  { name: "Skyridge Booster Box", type: "Booster Box", market: 32000.00, change: 1.88, low: 28000.00 },
  { name: "Team Rocket Booster Box", type: "Booster Box", market: 14200.00, change: 0.42, low: 12000.00 },
  { name: "Fossil Booster Box", type: "Booster Box", market: 10500.00, change: -0.18, low: 9000.00 },
  { name: "Jungle Booster Box", type: "Booster Box", market: 11800.00, change: 0.75, low: 10000.00 },
  { name: "Base Set Booster Pack (Heavy)", type: "Booster Pack", market: 2800.00, change: 2.10, low: 2200.00 },
  { name: "Neo Destiny Booster Pack", type: "Booster Pack", market: 950.00, change: 0.33, low: 800.00 },
  { name: "EX Dragon Frontiers Booster Box", type: "Booster Box", market: 8500.00, change: -1.05, low: 7200.00 },
  { name: "Legendary Collection Booster Box", type: "Booster Box", market: 15000.00, change: 0.88, low: 13000.00 },
];

export const getIndexValue = (items: Array<{ market: number }>) => {
  const total = items.reduce((sum, c) => sum + c.market, 0);
  return total / items.length;
};

export const getIndexChange = (items: Array<{ change: number }>) => {
  const total = items.reduce((sum, c) => sum + c.change, 0);
  return total / items.length;
};
