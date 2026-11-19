import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import SetBrowser from './SetBrowser';
vi.mock('@/hooks/useCatalog',()=>({useCatalog:()=>({data:{sourceUpdated:'2026-11-18T20:00:00Z',entries:[{id:'tcg:1:Holofoil',kind:'raw',language:'en',set:'Base Set',setId:'base',name:'Charizard',number:'4/102',variant:'Holofoil',market:100,image:'https://example.com/card.jpg'}]}})}));
afterEach(cleanup);
it('opens a deep-linked set using catalog records and preserves exact detail identity',()=>{
 render(<MemoryRouter initialEntries={['/sets?set=base']}><SetBrowser/></MemoryRouter>);
 expect(screen.getByRole('heading',{name:'Base Set'})).toBeTruthy();
 expect(screen.getByRole('link',{name:/Charizard Charizard/}).getAttribute('href')).toBe('/catalog/tcg%3A1%3AHolofoil');
 fireEvent.change(screen.getByRole('textbox',{name:'Search this set'}),{target:{value:'missing'}});
 expect(screen.getByText(/No matching catalog variants/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'All sets'}));
 expect(screen.getByRole('heading',{name:'Browse English sets'})).toBeTruthy();
});
