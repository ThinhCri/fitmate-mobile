# Cursor Rules — Noi dung de AI implement tao file .mdc

> Plan mode khong cho tao file `.mdc` (Cursor rule). File nay ghi noi dung 4 rule, AI trien khai se copy thanh file `.mdc` tai `.cursor/rules/` theo ten tuong ung.

Khi chay "Trien khai theo ke hoach" (MOB-001..), can tao 4 file sau trong `.cursor/rules/`:

1. `.cursor/rules/preserve-content.mdc`
2. `.cursor/rules/mobile-design-system.mdc`
3. `.cursor/rules/android-implementation.mdc`
4. `.cursor/rules/delivery-workflow.mdc`

Noi dung ben duoi da san sang copy.

---

## 1. `.cursor/rules/preserve-content.mdc`

```
---
description: Preserve FitMate content, fields, actions, and existing flows when migrating the web frontend to Android. Never silently drop or hide content for visual cleanup. Apply to docs and mobile work.
globs:
  - mobile/**
  - docs/mobile-redesign/**
  - src/**
---

# Rule: Preserve FitMate Content

This rule applies whenever you touch code, docs, UI, or migrations for the FitMate Android project. Read docs/mobile-redesign/feature-parity-matrix.md (parity IDs FP-XXX) and docs/mobile-redesign/current-app-audit.md (inventory of the web frontend).

## Hard requirements (must not be violated)

1. Do not drop a field, screen, action, or role that exists in the web frontend during the Android migration.
2. Do not replace an actual field or content with a placeholder, lorem ipsum, or TBD.
3. Do not merge distinct business concepts (e.g. member vs PT, notifications vs friend requests) into one block just to fit a tighter layout.
4. Do not silently change calculations, validation, or display conditions. If you find a discrepancy, log it in docs/mobile-redesign/tasks.md with the pre-existing-bug tag and consult docs/mobile-redesign/decisions.md before changing it.
5. Preserve Vietnamese content, meaning, and units of measurement (cm, kg, kcal, Thứ 2, etc.).
6. Do not turn a working action into a decorative button. If a button shipped in web, it must do something meaningful in Android.
7. Do not present mocked functionality as production. Knowledge-post reward simulation, AI vision, AI chat are not real services — surface that fact in UI copy.
8. Do not hide important information behind obscure menu paths or collapsed sections without leaving an obvious entry point.

## Allowed (design flexibility)

- Change colors, icons, fonts, spacing, and component shapes (consistent with docs/mobile-redesign/design-system.md).
- Group fields differently; reorder sections; combine cards if the meaning is preserved.
- Replace modals with dedicated screens or bottom sheets when justified.
- Use tabs, accordions, or progressive disclosure only if every required field/control is reachable in two or fewer taps from the screen primary entry point.
- Add loading, retry, toast feedback, and accessibility labels that augment (not replace) the original behavior.

## Out of scope features

- Never self-implement new business features the user did not ask for. Record ideas in docs/mobile-redesign/tasks.md under Backlog (out-of-scope) instead.

## Encountering a bug from the web

1. Note it in docs/mobile-redesign/tasks.md with the tag pre-existing-bug plus the source file:line evidence.
2. Decide explicitly whether to fix in the Android port via docs/mobile-redesign/decisions.md.
3. Do not change silently. If unsure, leave the original behavior and add a comment in the Android code referencing the audit note.

## Sources of truth

- docs/mobile-redesign/feature-parity-matrix.md for what must exist.
- docs/mobile-redesign/current-app-audit.md for what the web actually has today (line numbers).
- docs/mobile-redesign/decisions.md for the most recent ruling on boundary cases.

If you find yourself wanting to skip a field or action because it clutters the layout, stop. Either fix the layout or surface the question back to the user via the AskQuestion tool with concrete options.
```

---

## 2. `.cursor/rules/mobile-design-system.mdc`

```
---
description: Mobile design system rules for FitMate Android UI (React Native + Expo). Apply when touching mobile theme, components, screens, or visual tokens. Read design-system.md before changing visuals.
globs:
  - mobile/**
  - docs/mobile-redesign/design-system.md
  - docs/mobile-redesign/design-research.md
  - docs/mobile-redesign/screen-specs.md
---

# Rule: Mobile Design System

This rule enforces the visual direction, tokens, and component rules for FitMate Android. The full token list lives in docs/mobile-redesign/design-system.md.

## Visual direction (mandatory)

- Theme: Glow Sport (dark charcoal background, neon green primary, orange warning, gold reward). See DEC-002 in docs/mobile-redesign/decisions.md.
- Dynamic color (Material You): disabled. The brand color must stay consistent across devices.
- Dark theme is the default and only theme for this stage. Do not build a light theme yet.

## Token usage

- Use only the semantic tokens defined in design-system.md (background, surface, text, border, accent, danger, success).
- Do not hardcode hex colors inline. If a new color is needed, propose a token in design-system.md first and document the rationale.
- Use the typography scale tokens (display.*, title.*, body.*, label.*). Vietnamese font support must be guaranteed (bundle Outfit + Inter, or fallback to system with Inter-equivalent fallback).
- Spacing must use the spacing scale (xxs to 5xl). Do not introduce ad-hoc spacing values.
- Radius must use the radius scale (xs to full).
- Touch targets must be at least 48x48dp.

## Component rules

- Button: variants primary (main action), secondary, orange (destructive/warning). All buttons must support loading, disabled, and icon props.
- Input: use Input primitive. Validation messages live below the input, never in a tooltip. Error state uses red border plus helper text (do not rely on color alone).
- Chip / Filter: Material 3-style FilterChip for category filters. Selected state uses primary bg plus dark text.
- Card: variants default, highlight-green, highlight-orange, glass. Avoid nested cards (card inside card). Flatten.
- Avatar: sizes 32, 40, 56, 80, 100. Default 56. Initials fallback when no URL or image load fails.
- Bottom Sheet: use for all flows that are not full-screen forms (booking, replace meal, allergy, medical). Include a drag handle. Snap points medium (40%) plus full (90%).
- Toast: top-positioned, slide-in 200ms, hold 3s, slide-out 200ms. Variants success, warning, error.
- Modal: full-screen only when the content genuinely needs the full screen (CreatePost, Register). Always provide a Close button. Hardware back must also close.

## Iconography

- Library: lucide-react-native. Stroke width 2 by default.
- Sizes: 16 inline, 20 list, 24 button, 28 FAB.
- Color: inherit text or use accent tokens.

## Loading, empty, error

- Loading: Skeleton for cards/posts, Spinner for full screen, inline spinner inside buttons when action takes more than 300ms.
- Empty: icon 64dp plus title plus subtitle plus optional CTA. Use the same iconography across screens for consistency.
- Error: icon plus title plus message plus Retry button. Retry must trigger the same action without restarting the whole flow.

## Accessibility

- Every icon-only button needs an accessibilityLabel.
- Every image needs an accessibilityRole image plus a descriptive label.
- Color is never the only signal (status pills always carry text).
- Verify contrast: text primary on bg-dark >= 15:1; secondary >= 7:1.

## Motion

- Tap: scale to 95-97% for 150ms.
- Modal entry: slide-up plus fade 250ms.
- Bottom sheet: spring damping 20, stiffness 180.
- Streak card glow: 3s loop.

## Things you must NOT do

- Do not use gradients on body text.
- Do not nest shadows (shadow on top of shadow).
- Do not stack glass cards inside glass cards.
- Do not use color as the only status indicator.
- Do not introduce a new theme variant in this stage.
- Do not introduce a new component library that overlaps with an existing one (pick one for tabs, one for sheets, one for modals).

## When uncertain

- Read docs/mobile-redesign/design-system.md first.
- If the spec is missing, propose the smallest extension that fits the existing scale.
- Record any visual decision in docs/mobile-redesign/decisions.md and link it from this rule.
```

---

## 3. `.cursor/rules/android-implementation.mdc`

```
---
description: Android + React Native + Expo implementation rules for FitMate. Apply when writing mobile code, configuring native packages, or running Android builds.
globs:
  - mobile/**
  - docs/mobile-redesign/android-migration-plan.md
  - docs/mobile-redesign/integration-boundaries.md
---

# Rule: Android Implementation

This rule constrains how the FitMate Android app is implemented with React Native, Expo, and TypeScript.

## Tech baseline (locked by DEC-001, DEC-010)

- Stack: React Native + Expo + TypeScript. Do not introduce Flutter, Kotlin, Swift, Capacitor, or Ionic.
- Navigation: @react-navigation/native + @react-navigation/native-stack + @react-navigation/bottom-tabs.
- Sheets: @gorhom/bottom-sheet.
- Icons: lucide-react-native. Stroke width 2.
- Storage: @react-native-async-storage/async-storage wrapped by a StorageAdapter interface.
- Gestures/Animation: react-native-reanimated + react-native-gesture-handler.
- SVG/Vector: react-native-svg (for ring progress, icons).
- Date/Time: @react-native-community/datetimepicker (native).
- Toast: react-native-toast-message.
- Image picker: expo-image-picker.

## Project layout

- All mobile code lives under mobile/. The web folder (src/) is the baseline and must not be modified.
- mobile/src/theme/ for tokens and ThemeProvider.
- mobile/src/components/ui/ for primitives (Button, Card, Chip, Input, Avatar, Toast, BottomSheet).
- mobile/src/features/<feature>/ for screens grouped by domain.
- mobile/src/services/ for service interfaces and adapters (mock and real).
- mobile/src/mocks/ for fixtures (default users, posts, certificates).
- mobile/src/utils/ for pure helpers (BMI calculator, calorie math, time formatters, toxic filter).
- mobile/src/navigation/ for navigators and linking config.

## TypeScript

- Strict mode on (tsconfig strict: true).
- Every screen exports its props type and reuses the service types.
- No `any` unless absolutely necessary; if used, add a comment explaining why.

## Service pattern (see integration-boundaries.md)

- Define a service interface per domain (AuthService, UserService, FriendService, ...).
- Implement a MockAdapter that uses AsyncStorage + local fixtures + cross-user localDb.
- UI consumes only the interface via dependency injection or context.
- RealApiAdapter comes later — do not pre-design abstractions beyond what is needed.

## Mocking rules

- All data must come from fixtures in mobile/src/mocks/. Hardcoded fixtures are OK in this phase.
- Determinism: do not inject random delays/errors in flows shown to the user. Mocked AI responses must be reproducible.
- AI vision (Nutrition scan) returns one of the predefined mock dishes after a 1500ms delay — never more than 3s.
- AI chat returns one of the canned replies after a 1200ms delay.
- Knowledge-post reward simulation runs every 4s on the same logic as web (App.jsx lines 1018-1070).

## No production API calls

- Do not fetch localhost:8080 or any external service in this phase.
- All endpoints documented in integration-boundaries.md are MOCKED locally. Real endpoints are out of scope.

## Permissions

- Image picker (camera/library): request on demand; if user denies, show fallback to pick from library or skip.
- Push notifications: not implemented. Do not request POST_NOTIFICATIONS.
- Storage permission: not needed (AsyncStorage is app-sandboxed).

## Android-specific behavior

- Safe area: use react-native-safe-area-context on every screen.
- Status bar: dark icons on dark background. Configure globally in app/_layout.
- Hardware back: handled by native-stack + bottom-tabs automatically. For sheets, use the sheet library hook.
- Font scaling: must work up to 1.5x without clipping. Verify in MOB-200.
- Min touch target: 48x48dp. Verify in MOB-200.

## Anti-patterns

- Do not use inline styles for tokens. Always reference the theme.
- Do not read AsyncStorage directly from a component. Always go through a service or storage helper.
- Do not place business logic in screens. Extract to utils or services.
- Do not import web modules from src/ into mobile/. The two codebases are separate.

## Verification before declaring a task DONE

- Type-check passes (npm run type-check).
- Lint passes (npm run lint).
- Acceptance criteria in docs/mobile-redesign/acceptance-checklist.md for the relevant phase PASS.
- Visual regression: at least one screenshot on Android emulator.
- Task is updated in docs/mobile-redesign/tasks.md (status, commit link, notes).
- Local commit created per delivery-workflow.mdc.

## Release

- Out of scope for this phase: do not run EAS production build, do not upload to Google Play, do not register a Play Console account.
- Release prep lives in Phase 7 (MOB-300..303) and is not started until explicitly requested.
```

---

## 4. `.cursor/rules/delivery-workflow.mdc`

```
---
description: Delivery workflow for FitMate Android UI migration. Apply to every task that touches mobile code or docs. Read handoff.md and tasks.md before starting.
globs:
  - mobile/**
  - docs/mobile-redesign/**
---

# Rule: Delivery Workflow

This rule defines how AI agents pick up, execute, and hand off FitMate Android migration tasks.

## Before any change

1. Read AGENTS.md (project root).
2. Read docs/mobile-redesign/handoff.md to know the current state.
3. Read docs/mobile-redesign/tasks.md and find the next TODO or IN_PROGRESS task (lowest MOB-XXX ID that matches the requested phase).
4. Read docs/mobile-redesign/decisions.md for the latest rulings.
5. For the chosen task, read the parity IDs in docs/mobile-redesign/feature-parity-matrix.md and acceptance criteria in docs/mobile-redesign/acceptance-checklist.md.
6. Run git status and git log --oneline -10. If working tree has unexpected changes, ask the user before proceeding.

## Status transitions

- TODO -> IN_PROGRESS: when you actually start the task. Update docs/mobile-redesign/tasks.md first.
- IN_PROGRESS -> DONE: only after every acceptance case for the task PASSES. Do not mark DONE on partial completion.
- IN_PROGRESS -> BLOCKED: when an unresolvable issue blocks progress. Record blocker in tasks.md (cause, attempts, next step).
- DONE -> (re-open) -> IN_PROGRESS: when a regression is found later.

## Commit cycle

After every meaningful chunk of work:

1. Run git status. Confirm the changes are only yours.
2. Run git diff and review the scope (no unintended files).
3. Update task status, parity matrix entries, and any spec touched.
4. Stage only the files you intended (git add <path1> <path2>). Never use git add . mechanically.
5. Commit with a Conventional Commits message that includes the task ID:
   - docs(plan): <description> [MOB-XXX]
   - feat(<scope>): <description> [MOB-XXX]
   - fix(<scope>): <description> [MOB-XXX]
   - chore(<scope>): <description> [MOB-XXX]
6. Run git log -1 to confirm the commit exists and the tree is clean.
7. Do NOT include the commit hash inside the commit message itself (avoid loops). Reference the task ID instead. Hashes can be added to docs in the NEXT commit.
8. Do NOT push, merge, amend, rebase, reset --hard, or rewrite history.

## Commit hygiene

- One purpose per commit. If a chunk contains unrelated changes, split it or use multiple commits.
- Never commit secrets, API keys, or personal data. Demo auth must use user@fitmate.vn / pt@fitmate.vn only.
- Never commit pre-existing untracked changes from another AI or the user without explicit confirmation.
- Never commit empty changes.
- If a hook or pre-commit check fails, fix the issue. Do not bypass.

## Forbidden git operations

- git push (any remote).
- git merge (any branch).
- git rebase (interactive or otherwise).
- git reset --hard or git reset --soft with intent to rewrite.
- git commit --amend of a previous commit.
- git filter-branch, git filter-repo.
- Force push equivalents.

If the user explicitly asks for any of the above, confirm the intent before doing it.

## Handoff at end of session

- Update docs/mobile-redesign/handoff.md with:
  - Current objective.
  - Git branch and last commit hash.
  - Tasks completed / in-progress / blocked.
  - Uncommitted changes (and origin if known).
  - Verification commands that PASSED and those that did NOT run.
  - Next concrete step (MOB-XXX, file, action).
  - Any constraints the next AI must respect.
- If interrupted mid-task, mark the task as IN_PROGRESS with notes about how to resume. Do not delete work.

## When in doubt

- Prefer asking the user via the AskQuestion tool with concrete options rather than guessing.
- Group real questions into a single round; avoid back-and-forth.
- If the question is whether to break a rule in this file, the answer is no — instead record a decision in docs/mobile-redesign/decisions.md and proceed.
