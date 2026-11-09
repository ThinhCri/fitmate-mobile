import {beforeEach,describe,it,expect,vi} from 'vitest';
import {checkAiAccess} from '../aiAccess';
import {systemService} from '../api/systemService';
import {aiUsageService} from '../api/aiUsageService';
vi.mock('../api/systemService',()=>({systemService:{getCapabilities:vi.fn()}}));
vi.mock('../api/aiUsageService',()=>({aiUsageService:{getStatus:vi.fn()}}));
describe('AI entry eligibility',()=>{
 beforeEach(()=>{ vi.resetAllMocks(); vi.stubEnv('EXPO_PUBLIC_FOOD_SCAN_DEMO', 'true'); });
 it('blocks disabled scan before accessing quota or camera',async()=>{vi.mocked(systemService.getCapabilities).mockResolvedValue({ai:{enabled:true,food_scan:false}} as never);expect((await checkAiAccess('scan')).allowed).toBe(false);expect(aiUsageService.getStatus).not.toHaveBeenCalled();});
 it('uses scan quota independently from chat quota',async()=>{vi.mocked(systemService.getCapabilities).mockResolvedValue({ai:{enabled:true,food_scan:true,workout_adjust:true}} as never);vi.mocked(aiUsageService.getStatus).mockResolvedValue({enforcement_enabled:true,scan:{remaining:0},chat:{remaining:2},resets_at_utc:'2026-11-04T00:00:00Z'} as never);expect((await checkAiAccess('scan')).allowed).toBe(false);expect((await checkAiAccess('workout')).allowed).toBe(true);});
 it('blocks public scan before capabilities or quota even if the server could scan', async()=>{vi.stubEnv('EXPO_PUBLIC_FOOD_SCAN_DEMO','false');expect((await checkAiAccess('scan')).message).toContain('sắp ra mắt');expect(systemService.getCapabilities).not.toHaveBeenCalled();});
 it('checks shared chat quota for paid chat entry',async()=>{vi.mocked(systemService.getCapabilities).mockResolvedValue({ai:{enabled:true,companion_chat:true}} as never);vi.mocked(aiUsageService.getStatus).mockResolvedValue({enforcement_enabled:true,chat:{remaining:0},resets_at_utc:'2026-11-08T17:00:00Z'} as never);expect((await checkAiAccess('chat')).allowed).toBe(false);});
 it('does not treat quota lookup failure as unlimited access',async()=>{vi.mocked(systemService.getCapabilities).mockResolvedValue({ai:{enabled:true,workout_adjust:true}} as never);vi.mocked(aiUsageService.getStatus).mockRejectedValue(new Error('offline'));await expect(checkAiAccess('workout')).rejects.toThrow('offline');});
});
