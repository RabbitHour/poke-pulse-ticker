import {render,screen,act,fireEvent,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {afterEach,it,expect,vi} from 'vitest';
import SectionArtwork from './SectionArtwork';
vi.mock('@/hooks/useCatalog',()=>({useCatalog:()=>({data:{entries:Array.from({length:20},(_,i)=>({id:'exact-'+i,name:'Pokemon '+i,set:'Set '+i,setId:'set-'+i,kind:'raw',language:'en',image:'https://example.com/'+i+'.png',market:i+1,number:String(i)}))}})}));
afterEach(()=>{cleanup();vi.useRealTimers();});
it('shows six distinct exact links, rotates, pauses and replaces a failed image',()=>{
 vi.useFakeTimers();render(<MemoryRouter><SectionArtwork context="test"/></MemoryRouter>);
 const links=()=>screen.getAllByRole('link').map(e=>e.getAttribute('href'));
 const first=links();expect(new Set(first).size).toBe(6);
 act(()=>vi.advanceTimersByTime(30000));expect(links()).not.toEqual(first);
 fireEvent.click(screen.getByRole('button',{name:'Pause artwork'}));const paused=links();
 act(()=>vi.advanceTimersByTime(60000));expect(links()).toEqual(paused);
 fireEvent.error(screen.getAllByRole('img')[0]);expect(links()).toHaveLength(6);expect(links()).not.toEqual(paused);
});
it('never fills a set-specific banner with unrelated cards',()=>{
 render(<MemoryRouter><SectionArtwork context="set" setId="set-3"/></MemoryRouter>);
 expect(screen.getAllByRole('link')).toHaveLength(1);
 expect(screen.getByRole('link').getAttribute('href')).toBe('/catalog/exact-3');
});
