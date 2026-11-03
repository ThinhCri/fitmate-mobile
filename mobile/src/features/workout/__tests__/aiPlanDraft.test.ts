import { describe,it,expect } from 'vitest';
import {stageAiPlan,readAiPlan,clearAiPlan} from '../aiPlanDraft';
const suggestion={suggested_plan_name:'Tập toàn thân',description:'Xem lại trước khi tập',exercises:[{exercise_name:'Squat',sets:3,reps:10,rest_seconds:45,notes:'Giữ lưng thẳng'}]};
describe('AI plan review draft',()=>{
 it('preserves suggested exercises for editable review without creating a server plan',()=>{const id=stageAiPlan('member',suggestion);const plan=readAiPlan('member',id);expect(plan?.title).toBe(suggestion.suggested_plan_name);expect(plan?.exercises?.[0]).toMatchObject({name:'Squat',sets:3,repsPerSet:10,restSeconds:45});});
 it('does not expose another account draft',()=>{const id=stageAiPlan('a',suggestion);expect(readAiPlan('b',id)).toBeNull();clearAiPlan('b',id);expect(readAiPlan('a',id)).not.toBeNull();clearAiPlan('a',id);expect(readAiPlan('a',id)).toBeNull();});
 it('rejects invalid AI numbers rather than silently saving them',()=>{expect(()=>stageAiPlan('a',{...suggestion,exercises:[{...suggestion.exercises[0],reps:100000}]})).toThrow();});
});
