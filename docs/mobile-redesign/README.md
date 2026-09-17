# Fitmate — Mobile Redesign (Android UI Migration)

> Frontend web hien tai duoc chuyen giao thanh **ung dung Android** (React Native + Expo + TypeScript) trong giai doan UI-only, dang phat hanh sau nay tren Google Play.

## Pham vi giai doan nay (UI only)

- Rebuild UI tren Android (React Native + Expo + TS).
- Giu **day du** noi dung, chuc nang, truong du lieu, modal, luong cua web (tham chieu `current-app-audit.md`).
- Su dung **mock + local** data de chay va trinh dien duoc **khong can backend**.
- Tap kien truc de sau nay thay mock = backend that ma khong phai sua UI.

## KHONG trong pham vi giai doan nay

- Tich hop backend that (chi chuan bi adapter, ghi trong `integration-boundaries.md`).
- iOS, web mobile, Capacitor wrapper.
- Backend, database, auth server.
- Publish Google Play that (chi co checklist release trong `android-migration-plan.md`).
- Tinh nang nghiep vu moi (out of scope).

## Tai lieu trong thu muc `docs/mobile-redesign/`

| File | Muc dich |
|---|---|
| `README.md` | File nay. Tam nhin va chi so. |
| `current-app-audit.md` | Kiem ke **ban web** hien tai voi bang chung (line/file). |
| `feature-parity-matrix.md` | Bang doi chieu noi dung/chuc nang co parity ID `FP-XXX`. |
| `design-research.md` | Nghien cuu app cung loai + Material Design. |
| `design-system.md` | Tokens (mau, font, spacing), component, trang thai. |
| `screen-specs.md` | Navigation map, wireframes, dac ta tung man hinh. |
| `android-migration-plan.md` | Cong nghe, cau truc, giai doan, dependencies. |
| `integration-boundaries.md` | Mock adapter + diem tich hop backend tuong lai. |
| `acceptance-checklist.md` | Kich ban va tieu chi nghiem thu tung luong. |
| `tasks.md` | Trang thai task `MOB-XXX`. |
| `handoff.md` | Ban giao hien tai (diem dung, tiep theo). |
| `decisions.md` | Quyet dinh quan trong va ly do. |

## Dinh nghia hoan thanh giai doan UI

Mot task UI duoc coi la hoan thanh (DONE) khi **tat ca** dieu sau dung:

1. Da hien thi day du cac truong/hanh dong theo parity ID lien quan.
2. Co mock/local data de chay offline.
3. Da doc qua `acceptance-checklist.md` va check het case cua task.
4. Khong co UI mo (placeholder, "TBD", skip content).
5. Da cap nhat docs lien quan (parity matrix, screen specs neu co).
6. Da tao local commit theo rule `delivery-workflow.mdc`.
7. **Chua** can backend, **chua** can Google Play, **chua** can production data.

## Cach doc bo tai lieu nay (tu dau)

1. `README.md` (file nay).
2. `current-app-audit.md` — hieu web dang co gi.
3. `design-research.md` + `design-system.md` — hieu visual direction.
4. `screen-specs.md` + `feature-parity-matrix.md` — hieu moi man hinh can rebuild.
5. `android-migration-plan.md` — cong nghe + cau truc.
6. `tasks.md` + `handoff.md` — trang thai hien tai.
