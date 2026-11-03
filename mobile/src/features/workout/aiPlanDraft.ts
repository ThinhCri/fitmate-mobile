import type { WorkoutPlanViewModel } from './workoutTypes';
export interface AiPlanSuggestion { suggested_plan_name:string; description:string|null; exercises:{exercise_name:string;sets:number;reps:number;rest_seconds:number|null;notes:string|null}[] }
let draft: {id:string;owner:string;plan:Partial<WorkoutPlanViewModel>} | null=null;
export function stageAiPlan(owner:string,suggestion:AiPlanSuggestion):string {
 if(!owner || !suggestion.exercises.length || suggestion.exercises.length>12) throw new Error('Gợi ý không có danh sách bài tập hợp lệ.');
 const id=Date.now().toString(36);
 const exercises=suggestion.exercises.map((item,index)=>{
  if(!item.exercise_name.trim() || !Number.isInteger(item.sets) || item.sets<1 || item.sets>6 || !Number.isInteger(item.reps) || item.reps<1 || item.reps>50 || (item.rest_seconds !== null && (!Number.isInteger(item.rest_seconds) || item.rest_seconds<0 || item.rest_seconds>300))) throw new Error('Thông số gợi ý chưa hợp lệ. Vui lòng yêu cầu lại.');
  return {id:id+'-'+index,name:item.exercise_name,type:'reps' as const,sets:item.sets,repsPerSet:item.reps,restSeconds:item.rest_seconds ?? 45,instructions:item.notes ?? undefined,caloriesEstimate:0};
 });
 draft={id,owner,plan:{title:suggestion.suggested_plan_name,description:suggestion.description ?? '',category:'Mon',durationMinutes:45,caloriesEstimate:0,isActive:true,exercises}};
 return id;
}
export function readAiPlan(owner:string,id:string):Partial<WorkoutPlanViewModel>|null { return draft?.owner===owner && draft.id===id ? draft.plan : null; }
export function clearAiPlan(owner:string,id:string) { if(draft?.owner===owner && draft.id===id) draft=null; }
