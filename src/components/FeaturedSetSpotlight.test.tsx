import {render,screen,act,fireEvent,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {afterEach,describe,it,expect,vi} from 'vitest';
import FeaturedSetSpotlight from './FeaturedSetSpotlight';
vi.mock('@/hooks/useCatalog',()=>({useCatalog:()=>({data:{entries:[]}})}));
afterEach(()=>{cleanup();vi.useRealTimers();});
describe('featured set navigation',()=>{
 it('alternates destinations after ten seconds and supports pause',()=>{
  vi.useFakeTimers();render(<MemoryRouter><FeaturedSetSpotlight/></MemoryRouter>);
  expect(screen.getByRole('link').getAttribute('href')).toBe('/sets?set=30th');
  act(()=>vi.advanceTimersByTime(9999));expect(screen.getByRole('link').getAttribute('href')).toBe('/sets?set=30th');
  act(()=>vi.advanceTimersByTime(1));expect(screen.getByRole('link').getAttribute('href')).toBe('/sets?set=DLR');
  fireEvent.click(screen.getByRole('button',{name:'Pause',exact:true}));act(()=>vi.advanceTimersByTime(20000));
  expect(screen.getByRole('link').getAttribute('href')).toBe('/sets?set=DLR');
  fireEvent.click(screen.getByRole('button',{name:'Show 30th Anniversary'}));expect(screen.getByRole('link').getAttribute('href')).toBe('/sets?set=30th');
 });
});
