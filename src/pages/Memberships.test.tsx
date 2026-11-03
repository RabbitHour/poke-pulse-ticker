import {render,screen,cleanup} from '@testing-library/react';import {afterEach,it,expect,vi} from 'vitest';import {MemoryRouter} from 'react-router-dom';
vi.mock('@/contexts/AuthContext',()=>({useAuth:()=>({user:{id:'test-user'}})}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{functions:{invoke:vi.fn()}}}));
import Memberships from './Memberships';afterEach(cleanup);
it('does not expose an active purchase button before billing activation',()=>{render(<MemoryRouter><Memberships/></MemoryRouter>);expect(screen.getByText(/Checkout is disabled/)).toBeTruthy();for(const b of screen.getAllByRole('button',{name:'Continue to secure checkout'}))expect((b as HTMLButtonElement).disabled).toBe(true);});
