export const PRODUCT_CATEGORIES = [
  { id:"etb", title:"Elite Trainer Boxes", description:"Individual ETBs; standard and Pokémon Center editions remain separate products." },
  { id:"etb_case_10", title:"ETB cases · 10 boxes", description:"Case listings whose descriptions explicitly confirm ten ETBs." },
  { id:"booster_box_36", title:"Booster boxes · 36 packs", description:"Individual boxes whose descriptions confirm 36 booster packs." },
  { id:"booster_case_6", title:"Booster box cases · 6 boxes", description:"Case listings confirming six boxes, each containing 36 packs." },
  { id:"booster_bundle", title:"Booster bundles", description:"Individual booster bundles; excludes bundle displays and cases." },
] as const;
export type ProductCategory = typeof PRODUCT_CATEGORIES[number]["id"];
export function classifyProduct(name:string, description:string):ProductCategory|null {
  const n=name.toLowerCase();
  const d=description.replace(/<[^>]*>/g," ").replace(/&\w+;/g," ").toLowerCase();
  const text=(n+" "+d).replace(/\s+/g," ");
  const isCase=/\bcase\b/.test(n);
  const ten=/(?:\b10\b|\bten\b)\s+(?:sealed\s+)?(?:elite trainer boxes|etbs)/.test(text);
  const six=/(?:\b6\b|\bsix\b)\s+(?:sealed\s+)?booster boxes/.test(text);
  const thirtySix=/(?:\b36\b|\bthirty[ -]six\b)\s+(?:(?:[a-z0-9&’'—–:-]+)\s+){0,5}booster packs/.test(text);
  if(/elite trainer box/.test(n))return isCase?(ten?"etb_case_10":null):/display|bundle|\b(?:2|4|10)[ -]?(?:pack|box)/.test(n)?null:"etb";
  if(/booster box/.test(n))return isCase?(six&&thirtySix?"booster_case_6":null):thirtySix?"booster_box_36":null;
  if(/booster bundle/.test(n)&&!isCase&&!/display|\b(?:10|25)\b/.test(n))return "booster_bundle";
  return null;
}
