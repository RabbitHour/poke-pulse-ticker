import {act,renderHook} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {useSelectionRotation} from './useSelectionRotation';
afterEach(()=>vi.useRealTimers());
describe('selection rotation',()=>{
 it('rotates on time and respects pause',()=>{vi.useFakeTimers();const rotate=vi.fn();const {result,unmount}=renderHook(()=>useSelectionRotation(rotate,1000));act(()=>vi.advanceTimersByTime(1000));expect(rotate).toHaveBeenCalledTimes(1);act(()=>result.current.setPaused(true));act(()=>vi.advanceTimersByTime(3000));expect(rotate).toHaveBeenCalledTimes(1);unmount();});
 it('does not replace cards during hover or keyboard interaction',()=>{vi.useFakeTimers();const rotate=vi.fn();const {result}=renderHook(()=>useSelectionRotation(rotate,1000));act(()=>result.current.bindings.onFocusCapture());act(()=>result.current.bindings.onMouseEnter());act(()=>result.current.bindings.onMouseLeave());act(()=>vi.advanceTimersByTime(2000));expect(rotate).not.toHaveBeenCalled();});
});
