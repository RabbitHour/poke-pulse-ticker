import { describe, expect, it } from "vitest";
import { totalQuote } from "./valuation";
describe("source quote totals",()=>{
 it("multiplies and rounds in currency cents",()=>expect(totalQuote(12.34,3)).toBe(37.02));
 it.each([0,-1,NaN,Infinity])("rejects invalid source price %s",p=>expect(totalQuote(p,1)).toBeNull());
 it.each([0,-1,1.5,1000,NaN])("rejects invalid quantity %s",q=>expect(totalQuote(5,q)).toBeNull());
});
