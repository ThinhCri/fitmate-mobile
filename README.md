# FitmateAI

> Ung dung theo doi suc khoe, dinh duong va tap luyen (Android, React Native + Expo).

Repo nay gom:

- `mobile/` — ung dung Android (React Native + Expo + TypeScript + Expo Router).
- `design-reference/stitch-export/` — nguon tham chieu giao dien Stitch.
- `docs/mobile-redesign/` — tai lieu thiet ke, parity matrix, decisions, tasks, handoff, audit.

Frontend web prototype da duoc loai bo sau khi hoan tat chuyen giao giao dien. Khi can doi chieu noi dung cu, dung tai lieu migration hoac lich su Git; khong khoi phuc web runtime vao production tree.

Xem `AGENTS.md` de biet quy tac lam viec cua moi AI agent tren repo nay.

## Quick start (mobile)

`
cd mobile
npm install
npx tsc --noEmit
npx expo start
`

App Android se mo o emulator (can co Android Studio + AVD) hoac qua Expo Go (quet QR).

### Demo users

- `user@fitmate.vn` / `123456` (member)
- `pt@fitmate.vn` / `123456` (PT da verify)
- `mentor1@fitmate.vn` / `123456` (mentor)

Password gia dinh, chi dung cho demo. KHONG su dung cho production.

## Tech stack (mobile)

- React Native 0.86 + Expo SDK 57.
- Expo Router (file-based routing).
- TypeScript strict mode.
- Theme: **Soft Energy** (light-only) — `mobile/src/theme/`. Xem `docs/mobile-redesign/design-system.md`.
- Storage: AsyncStorage wrapper + expo-secure-store.
- Icons: lucide-react-native.
- Bottom sheet: @gorhom/bottom-sheet.
- Toast: react-native-toast-message.

## Feature parity voi web

Xem `docs/mobile-redesign/feature-parity-matrix.md` (FP-001..040). Trang thai hien tai: **IMPLEMENTED** (code done), can runtime verification de set DONE.

## Docs

| File | Muc dich |
|---|---|
| `AGENTS.md` | Onboarding AI agent + quy tac |
| `docs/mobile-redesign/README.md` | Tong quan migration |
| `docs/mobile-redesign/decisions.md` | DEC-001..020 (quyet dinh + ly do) |
| `docs/mobile-redesign/design-system.md` | Tokens (Soft Energy), typography, components |
| `docs/mobile-redesign/feature-parity-matrix.md` | FP-001..040 (parity voi web) |
| `docs/mobile-redesign/screen-specs.md` | Wireframes + nav map |
| `docs/mobile-redesign/tasks.md` | MOB-XXX (status, deliverable, commit) |
| `docs/mobile-redesign/acceptance-checklist.md` | F-* test scenarios |
| `docs/mobile-redesign/audit-mobile-vs-docs.md` | Audit code vs docs |
| `docs/mobile-redesign/handoff.md` | Ban giao hien tai (commit, FP done, next step) |

## Quy tac commit

- Conventional Commits: `<type>(<scope>): <desc> [MOB-XXX]`
- KHONG push, merge, amend, rebase, reset --hard.
- KHONG commit secrets.
- Demo auth chi dung `user@fitmate.vn` / `pt@fitmate.vn` / `mentor1@fitmate.vn`.

## Lien he nhanh

- Trang thai task: `docs/mobile-redesign/tasks.md`.
- Handoff: `docs/mobile-redesign/handoff.md`.
- Audit: `docs/mobile-redesign/audit-mobile-vs-docs.md`.
