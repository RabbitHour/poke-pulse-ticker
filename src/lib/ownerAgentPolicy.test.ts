import {describe,it,expect} from 'vitest';
import {isOwnerIdentity} from './ownerAgentPolicy';
const owner='4a917711-0000-4000-8000-123456789abc';
describe('server verified owner identity',()=>{
 it('denies anonymous and unconfigured access',()=>{expect(isOwnerIdentity(undefined,owner)).toBe(false);expect(isOwnerIdentity(owner,undefined)).toBe(false);expect(isOwnerIdentity('', '')).toBe(false);});
 it('denies a different authenticated account and display names',()=>{expect(isOwnerIdentity('David Noyes',owner)).toBe(false);expect(isOwnerIdentity('4a917711-0000-4000-8000-123456789abd',owner)).toBe(false);});
 it('accepts only the exact configured user ID after server verification',()=>{expect(isOwnerIdentity(owner,owner)).toBe(true);});
});
