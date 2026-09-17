# Android Migration Plan — Cong nghe, cau truc, giai doan

> Quyet dinh ky thuat cho migration tu web (React + Vite) sang Android (React Native + Expo + TypeScript + Expo Router, xem DEC-016). Khoa thanh mot luong de som verify tren Android emulator, sau do nhan rong.
>
> **Luu y**: tokens/theme cuoi cung lay theo DEC-019 (Soft Energy, light-only). Trong file nay chi tom tat de xuat ky thuat, khong phai spec design. Phase nay KHONG build dark theme.

## 1. Quyet dinh cong nghe (co ly do tu code)

### Lua chon A — React Native + Expo + TypeScript

- **Ly do chon**:
  - Web dang dung React 19 + JSX → React Native giu duoc React model (component, state, effect); team khong can hoc lai framework.
  - Expo cho phep chay / build / dev tren Android emulator / device that (qua Expo Go hoac EAS Build).
  - TypeScript ho tro parity matrix (mo ta data shape) de tranh regression.
  - Native UI → **real Android UX**: Material 3, ripple effect, system back, status bar, font scaling, dark mode native.
  - Lucide-react da co `lucide-react-native` → giu API icon, khong phai re-design.
- **Ly do KHONG chon Capacitor**:
  - WebView wrapper → khong phai native → thiet ke se bi gioi han DOM/CSS/JS.
  - Tap/pin/camera/seamless khong bang native.
  - Brand Fitmate rat heavy vao Material-like feel → native portrait tot hon.
- **Luu y**: React Native khong dung HTML `<div>` → cac class CSS `.glass-card`, `.btn-primary` se duoc viet lai bang StyleSheet.create.
- **Danh gia do tai su dung code**:
  - Logic (BMI, schedule, calculations, mock data, validation) → **gia su portable** (refactor JS thuần).
  - UI → **viet lai 100%** (RN khong ho tro CSS file ngoai StyleSheet).
  - localStorage → AsyncStorage.
  - `fetch('http://localhost:8080/...')` → bo (fallback local); neu can viet lai voi base URL env.

### Lua chon B — Capacitor

- Chi de tham khao; BO vi khong phai native UX (xem `decisions.md`).

## 2. Phan loai code web vs code moi

| Category | Trang thai |
|---|---|
| Logic/model tinh (BMI, streaks, AI canned replies, ...) | PORT sang TS module, giu logic |
| Pure data shape (mock users, posts, certificates, ...) | PORT thanh TS fixtures |
| UI components (.glass-card, .btn-primary) | VIET LAI bang RN StyleSheet + tokens |
| DOM API (window.open, FileReader) | THAY = RN linking, image-picker, Blob URL |
| CSS file (.css) | BO, thay bang theme tokens trong TS |
| localStorage | THAY = AsyncStorage wrapper |
| lucide-react | THAY = lucide-react-native (API giong) |

## 3. Cau truc du an (de xuat)

### 3.1 Vi tri folder mobile

- **De xuat**: tao subfolder `mobile/` o root repo (ngang `src/`).
- **Ly do**: web la **baseline content/nghiep vu** (xem DEC-004, `current-app-audit.md`) — de tham chieu fields/validation/role behavior. Khi migration xong co the tach ra repo rieng. Visual, tokens, layout → **doc lap hoan toan** (xem DEC-015).
- **Schema**:
  ```
  FitmateAI_FE/
  ├── src/              <- web (giu nguyen)
  ├── docs/             <- docs
  ├── mobile/           <- moi, RN + Expo + TS
  │   ├── app.json
  │   ├── package.json
  │   ├── tsconfig.json
  │   ├── app/          <- Expo Router
  │   ├── src/
  │   │   ├── components/
  │   │   ├── features/
  │   │   ├── navigation/
  │   │   ├── theme/
  │   │   ├── mocks/
  │   │   ├── services/
  │   │   └── utils/
  │   ├── assets/
  │   └── ...
  ```

### 3.2 Navigation

- **Expo Router** (xem DEC-016, `docs.expo.dev/router/introduction/`).
- File-based routing trong `mobile/app/`:
  - `app/_layout.tsx` → RootStack (RootStackProvider, ThemeProvider).
  - `app/(auth)/` → Login, Register.
  - `app/(tabs)/_layout.tsx` → BottomTabs (5 tab: Dashboard, Nutrition, Workout, Social, Marketplace).
  - `app/(tabs)/dashboard.tsx`, `nutrition.tsx`, ...
  - `app/(modals)/` → Profile, EditProfile, Appointments, ...
- Native Stack duoc build-in (qua React Native Screens).
- Bottom sheet (`@gorhom/bottom-sheet`) ben trong tung screen / modal theo nhu cau.

### 3.3 State management

- Tam thoi: React Context + useState/useReducer (giong pattern cua `App.jsx`).
- Sau (optional): Zustand hoac Redux Toolkit neu lon.
- Ly do: giai doan UI khong can phuc tap hoa.

### 3.4 Storage

- AsyncStorage wrapper: `@/services/storage.ts` export `get(key)`, `set(key, value)`, `remove(key)`.
- Trong `services/mockUserService.ts` de ky thuat cross-user sync (xem `integration-boundaries.md`).

### 3.5 Theme

- `theme/tokens.ts` exports tokens theo DEC-019 (Soft Energy, **light-only**).
- `theme/ThemeProvider.tsx` cung cap `useTheme()` hook.
- KHONG import CSS var tu `src/index.css` (web). Tokens doc lap hoan toan (xem DEC-004, DEC-015, DEC-019).
- Token names theo M3 convention (surface, surfaceContainerLowest, surfaceContainerLow, surfaceContainer, surfaceContainerHigh, surfaceContainerHighest, primary, secondary, tertiary, error, onXxx, xxxContainer, ...).
- Component wrapper: `<Card>`, `<Button>`, `<Input>`, `<Chip>`, `<BottomSheet>`, etc. su dung tokens tu theme; khong hardcode mau.
- Phase nay KHONG build dark theme. Neu user yeu cau dark sau, token names mapping M3 Token Studio de them dark variant ma khong phai sua component.

### 3.6 Folder features

- `features/auth/`: login, register, AuthContext.
- `features/dashboard/`: streak card, ring, quick action.
- `features/nutrition/`: scan + plan + allergy.
- `features/workout/`: plan + session + medical.
- `features/social/`: ai-chat + feed + create-post.
- `features/marketplace/`: pt list + booking.
- `features/appointments/`: calendar + day detail.
- `features/profile/`: view + edit + chuyen sau + cert.
- `features/messenger/`: chat.
- `features/notifications/`: list + filters.
- `features/friends/`: friends + requests + search.
- `features/rewards/`: withdraw + VIP + support.

### 3.7 Folder common

- `components/ui/`: primitive (Button, Card, Chip, Avatar, ...).
- `components/layout/`: BottomNav, Drawer.
- `services/`: storage, mock auth, mock users, post service, friend service, message service.
- `mocks/`: fixtures (default users, posts, cert).
- `utils/`: BMI calculator, calorie helpers, time formatters, toxic filter.

## 4. Dependencies (de xuat, KHONG cai trong phien planning)

Trong phien implement se them vao `mobile/package.json`:

```jsonc
{
  "dependencies": {
    "react": "19.x",
    "react-native": "0.81.x hoac moi nhat on dinh",
    "expo": "latest stable",
    "expo-status-bar": "~x",
    "expo-font": "~x",
    "expo-image-picker": "~x",
    "expo-linking": "~x",
    "@react-navigation/native": "^x",
    "@react-navigation/native-stack": "^x",
    "@react-navigation/bottom-tabs": "^x",
    "@gorhom/bottom-sheet": "^x",
    "react-native-reanimated": "^x",
    "react-native-gesture-handler": "^x",
    "react-native-svg": "^x",
    "lucide-react-native": "^x",
    "@react-native-async-storage/async-storage": "^x",
    "@react-native-community/datetimepicker": "^x",
    "react-native-toast-message": "^x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "~19",
    "@types/react-native": "~x",
    "eslint": "^x",
    "prettier": "^x"
  }
}
```

Khi implement phai kiem tra compatibility tu official docs (khong tin "latest" moi).

## 5. Giai doan (phase)

### Phase 1 — Foundation (MOB-001..005)

- MOB-001: Tao skeleton mobile (Expo + TS + ESLint + folder structure).
- MOB-002: Tao tokens + theme + base components (Button, Card, Chip, Input, Avatar, BottomSheet).
- MOB-003: Tao storage wrapper + AsyncStorage adapter.
- MOB-004: Tao mock user service + mock post + mock friend + mock message + mock cert.
- MOB-005: Tao navigation root + Auth gate + BottomTabs + Drawer.

### Phase 2 — Critical path (MOB-101..103)

- MOB-101: Dashboard shell + Streak + Calorie ring + Quick action.
- MOB-102: Drawer.
- MOB-103: NotificationsScreen.

### Phase 3 — Other primary tabs (MOB-111..115)

- MOB-111: Nutrition (scan + plan + allergy).
- MOB-112: Workout (day ribbon + swap + timer + medical).
- MOB-113: Marketplace + BookingSheet.
- MOB-114: Appointments + Day detail.
- MOB-115: Profile + Edit + Friend UI + Book.

### Phase 4 — Social & Content (MOB-107..110, MOB-116..118)

- MOB-107: CreatePost.
- MOB-108: Feed + reactions + comments + reward simulation.
- MOB-109: AI Companion chat.
- MOB-110: Social feed main.
- MOB-116: ChuyenSauScreen.
- MOB-117: PTCertificatesScreen.
- MOB-118: Messenger.

### Phase 5 — Secondary + polish (MOB-104..106, MOB-119, MOB-120)

- MOB-104: FriendRequestsScreen.
- MOB-105: UserSearchScreen.
- MOB-106: Friend service cross-user.
- MOB-119: Auth (login + register).
- MOB-120: Withdraw + VIP + Support.

### Phase 6 — Verification before scale (MOB-200..202)

- MOB-200: Verify navigation, fonts, contrast, touch, scrolling, keyboard, font scaling tren emulator/device.
- MOB-201: Verify parity matrix full PASS tren Android.
- MOB-202: Verify acceptance checklist PASS.

### Phase 7 — Release prep (MOB-300..303, future)

- MOB-300: Material 3 expressive audit (neu release sau M3E chinh thuc).
- MOB-301: Data safety + privacy disclosure (xem `acceptance-checklist.md`).
- MOB-302: Signing + release build (EAS).
- MOB-303: Google Play Console metadata (icons, screenshots, feature graphic, content rating, target API, privacy).

## 6. Android-specific luu y

### Safe area & system bars
- Dung `react-native-safe-area-context`.
- Status bar: dark text/light icons tuy theme.
- NavigationBar: translucent neu can; can chinh viewport.

### Notional emulator shell (FP-034, FP-036)
- KHONG can trong Android that → **bo**.

### Hardware back
- Tab changes: khong xu ly.
- Modal/Screen: onBackPressed → rieng cho tung screen.
- Hardware back se dua stack len tren.

### Touch target
- Min 48x48dp; nut nho can padding.

### Font scaling
- android:supportsRtl true → test 1.5x scale.

### Permissions
- Camera (image picker): optional (scan photo) → request qua image-picker; neu tu choi → hien fallback "Chon tu thu vien".
- Notifications (push): bo trong UI-only phase.
- Storage: khong can neu chi AsyncStorage.

## 7. Build & dev script (de xuat)

`mobile/package.json`:

```jsonc
{
  "scripts": {
    "android": "expo run:android",
    "start": "expo start",
    "prebuild": "expo prebuild",
    "type-check": "tsc --noEmit",
    "lint": "eslint ."
  }
}
```

## 8. Han che cua phien planning

- Chua chay `npx create-expo-app` (khong tao project trong planning).
- Chua kiem tra package version compatibility — phai verify khi implement.
- Emulator requirement: macOS / Windows can Android Studio + AVD; neu khong co, build se bi BLOCKED.

## 9. Release checklist (Google Play, post-UI)

- [ ] Target API cap nhat theo Google Play requirement nam hien tai (verify len google.dev).
- [ ] Privacy policy URL (dat o trang web) + Data Safety form (khong thu thap data neu UI-only).
- [ ] Content rating: PEGI/ESRB theo loai ung dung.
- [ ] App icon 512x512 + feature graphic 1024x500.
- [ ] Screenshots it nhat 2 (phone), recommend 8.
- [ ] Short description (80) + full description (4000).
- [ ] Signing key qua EAS (uvm-built).
- [ ] Internal testing track truoc production.

KHONG tu dang ky Google Play / signing / tra phi trong giai doan UI.

## 10. Lien ket

- `feature-parity-matrix.md`: moi task lien ket parity ID.
- `acceptance-checklist.md`: kich ban verify moi phase.
- `integration-boundaries.md`: mock service → swap API.
