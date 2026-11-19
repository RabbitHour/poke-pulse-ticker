import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import CollectorDaily from './CollectorDaily';
const {entry}=vi.hoisted(()=>({entry:{id:'tcg:1:Holofoil',name:'Pikachu',set:'Test',setId:'T',number:'1',kind:'raw',rarity:'Illustration Rare',language:'en',market:12,variant:'Holofoil',image:'https://example.com/card.jpg'}}));
vi.mock('@/hooks/useCatalog',()=>({useCatalog:()=>({data:{entries:[entry],sourceUpdated:'2026-11-17T20:00:00Z'}})}));
vi.mock('@tanstack/react-query',()=>({useQuery:()=>({data:[{sourceUpdated:'2026-11-16T20:00:00Z',prices:{'tcg:1:Holofoil':10,'set:T':100}},{sourceUpdated:'2026-11-17T20:00:00Z',prices:{'tcg:1:Holofoil':12,'set:T':102}},{sourceUpdated:'2026-11-17T20:00:00Z',prices:{'tcg:1:Holofoil':12,'set:T':102}}]})}));
beforeEach(()=>localStorage.clear());afterEach(cleanup);
const mount=()=>render(<MemoryRouter><CollectorDaily/></MemoryRouter>);
it('saves exact cards, persists targets and compares reviewed quotes on the next visit',()=>{
 let view=mount();expect(screen.getByText('102.00 pts · +2.00%')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Save card'}));
 fireEvent.change(screen.getByRole('spinbutton',{name:'Buy target ($)'}),{target:{value:'15'}});
 expect(screen.getByText('At or below target')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Mark this release reviewed'}));
 view.unmount();view=mount();
 expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('15');
 expect(screen.getByText('$0.00 since reviewed')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:/^Remove$/}));
 expect(screen.getByText('Save a card above to build your daily checklist.')).toBeTruthy();
});
it('removes a card with failed artwork from the highlights',()=>{
 mount();const img=screen.getByRole('img',{name:'Pikachu'});
 act(()=>fireEvent.error(img));
 expect(screen.queryByRole('button',{name:'Save card'})).toBeNull();
});
it('retains saved quote and target when artwork fails in highlights',()=>{
 mount();fireEvent.click(screen.getByRole('button',{name:'Save card'}));
 act(()=>fireEvent.error(screen.getByRole('img',{name:'Pikachu'})));
 expect(screen.getByRole('spinbutton',{name:'Buy target ($)'})).toBeTruthy();
 expect(screen.getByText('$12.00')).toBeTruthy();
});
