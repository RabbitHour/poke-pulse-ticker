import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ForecastLedger from './ForecastLedger';
const state=vi.hoisted(()=>({data:null as any}));
vi.mock('@tanstack/react-query',()=>({useQuery:()=>({data:state.data,isError:false,isLoading:false})}));
vi.mock('@/hooks/useCatalog',()=>({useCatalog:()=>({data:{entries:[]}})}));
afterEach(()=>{cleanup();state.data=null;});
const f={id:'f1',recordId:'r1',name:'Test card',set:'Test set',baseline:100,predicted:110,issuedAt:'2026-01-01',sourceUpdated:'2026-01-01',dueAt:'2026-01-08',horizonDays:7};
describe('merged forecast ledger',()=>{
 it('scores an eligible outcome and compares against unchanged value',()=>{
  state.data={ledger:{forecasts:[f],outcomes:[{id:'f1',actual:104,evaluatedAt:'2026-01-08T12:00:00Z',sourceUpdated:'2026-01-08'}]}};
  render(<MemoryRouter><ForecastLedger/></MemoryRouter>);
  expect(screen.getByText('1 eligible resolved forecasts')).toBeTruthy();
  expect(screen.getByText('Unchanged-value average error: 3.8%')).toBeTruthy();
  expect(screen.getByText('Model average error (lower is better): 5.8%')).toBeTruthy();
 });
 it('does not count a late outcome as correct',()=>{
  state.data={ledger:{forecasts:[f],outcomes:[{id:'f1',actual:110,evaluatedAt:'2026-01-20',sourceUpdated:'2026-01-20'}]}};
  render(<MemoryRouter><ForecastLedger/></MemoryRouter>);
  expect(screen.getByText('0 eligible resolved forecasts')).toBeTruthy();
  expect(screen.getByText('Direction accuracy: Awaiting results')).toBeTruthy();
 });
});
