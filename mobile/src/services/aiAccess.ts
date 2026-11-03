import { systemService } from './api/systemService';
import { aiUsageService } from './api/aiUsageService';
export async function checkAiAccess(kind: 'scan' | 'workout'): Promise<{ allowed: boolean; message: string }> {
 const caps = await systemService.getCapabilities();
 if (!caps.ai.enabled || !(kind === 'scan' ? caps.ai.food_scan : caps.ai.workout_adjust)) return {allowed:false,message:kind === 'scan' ? 'Nhận diện món ăn hiện chưa sẵn sàng. Bạn vẫn có thể ghi bữa ăn thủ công.' : 'Gợi ý kế hoạch AI hiện chưa sẵn sàng. Bạn vẫn có thể tự tạo kế hoạch.'};
 const usage = await aiUsageService.getStatus(); const quota=kind === 'scan' ? usage.scan : usage.chat;
 if (usage.enforcement_enabled && quota.remaining <= 0) return {allowed:false,message:'Bạn đã dùng hết lượt AI. Lượt được làm mới lúc ' + new Date(usage.resets_at_utc).toLocaleString('vi-VN') + '.'};
 return {allowed:true,message:usage.enforcement_enabled ? 'Còn '+quota.remaining+' lượt AI.' : 'Gợi ý cần được xem lại trước khi áp dụng.'};
}
