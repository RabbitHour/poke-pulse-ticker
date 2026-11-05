import {describe,it,expect} from "vitest";
import {checkoutPolicy} from "../../supabase/functions/_shared/checkout-policy";
describe("sandbox checkout guard",()=>{
 it("accepts only a server-allowed test price and return origin",()=>{
  expect(checkoutPolicy("sk_test_fixture","price_test","price_test","https://example.com","https://example.com")).toEqual({priceId:"price_test",origin:"https://example.com"});
 });
 it("rejects live credentials before any payment operation",()=>{
  expect(()=>checkoutPolicy("sk_live_fixture","price_test","price_test","https://example.com","https://example.com")).toThrow("sandbox");
 });
 it("rejects arbitrary prices and return origins",()=>{
  expect(()=>checkoutPolicy("sk_test_fixture","price_other","price_test","https://example.com","https://example.com")).toThrow("price");
  expect(()=>checkoutPolicy("sk_test_fixture","price_test","price_test","https://evil.example","https://example.com")).toThrow("origin");
 });
});
