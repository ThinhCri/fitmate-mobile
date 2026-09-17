# Handoff — Ban giao hien tai

> Phien nay moi lap ke hoach (khong implement mobile). Phien sau (khi user yeu cau "Trien khai theo ke hoach") se bat dau MOB-001.

## Muc tieu hien tai

**Hoan tat planning**: docs + Cursor rules + AGENTS.md de AI moi co the tiep tuc.

## Branch & checkpoint Git

- Branch: `main`
- Working tree: clean (xac minh bang `git status`).
- Commit gan day: xem `git log --oneline -20`.
- Commit se tao khi ket thuc phien nay: mot commit docs(plan): planning Android UI migration (xem `tasks.md`).

## Trang thai task

- Da hoan thanh trong phien nay: KHONG (phien nay chi tao docs).
- Dang lam: KHONG.
- TODO: MOB-001..MOB-303 (xem `tasks.md`).

## Thay doi chua commit

- Co: `AGENTS.md`, `docs/mobile-redesign/*.md` (gom 13 file), `docs/mobile-redesign/cursor-rules-content.md`. **Chua commit**.
- Ly do: phien nay chua commit den cung; 1 commit docs se tao o cuoi phien.
- Cac file `.cursor/rules/*.mdc` CHUA duoc tao (Cursor plan mode chan). Noi dung da ghi san trong `docs/mobile-redesign/cursor-rules-content.md` de AI trien khai copy thanh `.mdc` khi can.

## Phan thieu / blockers

- **Web khong chay thu cong trong phien nay**: khong co emulator Android, khong co browser de screenshot. Audit dua tren doc code truc tiep.
- **Khong truy cap duoc web search/Material docs** trong phien nay (`web_fetch` 404, search error). Cac nguon tham khao trong `design-research.md` ghi ro la **tren hieu biet chung**; can verify khi co tool.
- **Chua tao project mobile** (dung dung theo rule planning). Se tao khi "Trien khai theo ke hoach".

## Kiem tra da chay

- `git status` PASS (clean truoc khi them file).
- `git log --oneline -20` PASS.
- `dir` xac nhan folder structure web.
- Doc truc tiep cac file components + `App.jsx` + CSS + `package.json` + `vite.config.js`.

## Kiem tra chua chay

- `npm run dev` web (chua khoi dong).
- Android emulator (chua co).
- Test thuc te cac flow tren UI moi.

## Lenh chay/build/test da xac minh

- Web: `npm install`, `npm run dev`, `npm run build`, `npm run lint`. Scripts verified tu `package.json` (line 6-10).
- Mobile: **chua xac minh**, se chay khi init.

## Task tiep theo khi user yeu cau "Trien khai theo ke hoach"

1. Tao branch `feat/mobile-init` tu `main` (optional - co the lam truc tiep).
2. MOB-001: `cd mobile && npx create-expo-app@latest . --template blank-typescript`.
3. MOB-002: tokens.ts, theme provider, primitives.
4. MOB-003: storage wrapper.
5. MOB-004: mock service skeleton.
6. MOB-005: navigation root.
7. Sau phase 1, tien hanh phase 2.

## Rang buoc quan trong (can nho)

- KHONG sua web (goc).
- KHONG push.
- KHONG goi production API / dich vu tra phi.
- KHONG bi bo content / field / modal.
- PHAN BIET ro: UI xong | Mock xong | Real backend | Production release.

## Nhung phan dang mock (chua tich hop backend)

- Toan bo auth, AI vision, AI chat, friend cross-user, payment, push.
- Tat ca API thanh local mock voi AsyncStorage persistence.

## AI moi can lam gi khi tiep tuc

1. Doc `AGENTS.md` truoc.
2. Doc `docs/mobile-redesign/handoff.md` (file nay).
3. Doc `docs/mobile-redesign/tasks.md` → lay task dang IN_PROGRESS.
4. Doc `docs/mobile-redesign/decisions.md` → biet quyet dinh da chot.
5. Doc parity ID lien quan trong `feature-parity-matrix.md`.
6. So voi code that qua `git status` + `git log` + doc file lien quan.
7. Tien hanh task theo quy trinh trong rule `delivery-workflow.mdc`.

## Cursor rules (con lai)

- 4 rule `.mdc` da co noi dung san trong [`docs/mobile-redesign/cursor-rules-content.md`](docs/mobile-redesign/cursor-rules-content.md).
- Trong phase planning toi khong the tao file `.mdc` truc tiep (Cursor yeu cau plan mode chi edit markdown, nhung rule loader chan file `.mdc`). Khi "Trien khai theo ke hoach" (MOB-001..), can copy 4 block trong file do thanh `.cursor/rules/preserve-content.mdc`, `mobile-design-system.mdc`, `android-implementation.mdc`, `delivery-workflow.mdc`.

Moi thong tin trong docs tren day dua tren code that da doc truc tiep (khong suy). Tru cac muc ro rang "chua xac minh" trong `current-app-audit.md` va `design-research.md`.
