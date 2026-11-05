import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CardValuer from "./CardValuer";
import type { Catalog } from "@/hooks/useCatalog";
const catalogState=vi.hoisted(()=>({data:undefined as Catalog|undefined}));
vi.mock("./PriceHistory",()=>({default:()=>null}));
vi.mock("@/hooks/usePokemonTcg",()=>({useLiveCards:()=>({data:[{name:"Pikachu",set:"Test Set",number:"1",market:12.34,_apiId:"test-1"}],isLoading:false,isError:false}),useLiveCardsQuick:()=>({data:[]}),useCardSearch:()=>({data:[],isFetching:false,isError:false})}));
vi.mock("@/hooks/useObservedProducts",()=>({useObservedProducts:()=>({graded:[],sealed:[],isLoading:false,isError:false})}));
vi.mock("@/hooks/useCatalog",()=>({useCatalog:()=>({data:catalogState.data,isLoading:false,isError:false,refetch:vi.fn()})}));
afterEach(()=>{cleanup();catalogState.data=undefined;});
describe("card valuer",()=>{
 it("selects a quote, multiplies quantity and rejects fractional counts",()=>{
   render(<MemoryRouter><CardValuer id="test-valuer"/></MemoryRouter>);
   fireEvent.click(screen.getByRole("button",{name:/Pikachu/}));
   fireEvent.change(screen.getByLabelText("Quantity"),{target:{value:"3"}});
   expect(screen.getByText("$37.02")).toBeTruthy();
   fireEvent.change(screen.getByLabelText("Quantity"),{target:{value:"1.5"}});
   expect(screen.getByText(/Enter a whole quantity/)).toBeTruthy();
 });
 it("does not invent graded prices",()=>{
   render(<MemoryRouter><CardValuer id="test-valuer"/></MemoryRouter>);
   fireEvent.change(screen.getByLabelText("Category"),{target:{value:"graded"}});
   expect(screen.getByText(/No exact catalog match/)).toBeTruthy();
   expect(screen.queryByRole("button",{name:/Pikachu/})).toBeNull();
 });
 it("submits Mew anniversary search and retains unpriced cards",()=>{
   const entry={id:"mew30",name:"Mew",set:"ME: 30th Celebration",setId:"30C",number:"065/128",kind:"raw" as const,category:null,image:"",sourceUrl:"",sourceUpdated:"2026-11-05",market:null};
   catalogState.data={version:1,generatedAt:"2026-11-05",sourceUpdated:"2026-11-05",englishCatalogCount:2,providerGroups:1,pricedRecords:1,languageScope:"English",entries:[entry,{...entry,id:"mewtwo30",name:"Mewtwo",market:1}]};
   render(<MemoryRouter><CardValuer id="test-valuer"/></MemoryRouter>);
   fireEvent.change(screen.getByLabelText("Card, set or number"),{target:{value:"Mew 30th Anniversary"}});
   fireEvent.submit(screen.getByRole("form",{name:"Card value search"}));
   expect(screen.getByRole("button",{name:/Mew.*Price unavailable/})).toBeTruthy();
   expect(screen.queryByRole("button",{name:/Mewtwo/})).toBeNull();
   fireEvent.click(screen.getByRole("button",{name:/Mew.*Price unavailable/}));
   expect(screen.getByText("No provider quote yet")).toBeTruthy();
 });
});
