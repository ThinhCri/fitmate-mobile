# Design System — Tokens & Components

> Tokens va component decision cho ban Android. Moi gia tri trong file nay la **quyet dinh** cho migration, co the sua khi co them bang chung nhung phai ghi lai trong `decisions.md`.

## 1. Two visual directions (de xuat)

### Huong A — Glow Sport (giong web hien tai)

- **Ca tinh**: gamified, neon, nang dong; cam xanh glow.
- **Mau chinh**: `--accent-green` (#39FF14) lam primary, `--accent-orange` (#FF5722) lam warning/streak.
- **Background**: dark charcoal #0C0F12 + glass card rgba.
- **Typography**: Outfit (display) + Inter (body).
- **Loi**: gan voi ban web → de giu parity. Nhung co the "nhuc mat" neu user bat dark theme + light background.

### Huong B — Calm Material (Material 3 dark)

- **Ca tinh**: premium, de doc, on dinh; primary tone amber/warm.
- **Mau chinh**: warm primary (#FFB74D) + secondary teal (#26A69A) + tertiary purple (#9575CD).
- **Background**: surface (#0F1419) + surface variants subtle gray.
- **Typography**: Roboto Flex + Inter (body) — hoac chi Roboto.
- **Loi**: giong Material 3 mac dinh; it lien ket voi brand cu.

## 2. Quyet dinh: chon huong A (Glow Sport)

- **Ly do**: thiet ke web da duoc design quan tam (co file `fitmate_figma_prompt.txt`), user/thanh vien co the da identify voi brand; giu nhat quan giup khong cat lien ket thuong hieu.
- **He qua**: di kem vs Material 3 → can implement custom color roles (khong dung dynamic color).
- **Quyet dinh cu bi thay the**: (khong co — lan dau chon huong).

### Mau semantic cho A (token names)

| Token | Hex | Role |
|---|---|---|
| `--bg-dark` | #0C0F12 | Page background |
| `--bg-surface` | #161C22 | Card/sheet background |
| `--bg-surface-variant` | rgba(255,255,255,0.04) | Subtle elevation |
| `--border-subtle` | rgba(255,255,255,0.08) | Hairline |
| `--border-strong` | rgba(255,255,255,0.16) | Elevated border |
| `--text-primary` | #FFFFFF | Main copy |
| `--text-secondary` | #90A4AE | Label / subtitle |
| `--text-tertiary` | #607D8B | Hint / disabled |
| `--accent-primary` | #39FF14 | Primary CTA (recorded as `var(--accent-green)`) |
| `--accent-primary-press` | #1ECC0D | Primary pressed |
| `--accent-primary-bg` | rgba(57,255,20,0.12) | Hover/bg |
| `--accent-orange` | #FF5722 | Streak / warning |
| `--accent-orange-bg` | rgba(255,87,34,0.12) | Warning bg |
| `--accent-gold` | #FFD700 | Reward/trophy |
| `--accent-blue` | #2F80ED | Verified PT / link |
| `--accent-blue-bg` | rgba(47,128,237,0.12) | Verified bg |
| `--accent-pink` | #FF3B30 | Love reaction |
| `--accent-pink-bg` | rgba(255,59,48,0.12) | Love bg |
| `--accent-yellow` | #FFB300 | Pending cert |
| `--accent-yellow-bg` | rgba(255,179,0,0.15) | Pending bg |
| `--danger` | #EB5757 | Error |
| `--success` | #39FF14 (re-use primary) | Success |

## 3. Typography

| Token | Font | Size/Weight | Su dung |
|---|---|---|---|
| `display.large` | Outfit 800 | 32/40 | Banner hero |
| `display.medium` | Outfit 700 | 28/36 | Man hinh lon |
| `title.large` | Outfit 700 | 22/28 | Header card |
| `title.medium` | Outfit 700 | 18/24 | Section title |
| `title.small` | Outfit 600 | 16/22 | Sub-section |
| `body.large` | Inter 400 | 16/24 | Body chinh |
| `body.medium` | Inter 400 | 14/20 | Body phu |
| `body.small` | Inter 400 | 12/16 | Caption |
| `label.large` | Inter 600 | 14/20 | Button label |
| `label.medium` | Inter 600 | 12/16 | Tab/Chip |
| `label.small` | Inter 500 | 11/16 | Badge |

**Yeu cau font**: tieng Viet day du (Inter full Vietnamese subset). Tai `assets/fonts/` luc build. Neu khong muon bundle font, dung system default — nhung kem nhat quan brand.

## 4. Spacing scale

| Token | Value |
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

## 5. Radius scale

| Token | Value |
|---|---|
| `radius.xs` | 4 (small chip) |
| `radius.sm` | 8 (button) |
| `radius.md` | 12 (input) |
| `radius.lg` | 16 (card) |
| `radius.xl` | 24 (sheet/modal) |
| `radius.full` | 9999 (FAB, pill) |

## 6. Elevation

| Token | Use | CSS-like |
|---|---|---|
| `elev.0` | Flat | none |
| `elev.1` | Card hover | 0 1px 3px rgba(0,0,0,0.3) |
| `elev.2` | Sheet | 0 4px 12px rgba(0,0,0,0.4) |
| `elev.3` | Modal | 0 8px 24px rgba(0,0,0,0.5) |
| `elev.glow-green` | Active CTA / streak | 0 0 24px rgba(57,255,20,0.25) |
| `elev.glow-orange` | Streak incomplete | 0 0 24px rgba(255,87,34,0.25) |

## 7. Icon

- **Thu vien**: lucide-react-native (API giong lucide-react).
- **Size**: 16 (inline), 20 (list), 24 (button), 28 (FAB).
- **Stroke**: 2.
- **Color**: inherit text color hoac `--accent-*`.

## 8. Avatar / Image policy

- Avatar: tron 100x100dp; fallback initials neu khong co URL.
- Post image: tile 16:9 crop; cover gradient khi loading.
- Cert image: giua khoi, ti le 4:3.
- Loading state: shimmer (Animated.View opacity loop).
- Error state: khoi mau secondary + icon ImageOff.

## 9. Touch target & accessibility

- Min touch: 48x48dp (Material guideline).
- Tap area phai kha thi voi font scale 1.5x.
- Accessibility: moi icon button can `accessibilityLabel`; hinh anh can `accessibilityRole="image"` + label.
- Contrast: text primary trên bg-dark = 15+:1; secondary = 7+:1.

## 10. Motion

- Tap: 95-97% scale, 150ms.
- Modal entry: slide-up + fade 250ms.
- Bottom sheet entry: spring damping 20, stiffness 180.
- Toast: slide-in top 200ms, hold 3s, slide-out 200ms.
- Pulsing streak card: 3s loop.

## 11. Components spec — trang thai

Liet ke trang thai cho moi component de khong bi bo qua khi implement.

### Button (Primary)
- States: default, pressed, loading (spinner trai label), disabled.
- Bao gom icon left/right optional.

### Button (Secondary/Ghost)
- transparent bg, border subtle, text primary.

### Button (Destructive/Orange)
- giong Primary nhung mau accent-orange (width optional CTA).

### Input field
- States: default, focused (border primary + accent-primary-bg glow), error (border danger), disabled.
- Types: text, email, password, tel, date, time, number.
- Helper text + error text duoi input.

### Chip (filter)
- States: unselected (bg surface-variant), selected (bg accent-primary + dark text), disabled.
- Icon left optional.

### Card
- Variants: default (surface), highlight-green (left border primary), highlight-orange (left border orange), glass (backdrop blur).

### Avatar
- Variants: image, initials (neu khong co URL + optional role color).
- Sizes: 32, 40, 56, 80, 100.

### Badge
- Variants: green/orange/gold/blue/red.
- Sizes: small, medium.

### Tab / segmented button
- 2-n option, equal width, fill-color on selected.

### Bottom Navigation (5 tabs)
- Active indicator: pill bg + accent-green icon + label.

### Modal
- Full-screen sheet-style; drag handle optional.
- Backdrop dim 80% black.

### Bottom Sheet
- Snap points: medium (40%) + full (90%); drag handle bat buoc.

### Toast
- 1 line, top position, auto dismiss.
- Variants: success (green), warning (orange), error (red).

### Loading
- Variants: spinner (full screen), inline spinner (button), skeleton (card).

### Empty state
- Icon lơn 64dp + title + subtitle + CTA optional.

### Error state
- Icon + title + message + retry button.

### Progress
- Ring (calorie) — cai nay giu giong web vi la signature.
- Linear — protein/carb/fat.

## 12. Library mapping (de xuat)

| Need | Thu vien |
|---|---|
| Bottom tabs | `@react-navigation/bottom-tabs` (cho de migrate bottom-nav hien tai) |
| Bottom sheet | `@gorhom/bottom-sheet` |
| Modals full-screen | `react-native-modal` hoac tu build voi `Animated` |
| Icons | `lucide-react-native` |
| Form / input | `react-native` TextInput native + custom wrap |
| Calendar | `react-native-calendars` |
| Toast | `react-native-toast-message` hoac custom |
| Progress (ring) | `react-native-svg` + `Animated` |
| Image picker | `expo-image-picker` |
| Gesture / animation | `react-native-reanimated` + `react-native-gesture-handler` |
| Storage | `@react-native-async-storage/async-storage` |
| Linking | RN built-in `Linking` |
| Date picker | `@react-native-community/datetimepicker` (native) |

## 13. Font bundle (plan)

- Neu bundle: tao `assets/fonts/` → dat Outfit-Regular.ttf, Outfit-Bold.ttf, Outfit-ExtraBold.ttf, Inter-Regular.ttf, Inter-Bold.ttf; expo-font config.
- Neu khong bundle: dung system font + che mat `display.*` tokens → chi dung fonts system.

Quyet dinh se ghi trong `decisions.md` luc bundle theme.

## 14. Khoi tao va verify

- Doc `acceptance-checklist.md` cho nhung case font/contrast.
- AI moi cap nhat placeholder neu Material 3 spec doi.
