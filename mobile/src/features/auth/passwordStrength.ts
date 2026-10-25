export function assessPasswordStrength(password: string) {
  if (!password) return { score: 0, text: 'Chưa nhập', color: 'textMuted' as const };
  if (password.length < 12) return { score: 1, text: 'Yếu — chưa đủ 12 ký tự', color: 'danger' as const };
  if (password.length > 128) return { score: 0, text: 'Quá 128 ký tự', color: 'danger' as const };
  const score = 1 + Number(/[A-Z]/.test(password)) + Number(/[0-9]/.test(password)) + Number(/[^A-Za-z0-9]/.test(password));
  if (score === 4) return { score, text: 'Mạnh', color: 'success' as const };
  if (score === 3) return { score, text: 'Khá', color: 'info' as const };
  if (score === 2) return { score, text: 'Trung bình', color: 'warning' as const };
  return { score, text: 'Yếu', color: 'danger' as const };
}
