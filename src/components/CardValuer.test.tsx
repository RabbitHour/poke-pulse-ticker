import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CardValuer from "./CardValuer";
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
vi.mock("@/hooks/usePokemonTcg",()=>({useLiveCards:()=>({data:[{name:"Pikachu",set:"Test Set",number:"1",market:12.34,_apiId:"test-1"}],isLoading:false,isError:false}),useLiveCardsQuick:()=>({data:[]}),useCardSearch:(query:string)=>({data:query==="Pikachu"?[{name:"Pikachu",set:"Test Set",number:"1",market:12.34,_apiId:"test-1"}]:[],isFetching:false,isError:false})}));
vi.mock("@/hooks/useObservedProducts",()=>({useObservedProducts:()=>({graded:[],sealed:[],isLoading:false,isError:false})}));
vi.mock("@/hooks/useCatalog",()=>({useCatalog:()=>({data:undefined})}));
afterEach(cleanup);
describe("card valuer",()=>{
 it("selects an exact quote, multiplies quantity and rejects fractional counts",()=>{
   render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter><CardValuer id="test-valuer"/></MemoryRouter></QueryClientProvider>);
   expect(screen.queryByRole("button",{name:/Pikachu/})).toBeNull();
   fireEvent.change(screen.getByLabelText("Card, set or number"),{target:{value:"Pikachu"}});
   fireEvent.click(screen.getByRole("button",{name:"Search values"}));
   fireEvent.click(screen.getByRole("button",{name:/Pikachu/}));
   fireEvent.change(screen.getByLabelText("Quantity"),{target:{value:"3"}});
   expect(screen.getByText("$37.02")).toBeTruthy();
   fireEvent.change(screen.getByLabelText("Quantity"),{target:{value:"1.5"}});
   expect(screen.getByText(/Enter a whole quantity/)).toBeTruthy();
 });
 it("does not invent graded prices when no observed quotes exist",()=>{
   render(<MemoryRouter><CardValuer id="test-valuer"/></MemoryRouter>);
   fireEvent.change(screen.getByLabelText("Category"),{target:{value:"graded"}});
   expect(screen.queryByText(/No matching source quote/)).toBeNull();
   fireEvent.change(screen.getByLabelText("Card, set or number"),{target:{value:"Pikachu"}});
   fireEvent.click(screen.getByRole("button",{name:"Search values"}));
   expect(screen.getByText(/No matching source quote/)).toBeTruthy();
   expect(screen.queryByRole("button",{name:/Pikachu/})).toBeNull();
 });
});
