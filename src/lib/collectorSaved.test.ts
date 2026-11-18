import {afterEach,expect,it} from 'vitest';
import {readCollectorSaved,COLLECTOR_STORAGE} from './collectorSaved';
afterEach(()=>localStorage.clear());
it('migrates legacy exact IDs without inventing targets',()=>{
 localStorage.setItem('pulse-watchlist',JSON.stringify({'tcg:1:Holofoil':'Pikachu'}));
 expect(readCollectorSaved()).toEqual([{id:'tcg:1:Holofoil',label:'Pikachu',target:''}]);
});
it('preserves edited targets and does not resurrect removed legacy cards',()=>{
 localStorage.setItem('pulse-watchlist',JSON.stringify({'tcg:1:Holofoil':'Pikachu'}));
 localStorage.setItem(COLLECTOR_STORAGE,'[]');expect(readCollectorSaved()).toEqual([]);
 localStorage.setItem(COLLECTOR_STORAGE,JSON.stringify([{id:'tcg:2:Normal',target:'12.50'}]));
 expect(readCollectorSaved()[0].target).toBe('12.50');
});
