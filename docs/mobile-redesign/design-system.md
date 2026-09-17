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
>
> Vai tro mau nhan (user chot 2026-09-17 lan 3):
> - **Primary teal `#0F766E`**: CTA chinh, focus ring, selected state, link. Khong thay the bang secondary/tertiary.
> - **Secondary sienna `#7C2D12`**: streak/achievement warm accent (icon streak, achievement badge). KHONG su dung lam CTA cạnh tranh voi primary.
> - **Tertiary violet `#9333EA`**: achievement / gamification (badge achievement ngu can, medal, level). CHI dung khi co nhu cau thuc te (FP-005 streak badge, achievement unlock, gamification point). Khong xuat hien mac dinh tren moi man.
> - **Surface tiers**: 5 cap depth (Lowest → Highest) de phan cap content + selected/hover/disabled.

| Token | Hex | Vai tro |
|---|---|---|
| `surface` (page bg) | `#FAFAF7` | Page background (off-white warm) |
| `surfaceContainerLowest` | `#FFFFFF` | Cards, sheets, modal body |
| `surfaceContainerLow` | `#F4F2ED` | Subtle card variant, list item hover light |
| `surfaceContainer` | `#EEEBE4` | Selected bg, segmented selected inner |
| `surfaceContainerHigh` | `#E5E2DA` | Strong hover bg, pressed state bg |
| `surfaceContainerHighest` | `#DAD6CC` | Divider tint, divider emphasis |
| `onSurface` | `#1A1A1F` | Body text |
| `onSurfaceVariant` | `#45474C` | Secondary text, helper text |
| `onSurfaceDisabled` | `#8E939B` | Disabled / hint (chi pass AA-large, chi dung cho placeholder+caption) |
| `outline` | `#5C5750` | Hairline / input border focus / divider |
| `outlineVariant` | `#858078` | Card border subtle 1dp |
| `scrim` (backdrop) | `#000000` 35% opacity | Modal + bottom sheet backdrop |
| `inverseSurface` (chua su dung) | `#1F1B16` | Snackbar tren light theme (Phase sau) |
| `inverseOnSurface` (chua su dung) | `#F4F0EA` | Text tren inverseSurface |
| `primary` | `#0F766E` | Brand CTA (deep teal) |
| `onPrimary` | `#FFFFFF` | Text/icon on primary filled |
| `primaryContainer` | `#D5EFEB` | Selected chip bg, focus ring inner, primary ghost button bg |
| `onPrimaryContainer` | `#0A3D38` | Text/icon in primary container |
| `secondary` | `#7C2D12` | Streak warm accent (icon streak, achievement warm hint). Khong su dung cho CTA chinh. |
| `onSecondary` | `#FFFFFF` | Text/icon on secondary filled (chi khi su dung filled, rat hiem) |
| `secondaryContainer` | `#FFE7D6` | Streak subtle bg, warm badge bg |
| `onSecondaryContainer` | `#3A1606` | Text/icon in secondary container |
| `tertiary` | `#9333EA` | Achievement / gamification (violet). CHI dung khi co nhu cau thuc te. |
| `onTertiary` | `#FFFFFF` | Text/icon on tertiary filled (rat hiem) |
| `tertiaryContainer` | `#F3E8FF` | Achievement bg, gamification subtle bg |
| `onTertiaryContainer` | `#4A1A75` | Text/icon in tertiary container |
| `error` | `#B91C1C` | Destructive, error border, invalid input |
| `onError` | `#FFFFFF` | Text/icon on error filled |
| `errorContainer` | `#FEE2E2` | Error bg, inline error hint bg |
| `onErrorContainer` | `#5A0F0F` | Text/icon in error container |
| `success` | `#15803D` | Success toast border + text, success badge |
| `warning` | `#B45309` | Warning callout border + text |
| `info` | `#1D4ED8` | Info pill text + border |

### Interaction roles (filled / selected / pressed / focused / disabled)

Su dung cac token tren voi pattern sau:

| Vai tro | Background | Foreground | Border |
|---|---|---|---|
| Button primary default | `primary` | `onPrimary` | none |
| Button primary pressed | `primary` 12% black overlay | `onPrimary` | none |
| Button primary disabled | `surfaceContainerLow` | `onSurfaceDisabled` | `outlineVariant` |
| Button primary focused | `primary` | `onPrimary` | `outline` 2dp outer ring |
| Button secondary default | `surfaceContainerLow` | `onSurface` | `outlineVariant` 1dp |
| Button secondary pressed | `surfaceContainerHigh` | `onSurface` | `outlineVariant` 1dp |
| Button secondary disabled | `surfaceContainerLow` | `onSurfaceDisabled` | `outlineVariant` |
| Button tertiary default | transparent | `primary` | none |
| Button tertiary pressed | `primaryContainer` | `onPrimaryContainer` | none |
| Button tertiary disabled | transparent | `onSurfaceDisabled` | none |
| Button destructive default | `error` | `onError` | none |
| Chip filter unselected | `surfaceContainerLowest` | `onSurfaceVariant` | `outlineVariant` 1dp |
| Chip filter selected | `primaryContainer` | `onPrimaryContainer` | none |
| Chip filter disabled | `surfaceContainerLowest` | `onSurfaceDisabled` | `outlineVariant` |
| Input default | `surfaceContainerLowest` | `onSurface` text, `onSurfaceVariant` label | `outline` 1dp |
| Input focused | `surfaceContainerLowest` | `onSurface` text, `primary` label | `primary` 2dp + `outline` 0dp |
| Input error | `surfaceContainerLowest` | `onSurface` text, `error` label | `error` 2dp |
| Input disabled | `surfaceContainerLow` | `onSurfaceDisabled` | `outlineVariant` |
| Card default | `surfaceContainerLowest` | `onSurface` | `outlineVariant` 1dp |
| Card highlighted | `surfaceContainerLowest` | `onSurface` | `primary` 1dp |
| Card selected | `surfaceContainer` | `onSurface` | `primary` 1dp |
| Tab segmented unselected | `surfaceContainerLowest` | `onSurfaceVariant` | `outlineVariant` 1dp |
| Tab segmented selected | `primaryContainer` | `onPrimaryContainer` | none |
| Bottom nav unselected | transparent | `onSurfaceVariant` | none |
| Bottom nav selected | `primaryContainer` (pill) | `onPrimaryContainer` | none |
| Switch off | `surfaceContainerHighest` | `outline` thumb | none |
| Switch on | `primary` | `onPrimary` thumb | none |
| Streak badge | `secondaryContainer` | `onSecondaryContainer` icon/text | none |
| Achievement badge | `tertiaryContainer` | `onTertiaryContainer` icon/text | none |
| Toast success | `success` 8% bg = `#E6F4EC` | `success` text/icon | `success` 1dp |
| Toast warning | `warning` 8% bg = `#FDF3E3` | `warning` text/icon | `warning` 1dp |
| Toast error | `errorContainer` | `onErrorContainer` text/icon | none |
| Toast info | `info` 8% bg = `#E6EDFB` | `info` text/icon | `info` 1dp |
| Modal backdrop | `scrim` 35% | — | — |
| Skeleton | `surfaceContainerLow` (animated 50% → `surfaceContainerHigh`) | — | — |
| Progress ring bg | `surfaceContainerHigh` | — | — |
| Progress ring fill | `primary` (default) / `secondary` (streak) | — | — |

> **Su dung secondary sienna**: chi khi can streak / warm achievement hint (FP-005 streak badge, "ngay tap lien tuc" so lieu). KHONG thay the primary cho CTA chinh.
>
> **Su dung tertiary violet**: chi khi co achievement gamification (FP-005 unlock, level up, badge earn). KHONG xuat hien mac dinh. Neu phase UI khong co gamification → KHONG dung tertiary.

### Contrast — verified per-pair WCAG 2.1

> **Cach verify**: dung cong thuc relative luminance (WCAG 2.1) + tinh ratio theo `(L1 + 0.05) / (L2 + 0.05)`. So lieu trong bang duoi la tinh toan that, khong phai minh hoa. Re-verify khi implement token file.

#### Text on backgrounds

| Cap mau | Ratio | WCAG | Su dung |
|---|---|---|---|
| `onSurface #1A1A1F` tren `surface #FAFAF7` | 16.58:1 | AAA | Body chinh |
| `onSurface #1A1A1F` tren `surfaceContainerLowest #FFFFFF` | 17.33:1 | AAA | Body card |
| `onSurface #1A1A1F` tren `surfaceContainerLow #F4F2ED` | 15.49:1 | AAA | Body subtle card |
| `onSurface #1A1A1F` tren `surfaceContainer #EEEBE4` | 14.56:1 | AAA | Body selected bg |
| `onSurface #1A1A1F` tren `surfaceContainerHigh #E5E2DA` | 13.39:1 | AAA | Body pressed bg |
| `onSurface #1A1A1F` tren `surfaceContainerHighest #DAD6CC` | 11.95:1 | AAA | Body emphasis |
| `onSurface #1A1A1F` tren `primaryContainer #D5EFEB` | 14.34:1 | AAA | Text in primary chip |
| `onSurface #1A1A1F` tren `secondaryContainer #FFE7D6` | 14.57:1 | AAA | Text in streak badge |
| `onSurface #1A1A1F` tren `tertiaryContainer #F3E8FF` | 14.69:1 | AAA | Text in achievement |
| `onSurface #1A1A1F` tren `errorContainer #FEE2E2` | 14.19:1 | AAA | Text in error bg |

#### Variant & disabled

| Cap mau | Ratio | WCAG | Su dung |
|---|---|---|---|
| `onSurfaceVariant #45474C` tren `surface #FAFAF7` | 8.89:1 | AAA | Secondary text |
| `onSurfaceVariant #45474C` tren `surfaceContainerLowest #FFFFFF` | 9.30:1 | AAA | Secondary text card |
| `onSurfaceVariant #45474C` tren `surfaceContainer #EEEBE4` | 7.81:1 | AAA | Secondary text selected |
| `onSurfaceVariant #45474C` tren `primaryContainer #D5EFEB` | 7.69:1 | AAA | Helper trong chip |
| `onSurfaceDisabled #8E939B` tren `surface #FAFAF7` | 2.95:1 | FAIL (chi AA-large/UI) | Disabled body, placeholder — chi dung cho caption + placeholder, KHONG dung cho button label |
| `onSurfaceDisabled #8E939B` tren `surfaceContainerLowest #FFFFFF` | 3.09:1 | AA-large/UI | Disabled caption card |

#### Primary CTA + containers

| Cap mau | Ratio | WCAG | Su dung |
|---|---|---|---|
| `onPrimary #FFFFFF` tren `primary #0F766E` | 5.47:1 | AA | Button label, FAB |
| `onPrimaryContainer #0A3D38` tren `primaryContainer #D5EFEB` | 10.00:1 | AAA | Chip label, ghost button label |
| `primary #0F766E` tren `surface #FAFAF7` | 5.23:1 | AA | Icon accent tren page |
| `primary #0F766E` tren `surfaceContainerLowest #FFFFFF` | 5.47:1 | AA | Icon accent tren card |
| `primary #0F766E` tren `primaryContainer #D5EFEB` | 4.53:1 | AA | Icon trong chip (chi AA, can test visual) |

#### Secondary (striker warm accent)

| Cap mau | Ratio | WCAG | Su dung |
|---|---|---|---|
| `onSecondary #FFFFFF` tren `secondary #7C2D12` | 9.37:1 | AAA | Neu filled (rat hiem) |
| `onSecondaryContainer #3A1606` tren `secondaryContainer #FFE7D6` | 13.61:1 | AAA | Streak badge text/icon |
| `secondary #7C2D12` tren `secondaryContainer #FFE7D6` | 7.88:1 | AAA | Icon accent streak |

#### Tertiary (achievement violet)

| Cap mau | Ratio | WCAG | Su dung |
|---|---|---|---|
| `onTertiary #FFFFFF` tren `tertiary #9333EA` | 5.38:1 | AA | Neu filled (rat hiem) |
| `onTertiaryContainer #4A1A75` tren `tertiaryContainer #F3E8FF` | 10.50:1 | AAA | Achievement badge |
| `tertiary #9333EA` tren `tertiaryContainer #F3E8FF` | 4.56:1 | AA | Icon accent achievement |

#### Error

| Cap mau | Ratio | WCAG | Su dung |
|---|---|---|---|
| `onError #FFFFFF` tren `error #B91C1C` | 6.47:1 | AA | Destructive button label |
| `onErrorContainer #5A0F0F` tren `errorContainer #FEE2E2` | 11.39:1 | AAA | Error toast text, inline error |

#### Status (success/warning/info)

| Cap mau | Ratio | WCAG | Su dung |
|---|---|---|---|
| `success #15803D` tren `surface #FAFAF7` | 4.80:1 | AA | Success badge text, toast text |
| `success #15803D` tren `surfaceContainerLowest #FFFFFF` | 5.02:1 | AA | Success badge tren card |
| `warning #B45309` tren `surface #FAFAF7` | 4.80:1 | AA | Warning text |
| `warning #B45309` tren `surfaceContainerLowest #FFFFFF` | 5.02:1 | AA | Warning text card |
| `info #1D4ED8` tren `surface #FAFAF7` | 6.41:1 | AA | Info pill text |
| `info #1D4ED8` tren `surfaceContainerLowest #FFFFFF` | 6.70:1 | AA | Info pill text card |

#### Outline / divider (UI element 3:1)

| Cap mau | Ratio | WCAG | Su dung |
|---|---|---|---|
| `outline #5C5750` tren `surface #FAFAF7` | 6.84:1 | AA-large/UI | Hairline, focus ring outer |
| `outline #5C5750` tren `surfaceContainerLowest #FFFFFF` | 7.16:1 | AAA UI | Input border focus |
| `outlineVariant #858078` tren `surface #FAFAF7` | 3.75:1 | AA-large/UI | Subtle border (chi pass UI 3:1) |
| `outlineVariant #858078` tren `surfaceContainerLowest #FFFFFF` | 3.92:1 | AA-large/UI | Card border subtle |
| `outlineVariant #858078` tren `surfaceContainerLow #F4F2ED` | 3.50:1 | AA-large/UI | Subtle container border |

### Pham vi WCAG ap dung

- **Body text** (label, paragraph, button label) can ≥ 4.5:1 (AA) hoặc ≥ 7:1 (AAA) neu kha thi.
- **Large text** (≥18pt hoặc 14pt bold) can ≥ 3:1 (AA-large).
- **UI element / icon / border** can ≥ 3:1 theo WCAG 2.1 SC 1.4.11.
- **Status color** (success/warning/info) chi pass AA → can kèm text/icon, khong dung mau don doc.

### Nhung cap CHUA dat AAA (ghi ro)

- `onPrimary #FFFFFF` tren `primary #0F766E`: 5.47:1 — chi AA. Button label 14sp-16sp bold dat yeu cau AA. Neu can AAA → phai dark primary (mat brand identity).
- `onTertiary #FFFFFF` tren `tertiary #9333EA`: 5.38:1 — chi AA. Nen su dung `tertiaryContainer`/`onTertiaryContainer` de dat AAA khi xuat hien tren UI.
- `primary #0F766E` tren `primaryContainer #D5EFEB`: 4.53:1 — chi AA. Icon trong chip can test visual that.
- `success/warning` tren surface: 4.80:1 — chi AA. Nen kèm text + icon.
- `onSurfaceDisabled #8E939B`: chi pass UI/large. CHI dung cho placeholder + caption, KHONG dung cho button label quan trọng. Button disabled label phai giam opacity thay vi doi mau.

### Khong ap dung tren UI

- `tertiary #9333EA` filled + `onTertiary #FFFFFF` text → chi AA, rat hien thi. Nen dung `tertiaryContainer`.
- `inverseSurface` / `inverseOnSurface` → chua su dung (chua co snackbar/light dark snackbar). Phase sau.
- Dynamic color (Material You): KHONG dung, brand consistency quan trọng hon personalization.

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
