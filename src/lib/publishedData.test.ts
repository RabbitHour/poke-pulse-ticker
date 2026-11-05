import {afterEach,describe,it,expect,vi} from "vitest";
import {readPublishedData} from "./publishedData";
afterEach(()=>vi.unstubAllGlobals());
const valid=(d:unknown)=>!!d&&typeof d==="object"&&"entries" in d;
describe("published data fallback",()=>{
 it("recovers when the host returns HTML instead of JSON",async()=>{
  const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>{throw Error("HTML");}}).mockResolvedValueOnce({ok:true,json:async()=>({entries:[],sourceUpdated:new Date().toISOString()})});
  vi.stubGlobal("fetch",fetcher);
  expect(await readPublishedData("catalog.json",valid)).toHaveProperty("entries");
  expect(fetcher.mock.calls[1][0]).toContain("/market-data/catalog.json");
 });
 it("prefers fresh mirrored data over a stale hosted release",async()=>{
  const fresh={entries:[1],sourceUpdated:new Date().toISOString()};
  vi.stubGlobal("fetch",vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({entries:[],sourceUpdated:"2020-01-01"})}).mockResolvedValueOnce({ok:true,json:async()=>fresh}));
  expect(await readPublishedData("catalog.json",valid)).toEqual(fresh);
 });
 it("reports total failure instead of manufacturing an empty catalog",async()=>{
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:false}));
  await expect(readPublishedData("catalog.json",valid)).rejects.toThrow("unavailable");
 });
});
