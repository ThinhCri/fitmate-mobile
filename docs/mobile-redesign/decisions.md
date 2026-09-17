# Decisions — Quyet dinh quan trong & ly do

> Moi quyet dinh lon phai ghi o day. Them moi o cuoi, khong sua cu.

---

## DEC-001 — Chon React Native + Expo + TypeScript (khong phai Capacitor)

**Ngay**: 2026-09-17.

**Boi canh**:
- Frontend web: React 19 + Vite + JSX.
- Goal: app Android native, brand-consistent, future-ready cho Google Play.
- Khong yeu cau iOS trong giai doan nay.

**Lua chon**:
- (A) React Native + Expo + TypeScript.
- (B) Capacitor (WebView wrapper).

**Ly do chon A**:
- React Native cung cap native UI that → Material 3, ripple, hardware back, system dark mode, system font scaling, edge-to-edge — Capacitor khong co.
- React 19 share component model (props, hooks, state) → giam learning curve.
- Expo cung local dev / emulator / EAS Build / OTA — Cong cu tot cho 1 nguoi + AI.
- Lucide-react-native co san (API giong lucide-react) → khong re-design icon.
- Migration nhin lau: native de mo rong (camera that, push that, background task).

**Ly do KHONG chon B**:
- WebView wrapper → giong "web tren dien thoai", khong phai native UX.
- Material/ripple/font scaling khong that, chi CSS.
- Brand Fitmate muon dark-glow ca tinh → native dep hon CSS.

**He qua**:
- UI phai viet lai (RN khong hieu `<div>` / CSS file).
- DOM API (`window.open`, FileReader, `URL.createObjectURL`) phai thay.
- localStorage → AsyncStorage.
- Approx effort Phase 1 (skeleton + tokens + storage + mock services + nav): theo MOB-001..005.

**Quyet dinh bi thay the**: (khong co — lan dau chon).

---

## DEC-002 — Giu brand "Glow Sport" (dark + neon green + orange), khong Material You dynamic color

**Boi canh**: Co 2 huong trong `design-research.md`: A (Glow Sport, giong web) vs B (Calm Material).

**Lua chon**: A.

**Ly do**:
- Web da co brand identity (xem `fitmate_figma_prompt.txt`).
- Nguoi dung/thanh vien co the da gan voi mau xanh + cam + dark; cat lien ket se giam nhan dien.
- Material 3 dynamic color phu thuoc wallpaper → chi Android 12+ → khong consistent.

**He qua**:
- Implement Material 3 components ma custom mau (khong dung dynamic palette).
- Token names custom nhung map duoc sang Material roles (primary/secondary/...).

**Quyet dinh bi thay the**: (khong co).

---

## DEC-003 — Mock adapter pattern cho service, de sau swap backend

**Boi canh**: Phase UI khong co backend that.

**Lua chon**: Service interface → MockAdapter (now) + RealApiAdapter (later).

**Ly do**:
- UI chi goi interface → sua Mock = khong anh huong UI.
- On dinh demo (khong network dependency).
- Giam "code smell" khi sau viet API that.

**He qua**:
- Phai viet interface theo domain (Auth/User/Workout/...).
- Phai persist qua AsyncStorage wrapper.
- Test service don le kiem chung hon.

---

## DEC-004 — Folder mobile rieng `mobile/`, khong chinh sua web

**Boi canh**: Trong workspace chi co repo frontend web. Can git / ban giao song song.

**Lua chon**: Tao `mobile/` o root, khong sua `src/`.

**Ly do**:
- Web la baseline reference cho parity.
- Khi migration xong co the tach ra repo rieng.
- Tranh conflict voi web (van dang co commit tren main).

**He qua**:
- Phai import cross module trong monorepo style (optional) hoac duplicate fixtures (simpler).
- Decided: duplicate fixtures trong `mobile/src/mocks/` → on dinh.

---

## DEC-005 — Persistence can thiet de demo cross-user (local multi-user)

**Boi canh**: Web hien tai sync A↔B qua localStorage in-memory. Mobile can cung hanh vi.

**Lua chon**: `mobile/src/services/localDb.ts` giu nhieu user account (giong web), cross-user service cap nhat nhieu account.

**Ly do**: de demo friend request cross-user vi demo tren 1 device.

**He qua**:
- Phai quan ly logout switch user.
- Sau khi co backend that, can design re-auth flow.

---

## DEC-006 — Knowledge reward simulation TRONG app, co canh bao "demo only"

**Boi canh**: Web co interval moi 4s gia lap reaction cho post knowledge.

**Lua chon**: Giu nguyen hanh vi + them marker "Day la simulation, khong phai diem that".

**Ly do**:
- Day la 1 part cua "FITMATE_FEATURE" → phai giu de parity.
- User can biet day khong phai diem that de tranh hieu lam.

**He qua**:
- Co canh bao noi trong post knowledge badge.
- Co toast ro rang khi diem tang.

---

## DEC-007 — Bo emulator shell (FP-034, FP-036) khi migrate

**Boi canh**: Web co phone-emulator 380x780px, notch, home indicator chi de demo desktop.

**Lua chon**: Bo tat ca tren Android that.

**Ly do**:
- Android that co native status bar, nav bar, edge-to-edge.
- Notch tu thiet bi, khong can gia.
- Home indicator chi cho iPhone X+.

**He qua**:
- File `src/index.css` duoc giu nguyen (web baseline) → khong sua.
- Android app khong co shell wrapper.

---

## DEC-008 — Khong goi production API / dich vu tra phi trong phase nay

**Boi canh**: User muon tap truoc, integration sau.

**Lua chon**: Tat ca POST/GET su dung mock. Link `http://localhost:8080/api/...` se bi bo (fallback local).

**Ly do**:
- Khong yeu cau backend.
- Tranh leak data development ra production.
- Tranh dot nhien goi dich vu tra phi (vision AI, ...) trong demo.

**He qua**:
- Service interface co 2 adapter, mock luon kich hoat.

---

## DEC-009 — Chung chi: admin simulate chi de demo UI

**Boi canh**: PT co nut admin "Duyệt / Reset" de test flow cert.

**Lua chon**: Giu nguyen + ghi ro "Demo only".

**Ly do**:
- UI can verify toan bo flow verified/pending/unverified.
- Production se co admin tool that; demo phase khong can.

**He qua**:
- Admin panel chi hien khi `isSelf === true` → an toan.

---

## DEC-010 — Su dung `@react-navigation` (native-stack + bottom-tabs) + `@gorhom/bottom-sheet`

**Boi canh**: Nhieu lua chon navigation: React Navigation, Expo Router, custom.

**Lua chon**: @react-navigation vanilla + bottom-tabs (de migrate bottom-nav hien tai) + gorhom/bottom-sheet (de thay modal bottom).

**Ly do**:
- React Navigation de dang viet Native Stack + Bottom Tabs (gia lap navigator Android).
- Bottom Sheet cua gorhom rat mem, native feel, navigation Native de integrate.
- Expo Router (file-based) tot cho project moi nhung se lam routing doi voi pattern hien tai.

**He qua**:
- Stack root cho main, tabs cho tab trung tam, sheet cho cac luu flow.

---

## DEC-011 — Phase 1 (Foundation) truoc phase 2 (critical path) truoc phase 3+

**Boi canh**: nhieu task dependency.

**Lua chon**: Lam theo phase (MOB-001 → MOB-101 → ...).

**Ly do**:
- Tranh base khong on dinh → phai sua nhieu.
- Token + nav + service truoc → UI build nhanh.

**He qua**:
- Phai verify Phase 1 tren emulator truoc khi MOB-101.

---

## DEC-012 — Status quo web emulator shell: KHONG sua

**Boi canh**: User co the con dev web, commit tren main.

**Lua chon**: Web giu nguyen, khong ap dung mobile tokens vao web.

**Ly do**: Tranh ghi de thay doi khong lien quan.

**He qua**: Web tokens (var(--accent-green) ...) giu CSS var rieng; mobile co theme file rieng.

---

## DEC-013 — Khi gap conflict content web ↔ mobile, **web la baseline**

**Boi canh**: Trong qua trinh migration co the thay UI web co bug hoac thieu field.

**Lua chon**: Khong sua web. Ghi bug vao `tasks.md` voi tag `pre-existing-bug`; neu can hien thi day du trong mobile → them, khong sua web.

**Ly do**:
- Tranh lan rong pham vi.
- Web co the co user v6 dang dung.
- App moi la target migration → fix tai day.

---

## DEC-014 — Acceptance criteria PASS truoc khi set DONE

**Boi canh**: nhieu parity ID, de quen case.

**Lua chon**: Moi task phai check `acceptance-checklist.md` de set DONE.

**Ly do**:
- Tranh UI "dep nhung sai" → parity giam.
- Co bang chung cu the (line, behavior, ...).

**He qua**:
- Phase 6 (MOB-200..202) la verification tong the truoc release.
