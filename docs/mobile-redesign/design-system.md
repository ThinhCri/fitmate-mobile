# Design System — Tokens & Components

> Tokens + component specification cho Fitmate Android, **light theme only** theo DEC-019 (Soft Energy).
>
> Token values suy ra tu nghien cứu Material 3 (general convention), MyFitnessPal, Strava, Hevy, Cronometer, Nike Training Club (nguon that, xem `design-research.md`). KHONG copy tu `src/index.css` cua web.

## 1. Huong visual da chot (Soft Energy — light-only)

User yeu cau 2026-09-17 chi chot light theme (xem `decisions.md` DEC-019). Vi the:

- **Mac dinh (chi 1 huong)**: Soft Energy — page bg `#FAFAF7` off-white warm, primary `#0F766E` deep teal, secondary `#7C2D12` warm sienna, tertiary `#9333EA` violet, error `#B91C1C`. 3-tier depth (page → card → container). Inter font.
- **Khong co dark theme** trong phase nay. Token names van theo M3 convention de co the them dark variant sau neu user yeu cau.

### Ly do chon Soft Energy

1. **Sang, gon, than thien, ca tinh fitness**: off-white warm `#FAFAF7` mem hon pure white, khong giong admin dashboard (user yeu cau tranh). Deep teal `#0F766E` gợi suc khoe/can bang (Cronometer-style tinh te).
2. **Doc tot so lieu + form dai**: onSurface `#1A1A1F` dat 16.6:1 tren page bg → text ro ret, khong chói khi doc profile/coach intake forms.
3. **Phan cap ro**: 3 tier depth (page → card → container) tao information hierarchy ro ret.
4. **Mau nhan tiet che**: primary teal chi dung cho CTA chinh (Bắt đầu, Lưu, Đặt lịch). Streak/achievement dung secondary sienna hoac tertiary violet → tranh canh tranh visual weight.
5. **Khong trang phang**: warm tone + multi-tier container + 1dp outlineVariant border tao depth ma khong shadow nang.
6. **Khong dashboard quan tri**: warm + mau nhan teal/sienna/violet → tap the thao/suc khoe (Cronometer, Nike, Strava deu theo huong nay).

Chi tiet 3 huong da xet va ly do loai trong `decisions.md` DEC-019.

## 2. Mau semantic (M3 color roles, light-only)

> Token names theo Material 3 roles. Map 1-1 voi M3 spec. **Chi co light values** trong phase nay.

| Token | Hex | Vai tro |
|---|---|---|
| `surface` (page bg) | `#FAFAF7` | Page background (off-white warm) |
| `surfaceContainerLowest` | `#FFFFFF` | Cards, sheets, modal |
| `surfaceContainerLow` | `#F4F2ED` | Subtle card variant |
| `surfaceContainer` | `#EEEBE4` | Sub-card / selected bg |
| `surfaceContainerHigh` | `#E5E2DA` | Strong hover bg |
| `surfaceContainerHighest` | `#DAD6CC` | Outline tint |
| `onSurface` | `#1A1A1F` | Body text |
| `onSurfaceVariant` | `#45474C` | Secondary text |
| `onSurfaceDisabled` | `#8E939B` | Disabled / hint |
| `outline` | `#7A7570` | Hairline |
| `outlineVariant` | `#D7D2CB` | Subtle border |
| `primary` | `#0F766E` | Brand CTA (deep teal) |
| `onPrimary` | `#FFFFFF` | Text on primary |
| `primaryContainer` | `#D5EFEB` | Filled chip / CTA ghost |
| `onPrimaryContainer` | `#0A3D38` | Text in primary container |
| `secondary` | `#7C2D12` | Streak / warm alt CTA |
| `onSecondary` | `#FFFFFF` | Text on secondary |
| `secondaryContainer` | `#FFE7D6` | Subtle warm bg |
| `onSecondaryContainer` | `#3A1606` | Text in secondary container |
| `tertiary` | `#9333EA` | Achievement / gamification |
| `onTertiary` | `#FFFFFF` | Text on tertiary |
| `tertiaryContainer` | `#F3E8FF` | Achievement bg |
| `onTertiaryContainer` | `#4A1A75` | Text in tertiary container |
| `error` | `#B91C1C` | Destructive |
| `onError` | `#FFFFFF` | Text on error |
| `errorContainer` | `#FEE2E2` | Error bg |
| `onErrorContainer` | `#5A0F0F` | Text in error container |
| `success` | `#15803D` | Success toast |
| `warning` | `#B45309` | Warning callout |
| `info` | `#1D4ED8` | Info pill |

### Contrast — verify per-pair khi implement

> **Luu y quan trong**: cac so contrast duoi day la **minh hoa** tu cung cap M3 color roles. Phai verify bang tool that (WebAIM contrast checker / Material Theme Builder / Android Studio accessibility inspector) khi implement. KHONG tuyen bo "toan app AAA"; chi ghi theo tung cap verify duoc.

Minh hoa contrast (WCAG 2.1 ratio tren nen tuong ung):

| Cap mau | Ratio | WCAG |
|---|---|---|
| `onSurface #1A1A1F` tren `surface #FAFAF7` | 16.6:1 | AAA |
| `onSurface #1A1A1F` tren `surfaceContainerLowest #FFFFFF` | 17.9:1 | AAA |
| `onSurface #1A1A1F` tren `surfaceContainerLow #F4F2ED` | 15.3:1 | AAA |
| `onSurface #1A1A1F` tren `surfaceContainer #EEEBE4` | 13.4:1 | AAA |
| `onSurfaceVariant #45474C` tren `surface #FAFAF7` | 8.8:1 | AAA |
| `onPrimary #FFFFFF` tren `primary #0F766E` | 5.8:1 | AA |
| `onPrimaryContainer #0A3D38` tren `primaryContainer #D5EFEB` | 12.4:1 | AAA |
| `onSecondary #FFFFFF` tren `secondary #7C2D12` | 8.4:1 | AAA |
| `onTertiary #FFFFFF` tren `tertiary #9333EA` | 6.0:1 | AA |
| `onError #FFFFFF` tren `error #B91C1C` | 6.5:1 | AAA |
| `outline #7A7570` tren `surface #FAFAF7` | 5.7:1 | AA |

Khi implement, can verify them:
- Tat ca icon button tren cac surface.
- Tat ca placeholder/disabled state.
- Toast (success/warning/error) tren backdrop.
- Bottom sheet, modal backdrop dim 35% (light theme nen dim nhe).

## 3. Typography

Inter family (display + headline + title + body + label) — Inter co day du Vietnamese glyph, owner by Rasmus Andersson, free. Bundle optional; neu khong bundle → system fallback chain.

| Token | Weight | Size/LineHeight | Su dung |
|---|---|---|---|
| `display.large` | 800 | 40/48 | Hero big number (today big stat) |
| `display.medium` | 700 | 32/40 | Section hero |
| `display.small` | 700 | 28/36 | Tab title |
| `headline.large` | 700 | 24/32 | Man hinh tieu de |
| `headline.medium` | 700 | 20/28 | Card title |
| `headline.small` | 600 | 18/26 | Subsections |
| `title.large` | 600 | 16/24 | List title |
| `title.medium` | 600 | 14/20 | Sheet title |
| `title.small` | 600 | 12/16 | Chip label |
| `body.large` | 400 | 16/24 | Body chinh |
| `body.medium` | 400 | 14/20 | Body phu |
| `body.small` | 400 | 12/16 | Caption |
| `label.large` | 600 | 14/20 | Button label |
| `label.medium` | 600 | 12/16 | Tab / chip |
| `label.small` | 500 | 11/14 | Badge / status |

**Ly do khong dung Outfit/Plus Jakarta Sans display font** (lua chon trend cua web cu): data-heavy app can body ro ret → Inter dat duty cho ca body + display + label de giam context switch, giam bundle size, dam bao Vietnamese glyph nhat quan.

## 4. Spacing scale

| Token | Value (dp) |
|---|---|
| `xxs` | 2 |
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `2xl` | 24 |
| `3xl` | 32 |
| `4xl` | 40 |
| `5xl` | 56 |
| `6xl` | 72 |

## 5. Radius

| Token | Value (dp) |
|---|---|
| `radius.xs` | 4 (chip nho) |
| `radius.sm` | 8 (input) |
| `radius.md` | 12 (button) |
| `radius.lg` | 16 (card) |
| `radius.xl` | 20 (sheet) |
| `radius.2xl` | 28 (modal) |
| `radius.full` | 9999 (pill) |

## 6. Elevation

Light theme nen shadow nhe + outline de ro edge:

| Token | Use | Equivalent |
|---|---|---|
| `elev.0` | Flat | none |
| `elev.1` | Card | `0 1px 2px rgba(20,20,28,0.08)` + 1dp outlineVariant border |
| `elev.2` | Sheet handle area | `0 2px 4px rgba(20,20,28,0.10)` |
| `elev.3` | Modal | `0 4px 8px rgba(20,20,28,0.12)` |
| `elev.4` | FAB | `0 6px 12px rgba(20,20,28,0.14)` |
| `elev.focus` | Focused input | `0 0 0 2px primaryContainer` (chat hon, khong glow hue) |

## 7. Icon

- Thu vien: `lucide-react-native` (lucide giong React Native port, API giong lucide-react).
- Style: stroke 2 default.
- Sizes: 16 (inline), 20 (list row), 24 (button), 28 (FAB).
- Color: inherit color hoac token `onSurface`, `onSurfaceVariant`.

## 8. Avatar / Image policy

- Avatar: tron 100x100dp default; fallback initials neu URL khong load.
- Avatar scheme placeholder: khong su dung lai URL Unsplash tu web (DEC-017). Su dung DiceBear API / Boring Avatars / generated initials voi accent bg theo vai tro.
- Post image: gradient/solid theo category (community / knowledge / achievement) — khong copy stock Unsplash.
- Cert image: placeholder-only (`image:null` neu user khong upload).
- Loading: shimmer 1.5s loop.
- Error: block mau surfaceContainerLow + icon ImageOff.

## 9. Touch target & accessibility

- Min touch 48x48dp (Material guideline).
- Tap area phai kha thi voi font scale 1.5x.
- Accessibility: moi icon button can `accessibilityLabel`; hinh anh can `accessibilityRole="image"` + label.
- Contrast: verified per-pair (xem bang Section 2).
- Color is never the only status signal (status pills always carry text).

## 10. Motion

- Tap: scale 95-97% 150ms.
- Modal entry: slide-up + fade 250ms.
- Bottom sheet: spring damping 20, stiffness 180.
- Streak badge pulse: 3s subtle scale + tone thay doi (khong glow ne vi light theme).
- Reaction pop: heart/flame/smile scale 1 → 1.3 → 1 (200ms).

## 11. Components spec — trang thai

### Button
- Variants: primary (filled teal `#0F766E`), secondary (filled surfaceContainerLow + outlineVariant 1dp), tertiary (text only), destructive (filled error).
- States: default, pressed (scale 0.97), loading (spinner thay label), disabled (label opacity 0.38).
- Icon: optional left/right.

### IconButton
- Circular touch target 48x48; icon 24.

### Input field
- Always-float label pattern (Material outlined).
- Border outline 1dp default → primary 2dp focus → error 2dp.
- States: default, focused, error (border error + helper text error), disabled (bg surfaceContainerLow + label onSurfaceDisabled).
- Types: text, email, password (with eye toggle), tel, date (native picker), time (native picker), number.
- Helper text + error text duoi input.

### Chip
- Variants: filter, suggestion, input.
- States: unselected (stroke outline, text onSurface), selected (bg primaryContainer, text onPrimaryContainer), disabled.
- Icon left optional.

### Card
- Variants: default (bg surfaceContainerLowest + outlineVariant 1dp), highlighted (stroke primary 1dp + bg surfaceContainerLowest), flat (no border, slight bg shift). Khong nested.

### Avatar
- Sizes: 32, 40, 56, 80, 100.
- Initials neu URL khong co.
- Role hue (member / PT / mentor) co the fade nhe o circle.

### Badge
- Variants: error, warning, info, success, neutral.
- Sizes: small, medium.
- Text required (khong chi icon).

### Segmented Button / Tabs
- 2-5 options; equal width; selected bg primaryContainer + text onPrimaryContainer.

### Bottom Navigation (5 tabs)
- Material 3 NavigationBar.
- Active indicator pill bg primaryContainer + icon + label.

### Modal (full-screen)
- Variant: sheet-style (drag handle optional) hoac basic.
- Backdrop dim 35% (light theme nen dim nhe hon dark).
- Status bar ton ong cover (edge-to-edge voi safe area).

### Bottom Sheet
- Snap points: medium (40%) + full (90%).
- Drag handle bat buoc.
- Backdrop dim 35%.

### Toast
- Top-positioned, slide-in 200ms, hold 3s, slide-out 200ms.
- Variants: success (icon Check), warning (icon AlertTriangle), error (icon XCircle), info (icon Info).
- Single line, dismissed on tap.

### Loading
- Variants: full-screen spinner, inline spinner (button), skeleton (card / list row).

### Empty state
- Icon 64dp + title + subtitle + optional CTA.

### Error state
- Icon + title + message + Retry button.

### Progress
- **Linear** (LinearProgressIndicator) cho protein/carb/fat.
- **Ring / Circular** cho calorie dashboard — giu dang ring, su dung primary deep teal, khong glow hue.
- Arc animate: 250ms ease-out.

## 12. Library mapping

| Need | Library (Android + Expo + M3 compatible) |
|---|---|
| Bottom tabs (5 tab) | Expo Router Tabs (native bottom tabs) |
| Stack / push | Expo Router Stack |
| Bottom sheet | `@gorhom/bottom-sheet` |
| Modal full-screen | Expo Router Stack presentation:"modal" |
| Icons | `lucide-react-native` |
| Form / input | React Native TextInput native + custom wrap |
| Date picker | `@react-native-community/datetimepicker` |
| Toast | `react-native-toast-message` |
| Progress ring | `react-native-svg` + `Animated` |
| Linear progress | `react-native-svg` hoac custom View width |
| Image picker | `expo-image-picker` |
| Gesture / animation | `react-native-reanimated` + `react-native-gesture-handler` |
| Storage | `@react-native-async-storage/async-storage` |
| Linking | RN built-in `Linking` |
| Avatar placeholder | DiceBear API + SDK client generator |
| Secure store (token) | `expo-secure-store` |

## 13. Han che cua phien planning

- Chua kiem tra contrast that tren emulator (verify bang tool khi implement).
- Token names co the dieu chinh khi ap vao RN de luu fluent native idioms.
- Library version: can verify khi init (Expo SDK 51+/52+ → API co the doi nho).
- Color roles M3 co the co them `inverseSurface`, `inverseOnSurface`, `inversePrimary` khi design pattern can (e.g., snackbar tren dark backdrop) → bo sung khi gap.
