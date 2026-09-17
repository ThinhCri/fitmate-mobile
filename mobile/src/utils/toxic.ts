/**
 * Toxic content filter — khop web App.jsx createPost validator.
 *
 * Phase UI: don gian, chi check mot vai keyword cam. Backend that se co
 * content moderation day dang hon.
 */

const BANNED = ['spam', 'scam', 'lừa đảo', 'ma túy', 'cờ bạc'];

export function containsToxic(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED.some((b) => lower.includes(b.toLowerCase()));
}

export function checkToxicOrThrow(text: string): void {
  if (containsToxic(text)) {
    throw new Error('Nội dung chứa từ ngữ không phù hợp.');
  }
}

export const POST_MAX_LENGTH = 500;

export function validatePost(text: string): { ok: boolean; reason?: string } {
  if (!text || !text.trim()) return { ok: false, reason: 'Nội dung trống.' };
  if (text.length > POST_MAX_LENGTH) {
    return { ok: false, reason: `Nội dung vượt quá ${POST_MAX_LENGTH} ký tự.` };
  }
  if (containsToxic(text)) {
    return { ok: false, reason: 'Nội dung chứa từ ngữ không phù hợp.' };
  }
  return { ok: true };
}
