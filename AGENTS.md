# AGENTS.md

## Production integration baseline — 2026-09-22
Đọc docs/production/README.md, business-requirements.md, shared-business-rules.md và integration-plan.md trước task tích hợp.
Chỉ dẫn mock-only dưới đây áp dụng prototype; giai đoạn production được dùng BE local/staging theo contract đã verified. Không tự gọi production hoặc dịch vụ trả phí.
Wire DTO/UUID/permissions/financial calculations theo BE; prototype chỉ là content inventory. Được sửa model/route email thành UUID có adapter/migration, giữ đủ trường hiển thị.
Không giữ nguyên mock schema khi nó sai nghiệp vụ. Không fallback mock khi API lỗi hoặc đưa password/demo reward vào production.
Nguồn chuẩn BE PROD-2026-09-22-v1; snapshot rules không sửa độc lập. Công việc tiếp theo MOB-800..808; chưa DONE chỉ vì đã có UI.
Commit tiếng Anh <=72 ký tự, không Co-authored-by; không tự commit thay đổi của người khác.

## Mobile production + Stitch baseline — 2026-09-28

- Đọc `docs/design/stitch-react-native-rules.md` trước mọi thay đổi trong `mobile/**` hoặc `design-reference/stitch-export/**`.
- Stitch là nguồn chuẩn thị giác cho các màn đã map; backend business rules + OpenAPI là nguồn chuẩn hành vi và wire contract.
- Contract có thật tại repo BE, nhưng từng operation chỉ được bật khi task/evidence tương ứng cho phép. OpenAPI không tự chứng minh release readiness.
- Mock/localDb/RewardSimulation chỉ là lịch sử prototype hoặc development preview explicit; không fallback mock khi API lỗi.
- Không xóa app cũ trước khi replacement tồn tại. Chuyển caller rồi mới xóa presentation code không còn dùng.
- Theo yêu cầu user hiện hành: không tự chạy install/build/test/lint/typecheck/server/Expo/Docker/migration và không tự commit/push. Viết code/test source/docs và đưa lệnh để user chạy.

> Huong dan cho moi AI (Cursor Agent, Claude, ChatGPT, ...) khi lam viec tren repo nay.

Repo nay chua mot frontend web React + Vite dang chuyen giao thanh **ung dung Android** (React Native + Expo + TypeScript + Expo Router).

## Baseline ngon ngu: web KHONG phai baseline visual

Frontend web hien tai chi la nguon chuẩn cho **kiem ke noi dung va chuc nang**:
- Truong du lieu, validation, role (member/PT).
- Hanh dong, ket qua thao tac, y nghia nghiep vu.
- Mock data dang co (default users, posts, certificates).

Frontend web KHONG phai nguon chuẩn cho **theme, layout, navigation, components hay copy visual**. Do do:
- Khong lay theme/mau/icon/font/layout/component cua web de thiet ke Android.
- Khong copy CSS class names (`glass-card`, `btn-primary`, ...).
- Neu mot quyet dinh thiet ke giong web → phai co ly do doc lap (e.g., "token X dat WCAG AAA"), khong phai "web dang lam vay".

Xem [docs/mobile-redesign/decisions.md](docs/mobile-redesign/decisions.md) DEC-004, DEC-015, DEC-017 de biet ly do.

## Truoc khi sua code, BAT BUOC doc theo thu tu

1. [`docs/mobile-redesign/tasks.md`](docs/mobile-redesign/tasks.md) — task dang chay, status, ID can thao tac.
2. [`docs/mobile-redesign/handoff.md`](docs/mobile-redesign/handoff.md) — diem dang dung, da lam, tiep theo.
3. [`docs/mobile-redesign/decisions.md`](docs/mobile-redesign/decisions.md) — cac quyet dinh da chot (cong nghe, design, pham vi).
4. `docs/mobile-redesign/<ten file>.md` lien quan den task dang lam:
   - Chinh sua UI → `screen-specs.md`, `design-system.md`, `feature-parity-matrix.md`.
   - Them mock adapter → `integration-boundaries.md`, `current-app-audit.md`.
   - Android-specific → `android-migration-plan.md`.
   - Nghiem thu → `acceptance-checklist.md`.
5. Cac rule `.cursor/rules/*.mdc` dang ap dung cho task (trong phien planning cac rule nay duoc ghi san trong `docs/mobile-redesign/cursor-rules-content.md`; can tao file `.mdc` khi bat dau trien khai).
6. Git: `git status`, `git log --oneline -20` de xem thay doi gan day.

## Nguyen tac khong duoc phep vi pham

- **Khong tu xoa** code frontend web hien tai. Code web duoc giu nguyen de tham chieu content.
- **Khong copy token / CSS / component style tu web sang mobile**. Mobile tokens doc lap theo DEC-015.
- **Khong tu y them tinh nang nghiep vu moi** (out of scope). Neu thay co y tuong, ghi vao tasks voi tag `out-of-scope` roi dung lai.
- **Khong goi API production** hoac dich vu tra phi. Production implementation dùng backend local/staging đã cấu hình; fixture chỉ dùng trong preview `__DEV__`, không làm fallback khi API lỗi.
- **Khong push / merge / amend / reset --hard**. Chi commit local.
- **Khong commit secrets** (token, password, khóa provider, dữ liệu thật). Demo credentials cũ chỉ là inventory prototype và phải bị loại khỏi production paths.
- **Khong tu thay** validation/cach tinh dang co neu khong co ly do ro rang va duoc ghi trong `decisions.md`.
- **Khong danh dau DONE** task khi thieu kiem chung. Xem `acceptance-checklist.md` cho tieu chi.
- **Khong viet commit dua tren placeholder gia su that user**.

## Cach trao doi voi user

- User la nguoi khong ky thuat (hoc sinh cap 2 theo mo ta). Giai thich ngan, tranh jargon, co vi du cu the.
- Gom cac cau hoi can thiet thanh mot luot.
- Khi co blocker, ghi ro nguyen nhan, da thu gi, goi y tiep theo.
- Luon viet tieng Viet nhu user.

## Quy uoc dat ten

- Task ID: `MOB-XXX` (X la so, co 3 chu so).
- Parity ID: `FP-XXX` (X la so, co 3 chu so). Xem `feature-parity-matrix.md`.
- Component React Native: PascalCase, `.tsx`. Folder: lowercase-kebab.
- File lien quan nhau: dat cung folder `src/features/<feature>/`.
- Theme tokens: ten semantic (khong hardcode hex), dat trong `mobile/src/theme/`.

## Commit

- Không tự commit. Chỉ chuẩn bị danh sách file + message tiếng Anh và commit khi user yêu cầu rõ ràng (xem `delivery-workflow.mdc`).
- Message: `<type>(<scope>): <mo ta ngan> [MOB-XXX]`
- Khong commit thay doi cua AI khac neu khong xac dinh duoc.
- Khong commit file rong.
- Khong viet commit dua tren placeholder gia su that user.

## Lien he nhanh

- Pham vi: xem `docs/mobile-redesign/README.md`.
- Trang thai task: `docs/mobile-redesign/tasks.md`.
- Checklist nghiem thu: `docs/mobile-redesign/acceptance-checklist.md`.

Cuoi moi phien, cap nhat `docs/mobile-redesign/handoff.md`.
