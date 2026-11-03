import {describe,expect,it} from "vitest";
import {classifyProduct} from "./productCategories";
describe('sealed product definitions',()=>{
 it('separates an ETB from a confirmed ten-box case',()=>{expect(classifyProduct('151 Elite Trainer Box','9 booster packs')).toBe('etb');expect(classifyProduct('151 Elite Trainer Box Case','Contains 10 Elite Trainer Boxes')).toBe('etb_case_10');});
 it('never assumes an unknown case size',()=>expect(classifyProduct('151 Elite Trainer Box Case','Factory sealed case')).toBeNull());
 it('excludes four-box Pokemon Center cases from the ten-box category',()=>expect(classifyProduct('Pokemon Center Elite Trainer Box Case','4 Elite Trainer Boxes')).toBeNull());
 it('requires thirty-six packs for a single booster box',()=>{expect(classifyProduct('Journey Together Booster Box','Each box contains 36 Scarlet & Violet booster packs')).toBe('booster_box_36');expect(classifyProduct('Japanese Booster Box','30 booster packs')).toBeNull();});
 it('requires both six boxes and thirty-six packs for booster cases',()=>{expect(classifyProduct('Journey Together Booster Box Case','6 booster boxes of 36 booster packs')).toBe('booster_case_6');expect(classifyProduct('Booster Box Case','six booster boxes')).toBeNull();});
 it('excludes booster bundle cases and displays',()=>{expect(classifyProduct('151 Booster Bundle','six packs')).toBe('booster_bundle');expect(classifyProduct('151 Booster Bundle Case','25 bundles')).toBeNull();});
});
