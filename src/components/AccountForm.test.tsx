import {cleanup,fireEvent,render,screen,waitFor} from "@testing-library/react";
import {afterEach,describe,expect,it,vi} from "vitest";
import {MemoryRouter} from "react-router-dom";
const auth=vi.hoisted(()=>({signUp:vi.fn(),signInWithPassword:vi.fn(),resetPasswordForEmail:vi.fn(),updateUser:vi.fn(),onAuthStateChange:vi.fn(()=>({data:{subscription:{unsubscribe:vi.fn()}}}))}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{auth}}));
import AccountForm from "./AccountForm";
afterEach(()=>{cleanup();vi.clearAllMocks();});
describe('free collector account form',()=>{
 it('does not submit signup before terms are reviewed',()=>{const r=render(<MemoryRouter><AccountForm/></MemoryRouter>);fireEvent.submit(r.container.querySelector('form')!);expect(auth.signUp).not.toHaveBeenCalled();expect(screen.getByRole('status').textContent).toContain('review the terms');});
 it('uses the authentication provider without a payment call',async()=>{auth.signUp.mockResolvedValue({data:{session:null},error:null});const r=render(<MemoryRouter><AccountForm/></MemoryRouter>);fireEvent.change(screen.getByLabelText('Email'),{target:{value:'collector@example.test'}});fireEvent.change(screen.getByLabelText(/Password/),{target:{value:'test-only-not-a-real-password'}});fireEvent.click(screen.getByRole('checkbox'));fireEvent.submit(r.container.querySelector('form')!);await waitFor(()=>expect(auth.signUp).toHaveBeenCalledTimes(1));expect(auth.signUp.mock.calls[0][0].options.emailRedirectTo).toMatch(/\/account$/);await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('Check your email'));});
});
