import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TickerBar from './TickerBar';
const {entries} = vi.hoisted(()=>({entries:['Alpha','Bravo','Charlie','Delta','Echo','Foxtrot','Golf','Hotel','India','Juliet'].map((name,i)=>({id:String(i),name,set:'Test set',setId:'t',number:String(i),kind:'raw',language:'en',rarity:'Illustration Rare',market:10,image:'https://example.com/'+i+'.png'}))}));
vi.mock('@/hooks/useCatalog',()=>({useCatalog:()=>({data:{entries}})}));
vi.mock('@/hooks/useObservedProducts',()=>({useObservedProducts:()=>({graded:[]})}));
let frame:FrameRequestCallback;
const epoch=Date.UTC(2026,0,1);
const tick=(ms:number)=>act(()=>{vi.setSystemTime(ms);frame(ms);});
const mount=()=>render(<MemoryRouter><TickerBar/></MemoryRouter>);
beforeEach(()=>{
 vi.useFakeTimers();vi.setSystemTime(epoch+5*8000+1000);
 vi.stubGlobal('requestAnimationFrame',vi.fn((cb)=>{frame=cb;return 1;}));
 vi.stubGlobal('cancelAnimationFrame',vi.fn());
 vi.stubGlobal('matchMedia',vi.fn(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();});
it('starts at elapsed clock position, advances smoothly and wraps without starting over',()=>{
 const {container}=mount();
 const names=()=>Array.from(container.querySelectorAll('.ticker-card-art')).map(e=>e.getAttribute('alt'));
 expect(names()[0]).toBe('Foxtrot');
 const track=container.querySelector('.w-max') as HTMLElement;
 tick(epoch+5*8000+4000);
 expect(track.style.transform).toBe('translate3d(-140px,0,0)');
 tick(epoch+6*8000);
 expect(names()[0]).toBe('Golf');
 tick(epoch+10*8000);
 expect(names()[0]).toBe('Alpha');
});
it('reopening resumes at elapsed time and explicit pause can resume',()=>{
 const view=mount();view.unmount();vi.setSystemTime(epoch+8*8000);const {container}=mount();
 expect(container.querySelector('.ticker-card-art')?.getAttribute('alt')).toBe('India');
 fireEvent.click(screen.getByRole('button',{name:'Pause'}));
 expect(screen.getByRole('button',{name:'Resume'})).toBeTruthy();
 vi.setSystemTime(epoch+12*8000);
 fireEvent.click(screen.getByRole('button',{name:'Resume'}));
 expect(container.querySelector('.ticker-card-art')?.getAttribute('alt')).toBe('Charlie');
});
