import {afterEach,describe,expect,it,vi} from 'vitest';
import {withRequestDeadline,RequestTimeoutError} from '../requestDeadline';
afterEach(()=>vi.useRealTimers());
describe('request deadline',()=>{
 it('finishes even when a native request ignores abort',async()=>{vi.useFakeTimers();let signal:AbortSignal|undefined;const request=withRequestDeadline([],s=>{signal=s;return new Promise(()=>{});},100);const check=expect(request).rejects.toBeInstanceOf(RequestTimeoutError);await vi.advanceTimersByTimeAsync(100);await check;expect(signal?.aborted).toBe(true);});
 it('honors session cancellation even with a caller signal',async()=>{const caller=new AbortController(),session=new AbortController();const request=withRequestDeadline([caller.signal,session.signal],()=>new Promise(()=>{}));const check=expect(request).rejects.toMatchObject({name:'AbortError'});session.abort();await check;});
 it('does not start work for an already cancelled screen',async()=>{const abort=new AbortController();abort.abort();const work=vi.fn();await expect(withRequestDeadline([abort.signal],work)).rejects.toMatchObject({name:'AbortError'});expect(work).not.toHaveBeenCalled();});
 it('cleans up its timeout after success',async()=>{vi.useFakeTimers();expect(await withRequestDeadline([],async()=>42,100)).toBe(42);expect(vi.getTimerCount()).toBe(0);});
});
