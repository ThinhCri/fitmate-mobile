# Fitmate — Mobile Redesign (Android UI Migration)

> Frontend web hien tai chi la **nguon chuẩn content/nghiep vu** (fields, validation, role behavior). Theme, layout, navigation va component duoc thiet ke moi cho Android, doc lap voi web (xem `decisions.md` DEC-004, DEC-015, DEC-019).
>
> **Theme mac dinh: light theme Soft Energy** (xem `decisions.md` DEC-019, `design-system.md` Section 1-2). Phase nay KHONG build dark theme.

## Pham vi giai doan nay (UI only)

- Rebuild UI tren Android (React Native + Expo + TypeScript + Expo Router) voi design moi, khong ke thua theme web.
- Giu **day du** noi dung, chuc nang, truong du lieu, modal, luong cua web (tham chieu `current-app-audit.md` + `feature-parity-matrix.md`).
- Su dung **mock + local** data de chay va trinh dien duoc **khong can backend**.
- Tap kien truc de sau nay thay mock = backend that ma khong phai sua UI.

## KHONG trong pham vi giai doan nay

- Tich hop backend that (chi chuan bi adapter, ghi trong `integration-boundaries.md`).
- iOS, web mobile, Capacitor wrapper.
- Backend, database, auth server.
- Publish Google Play that (chi co checklist release trong `android-migration-plan.md`).
- Tinh nang nghiep vu moi (out of scope).
- Copy theme / token / class name tu web (xem DEC-004, DEC-015, DEC-017).

## Tai lieu trong thu muc `docs/mobile-redesign/`

| File | Muc dich |
|---|---|
| `README.md` | File nay. Tam nhin va chi so. |
| `current-app-audit.md` | Kiem ke **noi dung** cua ban web (line/file) → nguon content baseline. KHONG baseline visual. |
| `feature-parity-matrix.md` | Bang doi chieu noi dung/chuc nang co parity ID `FP-XXX`. |
| `design-research.md` | Nghien cuu app cung loai + Material 3 + React Native + Expo (nguon that + gioi han). |
| `design-system.md` | Tokens (mau, font, spacing) + components, **thiet ke moi**, doc lap web. |
| `screen-specs.md` | Navigation map, wireframes, dac ta tung man hinh (theo design moi). |
| `android-migration-plan.md` | Cong nghe, cau truc, giai doan, dependencies. |
| `integration-boundaries.md` | Mock adapter + diem tich hop backend tuong lai. |
| `acceptance-checklist.md` | Kich ban va tieu chi nghiem thu tung luong. |
| `tasks.md` | Trang thai task `MOB-XXX`. |
| `handoff.md` | Ban giao hien tai (diem dung, tiep theo). |
| `decisions.md` | Quyet dinh quan trong va ly do (lock + override log). |
| `cursor-rules-content.md` | Noi dung 4 rule `.mdc` (copy khi trien khai). |

## Dinh nghia hoan thanh giai doan UI

Mot task UI duoc coi la hoan thanh (DONE) khi **tat ca** dieu sau dung:

1. Da hien thi day du cac truong/hanh dong theo parity ID lien quan.
2. Co mock/local data de chay offline.
3. Da doc qua `acceptance-checklist.md` va check het case cua task.
4. Khong co UI mo (placeholder, "TBD", skip content).
5. Da cap nhat docs lien quan (parity matrix, screen specs neu co).
6. Da tao local commit theo rule `delivery-workflow.mdc`.
7. **Chua** can backend, **chua** can Google Play, **chua** can production data.
8. Da verify tren Android emulator (touch target, font scaling, contrast).

## Cach doc bo tai lieu nay (tu dau)

1. `README.md` (file nay).
2. `current-app-audit.md` — hieu web dang co noi dung gi.
3. `design-research.md` + `design-system.md` — hieu visual direction moi.
4. `screen-specs.md` + `feature-parity-matrix.md` — hieu moi man hinh can rebuild.
5. `android-migration-plan.md` — cong nghe + cau truc.
6. `tasks.md` + `handoff.md` — trang thai hien tai.
7. `decisions.md` — can doc truoc khi thay doi thiet ke nao.

Neu AI moi thay minh muon copy token / class / layout tu web → check lai DEC-004, DEC-015, DEC-017 truoc khi di tiep.
