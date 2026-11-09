# Handoff — Ban giao hien tai

## 2026-10-28 — R2 artwork parity and durable plan media references
- Source-only owner instruction remains active; no app/server/build/test/deploy commands. Outgoing plan media_url now normalizes shared catalog images to storage:// identity instead of persisting temporary signatures. Backend normalizes old-client writes and signs plan artwork freshly on reads, including legacy expired catalog URLs. Real API adapter remains active; private media untouched.
- BE Compose VPS forced-local override fixed to honor STORAGE_BACKEND from .env. Original local env/runtime use R2; key is server-side, never AAB. No object deletion/re-upload performed or required by the source fix. Actual R2 object availability still needs manual UAT.
- Contract hash updated for media_url behavior documentation only; tests/source updated to cover stable writes and private URLs. Prior 239/239/type-check success does not verify this new media delta. No automatic setup scripts recreated; original user build scripts/assets remain untouched.
- Illustration caches shared catalog by stable URL path and tries one fresh-URL retrieval per resource on load error, then leaves explicit retry/error rather than looping or blank frames. Private-media cache identity retains its signature. This is normal in-app image recovery, not an app/server auto-launch script.
- Manual environment parity checklist: sibling FitmateAI_BE/docs/backend-release/runbooks/r2-mobile-parity.md. Local API host/port may differ from production; do not clone DB/JWT settings wholesale between environments.

## 2026-10-28 — Preserve loaded screens and roll back automatic setup
- Current owner instruction: source fixes only; do not start app/emulator/Metro/backend, install, build or run tests automatically. Removed the newly added start-android-test.ps1 and temporary ignored mobile .env.local; original .env retained. Dedicated backend test stack/scripts/config also removed by BE cleanup; original keys/data unaffected. Do not recreate automatic launch tooling.
- Workout/nutrition tabs no longer replace loaded content on focus. Dashboard focus refresh is silent rather than showing pull-to-refresh spinner. Social and workout retain content with a notice if background refresh fails. PT overview retains loaded data on focus; tab state remounts on account ID change. Removed the repeated global “Đang đồng bộ dữ liệu...” label; first loads still show skeleton/loading normally. Plans become usable before secondary metadata completes.
- ExerciseIllustration uses expo-image memory/disk caching. Correction after owner clarification: existing backend actually uses R2 (confirmed runtime env); absence of local files does not prove missing images. Local importer/runbook addition removed. Diagnose actual signed R2 URLs/expiry/403/404 before concluding missing assets. No fake images or runtime mock fallback.
- Prior to the source-only instruction, npm ci completed, type-check passed and 239/239 tests passed after pinning reviewed contract SHA and correcting test-only nullable/password assertions. Latest small loading change has static review only. No successful new Android installation/AAB/deploy/Play upload confirmed; user will run local manually.

## 2026-10-27 — Bound real workout plan and session inputs
- Owner approved 1–10 sets, 1–100 reps, 1–600 timed seconds, 0–600 rest seconds; confirm >6 sets, >50 reps, >300 seconds. These are product limits, not exercise prescriptions. Shared validators guard editor, API payload and starting legacy plans. No silent clamping.
- Active session now starts actual reps blank per set, shows target separately with explicit target shortcut, validates completion and scales rep text on one line. Missing results remain skipped rather than inheriting targets. Real plan/session API calls preserved; backend enforces corresponding bounds including actual results.
- Added numeric boundary source tests; no mobile install/test/typecheck/build per manual-only rule. Backend tests are recorded in BE handoff; device/DB UAT and deployment still pending.

## 2026-10-27 — Complete real provider and profile wiring (device UAT pending)
- Added native Firebase messaging 26.4.0 + config plugin, disabled auto-init until permission/session, real FCM token registration/refresh/revoke and safe inbox navigation. Preserved GA4 analytics consent flags. npm ci/native rebuild required; Expo Go cannot supply the added native module. No dependency installation or mobile commands executed under manual-only rules.
- Added real workout suggestions form/API and replaced ai-adjust placeholder route; shared server chat quota disclosed, no auto-save. Backend Gemini food scan and image-chat routing now implemented; keys/flags and provider test still required.
- Profile counts/badges now come from server summary; completed workout count hidden for other users. Booking review fetches actual booking and PT instead of bk-2/route guesses; rating requires explicit selection. Unknown booking status/duration rejected; unavailable totals stay null. Deleted unreferenced camera/avatar prototype presenters and unreleased gift teaser; active camera/upload flows remain API-backed.
- Added source tests for push ownership, booking wire integrity and runtime import boundaries; not run/typechecked/built. Backend unit 1,048 passed, integration project compile succeeded; isolated PostgreSQL execution pending. Owner authorized local commits, no push/deploy/build/Play upload.
- Key and UAT instructions: sibling FitmateAI_BE/docs/backend-release/provider-setup-and-real-tests-20261027.md. Earlier "not implemented" profile/push notes below are history. Preserve unrelated untracked feature-graphic assets/build-release.ps1.

## 2026-10-26 — Connect public profile posts and exact account totals
- Public profile fetches real author-filtered social feed, passes opaque cursor for next pages, retries errors and rejects servers returning other authors. Avatar renders actual URL; total visible posts becomes known only when paging completes. Focus/route generations prevent late responses overwriting another profile. Backend must be updated before this client.
- Account hub sums per-status server totals (pageSize 1), supports more than 100 appointments without truncation; any count failure remains unavailable, not zero. Added profile-post API and hub-count source tests. No mobile tests/typecheck/build under manual-execution instructions.
- Revenue now displays server `refund_adjustment_vnd` as trainer-share refund adjustment; older server missing the additive field stays explicitly unavailable. No frontend-derived financial amount. Backend exact-wire integration assertion updated; database execution pending.
- Backend full unit 1029 passed including later monetary delta; integration project compiled before monetary delta, PostgreSQL tests pending (local port closed). Social Friends feed privacy leak fixed; cursor now precise and legacy-compatible. Updated backend release allowlist but old uploaded source archive must be prepared again. No push/deploy/Play upload.

## 2026-10-26 — Remove fabricated runtime statistics and connect PT lists
- Added real server-paged PT sessions route, actionable pending-booking/service tasks, verified-profile lookup, focus refresh/retry guards. Revenue now has real pagination/period selection and exact settlement status; paid and pending amounts come from server, refunds are not fabricated from arithmetic.
- Trainer missing price/experience stays null; malformed ratings/prices fail visibly instead of defaulting to five stars/free. Account hub no longer turns request failures into zero counts. Removed three invented public-profile earned badges and fake counters; unavailable profile posts are explicitly identified. These missing author-feed/public aggregate/badge APIs remain open work, not completed features.
- Source tests added for trainer wire integrity; not executed, and no typecheck/build/Expo under manual-execution rule. Owner authorized local commits; no push/deploy/Play upload. Preserve unrelated feature-graphic PNGs and legacy build-release.ps1.
- Settlement status mapper also rejects unsupported states (including `unpaid`/`partially_paid`) rather than labeling them pending or paid; added source regression cases, not executed.
- Durable cross-role inventory and remaining provider keys: sibling `FitmateAI_BE/docs/backend-release/role-api-runtime-audit-20261026.md`. Backend updater still pending operator run; do not claim latest OTP runtime deployed or all providers working.

## 2026-10-26 — Audit remaining live-function gaps before next build
- Owner requested exhaustive missing-key/readiness review and completion work. Backend readiness report is at ../FitmateAI_BE/docs/backend-release/mobile-update-audit-20261026.md (workspace sibling). New capabilities cache expires after 60s rather than indefinitely retaining outdated module gates; settings always reports the actual light-only interface, not raw server theme preference. These two mobile follow-ups are static-reviewed only, not tested/built in this turn.
- VPS source lacks additional admin deletion/profile/cert fixes and migration files; staged operator rollout performs backup + isolated/migration preview before API replacement. Backend full unit suite 1,021 passed. It is NOT deployed yet. Do not ship new Android build until OTP server rollout and email/success/logout UAT pass. No extra SMTP key needed for deletion.
- Push is not delivered merely by enabling OS permission: real FCM/Expo provider/native token lifecycle remains absent. Bank lookup, Google Meet, payOS and Play Billing require owner credentials/approval; optional Gemini/R2 are not mandatory for existing Groq/local-storage choices. Do not enable paid/financial/artifact-dependent features or claim completion without that evidence. No commit/push/mobile build/Play upload in this audit.

## 2026-10-25 — Prepare committed closed-test update 0.1.1 (2)
- Owner requested add/commit and build/Play instructions. Prepare expo.version 0.1.1/android.versionCode 2 and matching ignored native Gradle values; secure release script now checks both match before requesting password. Highest Play upload must still be 1; otherwise choose a higher unused code. Same upload key/package, no signing reset or prebuild --clean.
- Commit latest settings permission/status + OTP failure/logout work, prior Vietnamese labels and reviewed Android R8/icon build fixes in scoped units. Preserve unrelated payout copy, store artwork and legacy unsigned/unreviewed build helper. See closed-testing-update.md for commands, paths, release notes and mandatory runtime checks.
- No build/test/typecheck/install/Play upload/push/VPS rollout in this turn. Earlier R8 unsigned verification and old unit/type-check results do not verify the newest shared-provider/permission/OTP changes. VPS OTP route is still absent (404); operator-approved backend deployment and DB/email/device UAT must precede tester rollout. Do not claim a new AAB was created.

## 2026-10-25 — Live permission status and deletion OTP failure clarity (IMPLEMENTED_UNVERIFIED)
- Settings reads Android 33+ POST_NOTIFICATIONS permission and camera permission without prompting, on focus and AppState active. Shows small green enabled / red disabled text plus external icon in a reserved right slot. Read failures and unsupported notification checks (Android <33/iOS) remain unknown, not falsely enabled. No claim about delivery/provider readiness or individual notification channel settings.
- OTP input and confirmation remain visible but disabled until a successful send; failed send shows inline error. Repository explains missing backend route (404/405) and validates response expiry. Explicit OTP error-code translations added. Only a successful verified deletion request signs out via AuthContext/session cleanup and redirects to login; failure does not sign out. Account-switch/unmount guards prevent a late response logging out another account.
- Read-only VPS inspection found no deletion-otp route in deployed controller source; anonymous POST https://api.fitmate.site/api/v1/users/me/deletion-otp returned 404. No email/deletion sent. This explains an unavailable operation, not proof of the user's exact 500 without its trace. Backend OTP commit exists locally but is NOT deployed; operator approval and isolated DB tests/SMTP UAT are required before rollout.
- Wrote four permission-reader tests; manual-execution workflow: no test/build/typecheck/commit/push/deploy in this follow-up. Operator checks: settings resume updates colors/text; OTP send -> email -> enter code -> confirm -> logout; wrong/expired/missing route does not log out. Do not claim completed end-to-end deletion until server rollout and UAT.

## 2026-10-25 — Reserve external-action indicator outside text flow (IMPLEMENTED_UNVERIFIED)
- Owner runtime screenshot still lacks notification external indicator although both permission rows have the icon in source. Reserve 36dp right padding on external rows and position the 24dp indicator within that reserved area, vertically centered relative to natural row height. Long text cannot consume or move its slot; entire row remains the action target. Applied consistently to notification/camera/privacy/terms.
- Device verification still required; no claim that source inspection explains the exact native rendering failure. No build/test/commit/push performed.

## 2026-10-25 — Distinguish navigation from external settings (IMPLEMENTED_UNVERIFIED)
- Owner clarified that right chevrons mean another in-app screen. Notification/camera OS-settings entries and privacy/terms external URLs now use ExternalLink, in a fixed non-shrinking trailing slot. Notification copy explicitly names phone settings. Keep chevrons for change-password/deletion-OTP navigation; cancel-deletion action has no navigation chevron.
- No test/build/runtime/commit/push in this follow-up. Verify trailing external indicators at 360dp/font1.5 on device; actual OS navigation remains subject to platform support.

## 2026-10-25 — Correct settings permission row overflow (IMPLEMENTED_UNVERIFIED)
- Owner screenshot showed notification description pushing the chevron to the card edge. Bound rowLeft/description with flex:1 and minWidth:0, added row gap and shrinkable Vietnamese text, preserved natural row height and font scaling; descriptions use readable secondary color without the external theme-note margin.
- Removed the redundant account/security email explanatory row at owner request. Both notification and camera actions now open real OS app settings via Linking.openSettings with failure guidance. Previously camera permission action silently returned if permission was already granted; camera capture flows elsewhere retain their existing permission prompts.
- Static source review only for this follow-up; no device/runtime verification or new test/build/commit/push. Check at 360dp/font1.5: chevrons remain inside card, descriptions wrap, both actions open Fitmate app settings, Android back returns correctly. This verifies neither notification delivery nor camera hardware by itself.

## 2026-10-25 — Email OTP deletion and truthful settings controls
- Added account/deletion-otp: user explicitly requests account-email code, six-digit input, resend countdown and expiry, busy guard, keyboard-safe layout, confirm submits OTP to backend. No deletion request is created by sending a code. Copy accurately describes admin review rather than an immediate 30-day deletion clock.
- Removed personal-data export action from Settings, merged duplicate notification controls into one OS-settings entry and replaced ineffective email toggle with explanatory security-email text. No claim of fixed duplicate delivery without actual reproduction.
- Backend enforcement includes legacy DELETE alias, not just UI. Backend and new app must be rolled out together; no production rollout, version bump or Play upload in this task. TypeScript and targeted ESLint checked; physical-device OTP/SMTP and keyboard checks remain required.

## 2026-10-25 — Preserve Vietnamese consent/registration labels (IMPLEMENTED_RUNTIME_PENDING)
- Owner screenshot shows Đồng ý rendered as Đồng and reports intermittent Đăng ký truncation. Source strings were intact; label sizing used shrink-wrapped centered text with fixed typography line heights; registration header/CTA also had fixed container heights.
- Consent actions now have balanced wrapping flex widths and full-width centered labels with Android font padding and natural line height. Registration header reserves remaining width for its centered title; header/CTAs use minHeight + padding, and CTA text receives available width rather than intrinsic rounded measurement. Kept font scaling and full Vietnamese labels; no ellipsis or reduced accessibility font scale.
- Focused consent/password tests: 10/10 passed. TypeScript passed; targeted ESLint on consent dialog/registration passed with no output/errors; diff check passed. Visual confirmation still requires owner reload and checks at normal/font1.5 on Android. No native resource change in this label fix, so Metro reload is sufficient. No version bump/build/commit/push/Play upload.

## 2026-10-25 — Repair Android masked brand glyph (GEOMETRY_VERIFIED_DEVICE_PENDING)
- Owner's system-launch screenshot shows the F stem clipped against the circular icon mask. Existing native foreground bounds (30..81, 26..86) exceeded Android's central safe circle and were off-center. Preserved the original path; applied uniform 0.8 scale about (54,54) with (-1.2,-1.6) translation, centering bounds at (54,54) with every vertex inside radius 33. No stretching, redesign, raster/image generation or Play/in-app master logo changes.
- Patched current ignored native vector/normal+round launcher XML and added an explicit teal vector background. Tracked withAndroidBrandIcon Expo plugin/app.json emits the same resources on future prebuilds. Both normal/round/monochrome share safe geometry; native rebuild required, Metro refresh cannot update it. Removed README reference to a missing raster-export script.
- Focused geometry + analytics-config checks: 5/5 passed; diff check passed. No Android rebuild/screenshot verification yet for this change, no commit/push/version/Play upload. The earlier unsigned verification AAB predates the icon correction. Ask owner to rebuild debug from the existing PowerShell with npm run android, then cold-launch and capture the system splash/launcher.

## 2026-10-25 — R8 verification bundle built and inspected (BUILD_VERIFIED_DEVICE_PENDING)
- Owner explicitly authorized build/test while deferring version bump/Play publication. Full Vitest: 197/197 passed; corrected comments-renderer typing then reran its 4 focused tests successfully. Final TypeScript passed. Full lint passed with 0 errors / 131 warnings after fixing the new Settings callback dependency mismatch. Static diff check passed. No broad warning cleanup.
- Upload signing environment absent; adb reported no connected devices. Used scripts/verify-android-release.init.gradle to create a distinct unsigned verification variant initialized from release, without bypassing/changing release signing. Quoted both dotted Gradle -P arguments: unquoted PowerShell splitting had injected an android property and caused the first attempt's misleading Firebase android() failure. No Firebase dependency patch/upgrade was needed.
- :app:bundleVerification succeeded in 15m23s, 733 tasks (123 executed). Artifact mobile/android/app/build/outputs/bundle/verification/app-verification.aab is 74,783,072 bytes and has 0 signature entries: NOT a Play upload or installable signed-device build. Existing versionCode 1 / versionName 0.1.0 unchanged; old app-release.aab preserved.
- ZIP inspection: embedded proguard.map and r8.json present; compiler R8 8.12.14; obfuscation/optimization/shrinking flags true, compatibility/debug modes false. Uncompressed DEX: old release 48.10 MiB -> verification 11.61 MiB. Metadata reports noObfuscationPercentage=18.11, noOptimizationPercentage=18.63, noShrinkingPercentage=18.01; preserve raw stats, do not substitute a predicted Play approval for the next official bundle's score. Local mapping.txt 116,465,777 bytes, configuration/seeds/usage/resources reports present.
- Compiled release Expo constants show firebaseAnalyticsEnabled=true; merged verification manifest has no AD_ID permission and firebase_analytics_collection_enabled=false (opt-in remains required). R8 warned about stack-map tables in play-services-auth 21.5.0 but did not fail; signed runtime auth/Firebase/workout/comments/media/IAP checks remain mandatory. No connected-device UI/inference test performed.
- No version bump, Play upload, commit or push during this build/test turn. Owner will finish remaining fixes before the final signed release. Keep verification output separate and retain exact matching R8 mapping. See android-release-optimization.md for commands and context.

## 2026-10-25 — Enable Android release R8 optimization (IMPLEMENTED_UNVERIFIED)
- Owner deferred AI response testing and requested fixing the Play DEX 1% warning. Current ignored Android checkout had no minify/shrink properties and used non-optimizing proguard-android.txt. Enabled both release flags and proguard-android-optimize.txt locally; tracked Expo plugin/app.json makes the correction durable across prebuilds without adding packages or disturbing signing/keep rules.
- Secure build script now enforces optimization flags/default file and checks generated/embedded R8 mapping; absent r8.json warns for review. Debug builds remain unchanged. See [decision, official references and rollout checks](android-release-optimization.md).
- Added 3 unit cases; NOT RUN — user will execute `npm test -- src/services/__tests__/releaseOptimization.test.ts`, `npm run type-check`, `npm run lint` from mobile/. Static diff check passed. No build, prebuild, version change, commit, push or Play upload. Native android/ edits are gitignored, not a new tracked Android project. Do not claim threshold compliance before inspecting the new AAB and Play's score or release functionality without signed-device UAT.

## 2026-10-25 — Comments composer safe-area repair (IMPLEMENTED_UNVERIFIED)
- Owner's physical Android screenshot shows the comment input/send control underneath the three-button system navigation bar. CommentsSheet had no modal-local safe-area handling and applied keyboard avoidance only to its fixed-height sheet.
- Added SafeAreaProvider inside the native Modal and bottom/left/right SafeAreaView around the entire sheet. KeyboardAvoidingView now owns the available modal viewport, keeping composer outside the scrolling list and above the keyboard/system inset. Send/close controls have 48dp targets and accessible labels. Shared component covers Community and Saved Posts. No API/comment data behavior changed.
- Added a structural render regression test for modal-local insets, Android keyboard avoidance and composer placement. NOT RUN — user will execute: from mobile/, `npm test -- src/features/community/__tests__/CommentsSheet.test.tsx`; `npm run type-check`; `npm run lint`. Real-device checks required with three-button/gesture navigation and keyboard open/closed. No build/Play release requested; do not claim current installed app is fixed.
- Owner authorized add/commit of related local mobile work, not push. Existing artwork assets and legacy build-release.ps1 are outside this fix and must not be swept into commits. Other repos' pending changes are not staged here.
- Related local commits now recorded: eba5e9e analytics/settings, 06ea280 workout/media, 547b257 password guidance. This entry accompanies the separate comments fix commit. PT payout copy is retained as a separate pending change because its matching backend gate removal is not deployed; no claim that the whole workspace is clean.

## 2026-10-25 — Android analytics consent onboarding and settings recovery (IMPLEMENTED_UNVERIFIED)
- Owner reported an unresponsive settings/analytics control and requested a post-login consent prompt. Settings previously waited for both settings and deletion status with Promise.all; failure left a permanent spinner. They now load independently, with back/retry and an API-independent analytics preference during loading/error. Account deletion remains guarded until its status is known. Actual old-AAB navigation behavior has not been reproduced on a device.
- AnalyticsTracker asks once per account/install on the authenticated dashboard after the existing permission-onboarding promise. Centered scrollable native modal includes explicit agree/refuse and close/hardware-back as refusal. Either decision persists; explicit refusal is not repeatedly prompted. Collection remains off before agreement; no ads consent or health/chat/name/email event payloads. Removed the misleading fully-anonymous label because the SDK uses app-instance/device metadata. See [consent decision](analytics-consent.md).
- Root cause candidate for a disabled switch: app.config.js previously enabled its JS gate only when FITMATE_FIREBASE_ANDROID_FILE was set, even though a standard gitignored mobile/google-services.json exists locally. It now recognizes that standard file too; explicit missing overrides fail. Secure release script refuses a missing Firebase config. No native provider config contents were printed or committed. The currently published AAB still needs inspection/runtime confirmation; local config alone does not prove its contents.
- Consent service serializes native changes, fails closed on missing SDK, remembers refusal separately from no choice, and no longer resets app-instance identity on every cold start. Account switch/logout still disables/reset data as before.
- Added 7 consent/privacy/lifecycle unit cases and 3 config cases. NOT RUN — user will execute per repository workflow. Commands from mobile/: `npm run type-check`; `npm test -- src/services/__tests__/analytics.test.ts src/services/__tests__/analyticsConfig.test.ts`; `npm run lint`. `git diff --check` passed before documentation update. Device QA required: fresh login prompt once, deny/no events, settings enable/events, revoke/no new screens, cold restart, account switch, API-error retry/back, 360dp/font1.5.
- No build, Play upload, version bump, deployment, commit or push. Owner deferred mobile release until the next grouped update. Previously deployed GA4 split only changes Admin/API reporting and cannot enable SDK collection on existing installed apps.

## 2026-10-25 — Repair workout rest countdown/media and clarify password guidance
- Rest input now keeps a text draft so clearing it does not inject 30 seconds and concatenate digits. Zero is preserved. Save validates integer 0..600 seconds; the backend/OpenAPI enforce the same range. Active sessions normalize invalid legacy rest values to 45 seconds with a notice, bound restored countdowns to the current phase and keep timer text on one line. Zero-rest transitions react to phase changes. Decision rationale: [workout rest correction](workout-rest-correction.md); legacy decisions.md has invalid UTF-8 and was preserved.
- Workout catalog/plan media now use the shared device URL resolver, including relative URLs and loopback-to-device API origin rewriting while preserving signatures. Catalog matching also supports exact English names/slugs. Active images show loading/failure/retry; retry fetches fresh catalog media rather than reusing only an expired signed URL. No substitute illustration or fake data was added.
- Registration now explains the 12..128-character + digit acceptance rule and four-part strength hint. Too-short passwords cannot be rated fairly strong. Client digit validation matches existing server Identity configuration; no server password policy changed.
- Verification: mobile TypeScript, 14 focused tests and full 183/183 tests passed; backend WorkoutService 25 tests passed. Updated contract-baseline.json after reviewing the pending OpenAPI delta (rest bound, additive GA4 fields and removed payout SMS response); pins 57b6cea+worktree, not a release/deployed API. Device/image HTTP behavior has not been verified: SSH currently returns Permission denied (publickey), and owner was asked to load the key. No production deployment, signed APK/AAB build, commit or push performed for these changes. Existing payout/AD_ID/graphics/build-script edits preserved.

## 2026-10-23 — PT bank-account notice without SMS
- Updated payout-account notice to describe bank selection, account entry and provider lookup; removed SMS prerequisite wording in coordination with backend. Bank lookup remains required. No signed mobile build or deployment performed; existing unrelated working changes preserved.
- Follow-up audit: language/theme settings are display-only; PT availability toggle is unsupported; account hub/settings initialization need better error/retry states; payout-account entry is currently behind successful revenue loading. Profile editing, health profile and account settings use real API adapters, not blanket mock implementations.

## 2026-10-21 — PT contact phone instead of SMS during closed test (IMPLEMENTED_UNVERIFIED)
- PT onboarding phone route now saves a self-entered contact number via profile API, warns it is not SMS-verified, and returns to certificate review. Certificate banner points to contact entry instead of SMS OTP. Backend approval requires verified email and entered phone; admin reviews manually.
- Existing owner edits were preserved. No mobile lint/typecheck/test/build was run under the repository manual-execution rule; user must run these and test the emulator before release.

## 2026-10-20 — Mobile CI and onboarding documentation (IMPLEMENTED_UNVERIFIED)
- Replaced stale root/mobile READMEs, removed demo credentials from onboarding, and added source-only GitHub Actions checks for typecheck, lint and unit tests.
- Kept the existing owner edits to `mobile/package.json` and untracked `mobile/build-release.ps1` out of this change. No mobile command or device build was run under the repository manual-execution rule; GitHub workflow result remains pending.

## 2026-10-20 — Minimize mobile error logs (IMPLEMENTED_UNVERIFIED)

- Removed raw exception objects and arbitrary storage keys from production-path `console.warn` calls in auth/session, storage and account hub. Logs retain only a fixed failure label; API behavior is unchanged.
- Static audit found PT revenue demo fixtures and calculations referenced only by unit tests, not by runtime screens. They were retained as test fixtures rather than silently deleting test coverage. Existing owner changes in `mobile/package.json` and `mobile/build-release.ps1` remain untouched. No mobile commands/device QA were run under the repository manual-execution rule.

## 2026-10-20 — Fail closed on secure token storage errors (IMPLEMENTED_UNVERIFIED)

- Refresh-token writes and credential deletion no longer swallow secure-store errors. Access tokens are exposed in memory only after the refresh-token write completes; clearing the session attempts every credential deletion and reports a failure if any deletion fails. Added source tests for failed write/delete paths.
- Mobile tests and Android runtime were not run under the manual-execution rule. In particular, a device-level forced secure-storage failure and server-side logout/revocation still need UAT; the client cannot guarantee local erasure if the OS secure store itself refuses deletion.
- Follow-up static review found an account-switch window retaining the previous in-memory access token. Session setup now clears the old token immediately and clears prior secure credentials before writing the next refresh token; a storage failure aborts the switch. Added a source test for this path.

## 2026-10-20 — Isolate retired PT revenue demo code (IMPLEMENTED_UNVERIFIED)

- Moved the unreferenced client-side PT revenue calculations and their synthetic data into `__tests__/`; the only remaining imports are from the revenue unit test. Production revenue continues to come from the Backend service, not these calculations.
- Static import search passed; mobile tests/build remain unrun under the manual-execution rule.

## 2026-10-19 — Unified Fitmate brand mark (IMPLEMENTED_UNVERIFIED)

- Added one-color vector F-forward mark, Google Play 512px icon, Expo/app 1024px icon, and Android adaptive PNG variants. Native launcher/splash resources were refreshed locally but `mobile/android/` is gitignored; a fresh checkout must regenerate its native project from `app.json`. The mobile auth mark now uses the same path and teal `#0F766E`.
- Admin web favicon, sidebar, login and public legal page headers use the same logo geometry. Web build, type-check and lint passed locally; mobile build/device validation remains for the operator per AGENTS.md.
- Existing user changes to `mobile/package.json` and `mobile/build-release.ps1` were preserved. Trademark similarity has not been legally cleared.

## 2026-10-19 — Auth visual refresh (IMPLEMENTED_UNVERIFIED)

- Simplified welcome, login and registration presentation around a small code-drawn Fitmate mark. Authentication and registration API behavior was not changed.
- Removed unverifiable member/medical claims from welcome. Replaced the dashboard's decorative orbs and watermark with a subtle static gradient.
- Added short entrance motion with Android reduce-motion support. Existing local changes in `mobile/package.json` and `mobile/build-release.ps1` were not touched.
- Static review only. Per repository instructions, the agent did not run type-check, lint, tests, Expo or Android build. Device review is still needed, especially at 360dp width, large text and keyboard open.

## 2026-10-11 — Luong tai khoan nhan tien va lich su chi PT

- PT co the mo `Doanh thu -> Tai khoan nhan tien`, chon ngan hang, nhap so tai khoan va luu sau khi Backend tra ve ten chu tai khoan da xac minh.
- Chi tiet khoan chi dung du lieu revenue that: so tien, trang thai, ma giao dich, thoi gian chuyen va tai khoan da che; da bo du lieu ngan hang/mã chi gia.
- Mobile khong tu xac minh ten tai khoan va khong giu provider secret. Can Backend cau hinh VietQR Lookup, PT da xac minh so dien thoai va migration payout da apply.
- Verification: `npm run type-check` PASS; Vitest 208/208 PASS sau khi cap nhat OpenAPI baseline. Can nghiem thu API/provider that tren thiet bi sau khi operator them secret.

## Muc tieu hien tai

**Hoan thanh refactor + features/ + FP-001, FP-017..020, FP-024, FP-025, Settings, ImagePickerService, 4 Cursor rule .mdc** theo yeu cau user ngay 2026-09-18 (sau batch 4 fix, review toan bo docs). Trang thai: IMPLEMENTED (code done), can runtime verification (npm install + tsc + emulator) de set DONE theo AGENTS.md.

## Branch & checkpoint Git

- Branch: `main`.
- Working tree: clean truoc khi refactor Batch 5.
- Commit gan nhat sau Batch 6 (fixes + FP-018):
  - `4b6b374 feat(mobile): FP-018 AI Thich ung workout swap (BMI + medical + tag scoring) [MOB-112]`
  - `e3389f0 fix(mobile): 62 TS errors -> 0 (UI components, AuthContext, services, types) [MOB-115]`
  - `615225b build(mobile): fix lucide/svg/screens versions to actual SDK 57 pins [MOB-101]`

## Trang thai task (sau Batch 5 refactor 2026-09-18)

> **Luu y quan trong**: Tat ca task MOB-001..135 da IMPLEMENTED (code done) sau Batch 5 refactor + features/. KHONG phai DONE that su.
> **Batch 6 (2026-09-18 10:30)**: Da fix toan bo 62 TypeScript errors -> **tsc --noEmit = 0 errors**. Da them package-lock.json (npm install SDK 57 compatible).
> Da them FP-018 (AI Thich ung workout swap).
> Can runtime verification: `cd mobile && npm install`, `npx tsc --noEmit` ✅, `npx expo start` emulator + WebAIM contrast tool.
> Sau verify PASS, moi set DONE theo AGENTS.md rule "khong danh dau DONE khi thieu kiem chung".
> Audit day du (FP-001..040): xem `docs/mobile-redesign/audit-mobile-vs-docs.md` Section 12 (Batch 5) + 13 (Batch 6).

> **Batch 7 (2026-09-18 14:00)** — Sua layout Dinh duong + Exercise model time/reps + sessionEngine deadline-based + WorkoutSessionScreen TTS audio + checkpoint + history idempotent + 13 vitest unit tests.
> - MOB-401 sua layout Nutrition Scan (`flex:1, minWidth` wrap, BottomSheet portion/meal wrap, snap 70%, paddingBottom 32).
> - MOB-402 model `Exercise` them `type:'reps'|'time'`, `reps?`, `durationSec?`, `restSec`, `notes`, `mediaUrl`, `mediaType`, `mediaSource`, `tags`. Plank → `time, durationSec:45`. Push-up co video Pixabay CC0.
> - MOB-403 `sessionEngine.ts` pure state machine: prepare → exercise → rest → finished. Deadline-based, pause luu `prevStatus`, resume giu dung thoi gian, tick chi chuyen state 1 lan.
> - MOB-404 `WorkoutSessionScreen` modal: status badge + timer/reps + controls + AppState pause + hardware back confirm + audio cue expo-speech.
> - MOB-405 `sessionStorage.ts` checkpoint AsyncStorage + `buildSessionSummary` + idempotent `markHistorySaved`.
> - MOB-406 13 vitest PASS (`npm test`).
> - `npx tsc --noEmit` PASS (0 errors).
> - Commits local: `45afadb` MOB-401 → `b1e782d` MOB-402/403/406 → `bb5d18c` MOB-404/405.

### Batch 8 (2026-09-18 19:00) — Safe Area + PT Revenue [MOB-407..412]

- MOB-407 fix bottom nav safe area: `useSafeAreaInsets()` cho gesture bar Android. Commit `0db5895`.
- MOB-408 PT revenue model: `BookingForPT`, `RefundEvent`, `RevenueKPI`, `RevenueHistoryItem`, `RevenueChartPoint`, fee calculations, `computeRevenueKPI/Chart/History`, Asia timezone handling. 33 vitest PASS. Commit `76fff41`.
- MOB-409 PT revenue screen overview: KPI + chart + history + filters + search. Commit `164b57d`.
- MOB-410 PT revenue detail: booking details + timeline + revenue breakdown. Commit `164b57d`.
- MOB-411 Menu entry: `BarChart3` icon in drawer, `user.profile.isPt` guard. Commit `50bf653`.
- MOB-412 BarChart SVG component (khong dependency moi). Commit `164b57d`.
- 2 PT demo accounts: `pt@fitmate.vn` (11 bookings) + `ptlong@fitmate.vn` (3 bookings).
- Fixture cases: completed, paid pending, unpaid, discount, cancelled refund, partial refund, multi-refund, cross-month refund, pending/failed refund.
- Chinh sach: phi 10%, ghi nhan theo completedAt, nhieu lan hoan tinh phi con lai, khong double-count.
- `npx tsc --noEmit` PASS (0 errors). `npm test` 46/46 PASS.
- **MOB-001..005**: IMPLEMENTED code done → can `npm install` + emulator.
- **MOB-002b** (BottomSheet): IMPLEMENTED code done.
- **MOB-101..118**: IMPLEMENTED code done cho 5 tabs + Drawer + Notifications + Social + Messenger + Appointments + Nutrition.
- **MOB-119..135**: IMPLEMENTED code done cho Login/Register/Profile/Edit/Certificates/Withdraw/VIP/Support/Search/CreatePost/ChuyenSau.
- **MOB-200..202**: TODO (Phase 6 pre-scale verification — can chay MOB-001..135 that su truoc).

### Cac FP da hoan thanh code (Batch 1..5)

- F-1.2 BottomSheet primitive (Batch 1)
- FP-014 Nutrition scan logic (Batch 1)
- FP-015 Plan 7 ngay + skip (Batch 1)
- FP-022 Appointments calendar grid + day modal + role filter + actions (Batch 1)
- FP-009 Reactions toggle heart/flame/smile (Batch 2)
- FP-010 Reward simulation 4s interval (Batch 2)
- FP-011 AI Companion chat list + 1200ms typing + title edit + delete (Batch 2)
- FP-013, FP-037 5 seed posts + cross-user store (Batch 2)
- FP-008 CreatePost image + link + 15-char knowledge validation (Batch 2)
- FP-029 Messenger list + 1500ms auto-reply (Batch 3)
- FP-006 Search mentor category (Batch 4)
- FP-027 ChuyenSau view/edit + custom text allergy + dynamic time slots (Batch 4)
- FP-028 Certificates fullscreen/self/admin (Batch 4)
- FP-030 Register 2-step validation (Batch 4)
- FP-031 Withdraw voucher 4 + form (Batch 4)
- FP-032 VIP 2 plan (Batch 4)
- FP-033 Support mailto (Batch 4)
- **FP-001** Streak onPress +1 connect Dashboard (Batch 5)
- **FP-017/018/020** Workout + RestTimer + MedicalSurvey + workoutHistory (Batch 5)
- **FP-019** Medical survey component (Batch 5)
- **FP-024** AvatarPicker 6 preset + reset + upload (Batch 5)
- **FP-025** FriendButton 4 state (Batch 5)
- **FP-003 hint** Settings screen (Batch 5)

### Batch 5 refactor theo AGENTS.md
- Tao `mobile/src/features/{social,profile,auth,workout}/` (PostCard, CommentSection, FriendButton, AvatarPicker, StepIndicator, WorkoutItem, RestTimer, MedicalSurvey + index.ts).
- Social screen: xoa inline PostCard + CommentSection, import tu features/.
- Profile modal: xoa inline friend action, thay bang `<FriendButton/>`.
- Drawer them "Cài đặt" → `/settings`.

### Cursor rules (.mdc)
- Tao 4 file `.cursor/rules/*.mdc`: preserve-content, mobile-design-system, android-implementation, delivery-workflow. (AGENTS.md yeu cau.)

### Con thieu (uu tien)
1. FP-017 drag-drop reorder library (react-native-draggable-flatlist).
2. FP-018 AI adaptive swap (prompt input + swap logic).
3. FP-021 time slot value check (09:00/10:30/14:00/16:30/19:00/20:30).
4. Runtime verify: `npm install` / `tsc --noEmit` / `expo start` emulator / WebAIM contrast per-pair.

## Next concrete step (sau Batch 5)

User se chay:
```bash
cd mobile
npm install
npx tsc --noEmit        # should be 0 errors
npx expo start          # emulator
```
Sau do verify tung FP-001..040 PASS theo `acceptance-checklist.md`. Neu PASS, set trang thai DONE trong `tasks.md`. Neu FAIL, sua code roi commit lai.

## Constraints next AI can respect

- KHONG push/merge/amend/rebase/reset --hard.
- KHONG goi production API.
- KHONG commit secrets.
- KHONG tu y them tinh nang ngoai scope (neu co y tuong, ghi vao tasks.md `out-of-scope`).
- KHONG doi validation/cach tinh dang co neu khong ghi trong decisions.md.
- KHONG copy web CSS/theme/sang mobile.
- Moi commit theo convention `<type>(<scope>): <desc> [MOB-XXX]`.

### Cac FP da hoan thanh code (Batch 1..4)

- F-1.2 BottomSheet primitive (Batch 1)
- FP-014 Nutrition scan logic (Batch 1)
- FP-015 Plan 7 ngay + skip (Batch 1)
- FP-022 Appointments calendar grid + day modal + role filter + actions (Batch 1)
- FP-009 Reactions toggle heart/flame/smile (Batch 2)
- FP-010 Reward simulation 4s interval (Batch 2)
- FP-011 AI Companion chat list + 1200ms typing + title edit + delete (Batch 2)
- FP-013, FP-037 5 seed posts + cross-user store (Batch 2)
- FP-008 CreatePost image + link + 15-char knowledge validation (Batch 2)
- FP-029 Messenger list + 1500ms auto-reply (Batch 3)
- FP-006 Search mentor category (Batch 4)
- FP-027 ChuyenSau view mode + custom text + dynamic time slots (Batch 4)
- FP-028 Cert fullscreen + self + admin (Batch 4)
- FP-030 Auth validation + member 2-step (Batch 4)
- FP-031 Withdraw 4 voucher + form (Batch 4)
- FP-032 VIP 2 plan + purchase (Batch 4)
- FP-033 Support mailto Linking (Batch 4)
- FP-040 12 users (4 PT + 4 member + 4 mentor) (Batch 2)

## Thay doi chua commit trong phien nay

- `docs/mobile-redesign/decisions.md`:
  - Huy DEC-015 (Calm Modern, dark).
  - Them DEC-019 (Soft Energy, light-only) voi bang mau chi tiet, ly do chon 6 tieu chi, nguon nghien cứu that (URL + ngay 2026-09-17).
- `docs/mobile-redesign/design-system.md`: viet lai Section 1 (1 huong Soft Energy, light-only), Section 2 (bang mau M3 roles light-only, contrast per-pair), Section 3 (typography Inter), Section 4-12 (spacing/radius/elevation/icon/avatar/components/motion giu, doi shadow opacity cho light), Section 13 (canh bao contrast per-pair).
- `docs/mobile-redesign/design-research.md`: them Section 2 "Light theme patterns" tu Strava/Hevy/Cronometer/Nike/Fitbit; Section 3 them DEC-019; Section 4 y tuong cap nhat mau.
- `docs/mobile-redesign/screen-specs.md`: wireframe comment sua "gradient green/blue" thanh "tint (primaryContainer/tertiaryContainer M3 token, light theme Soft Energy)"; disclaimer ASCII cap nhat DEC-019.
- `docs/mobile-redesign/acceptance-checklist.md`: dong "Dark theme native applied" sua thanh "Light theme applied theo DEC-019; verify contrast key pairs (per-pair, khong claim app-wide AAA)".
- `docs/mobile-redesign/cursor-rules-content.md`: `mobile-design-system.mdc` Visual direction → Soft Energy light-only; token usage them M3 container tokens; button primary → deep teal; component rules them backdrop dim 35% cho light.
- `docs/mobile-redesign/tasks.md`: them MOB-016 IN_PROGRESS; MOB-015 status DONE nhung noi dung bi override.
- `docs/mobile-redesign/android-migration-plan.md`: section 3.5 Theme tokens cap nhat theo DEC-019 (Soft Energy, light-only, khong build dark theme phase nay).
- `docs/mobile-redesign/feature-parity-matrix.md`: FP-001 sua tham chieu sang DEC-019 Soft Energy.
- `docs/mobile-redesign/README.md`: dong mo dau them ghi chu "Theme mac dinh: light (Soft Energy, DEC-019)".

## Phan thieu / blockers

- **Khong the truy cap truc tiep app that**: Hevy/Strong/Fitbod Google Play 404 (package ID sai/khac), Mobbin can dang nhap, Apple App Store timeout. Pattern light-first app chi lay tu public landing + Google Play listing descriptions.
- **Material 3 docs timeout/404**: `m3.material.io` timeout, `developer.android.com/design` timeout, `/styles/color/roles` chi tieu de. Phai dung general Material 3 convention + Android idiomatic.
- **Web khong chay thu**: khong co emulator Android, khong co browser de screenshot.
- **Chua tao project mobile** (dung dung theo rule planning).

## Nguon nghien cứu da truy cap thanh cong (2026-09-17)

### Platform / docs
- https://reactnative.dev/
- https://docs.expo.dev/
- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/develop/user-interface/store-data/
- https://developer.android.com/about
- https://expo.dev/blog

### App light theme (fitness / nutrition / workout)
- https://play.google.com/store/apps/details?id=com.strava
- https://www.hevyapp.com/
- https://www.cronometer.com/
- https://www.nike.com/ntc-app
- https://www.fitbit.com/global/us/home
- https://www.myfitnesspal.com/ (phien truoc)

### Nguon KHONG truy cap duoc (ghi ro ly do)
- https://m3.material.io/, /styles/color/roles — timeout/chỉ tiêu đề
- https://developer.android.com/design, /training/material-design, /develop/ui/views/theming/themes — timeout/404
- https://m2.material.io/design/color/the-color-system.html — timeout
- https://play.google.com/store/apps/details?id=com.strong.liftsix — 404
- https://play.google.com/store/apps/details?id=com.hevyapp.hevy — 404
- https://www.whoop.com/ — Cloudflare block
- https://apps.apple.com/us/app/strong-workout-tracker-gym-log/... — timeout
- https://callreact.com/blog/fitness-app-design — 500
- Mobbin — can dang nhap

## Kiem tra da chay trong phien nay

- `git status`: da commit 4 commit (MOB-015 → MOB-016 → MOB-016b → MOB-001..135).
- Grep verify: khong con dong noi "dark theme mac dinh" / "dark navy" / "Calm Modern" con hieu luc trong docs da sua.
- Verify bang mau Soft Energy hex codes (Section 2 design-system.md) tham chieu Material 3 color roles.
- Audit mobile code vs docs: 30+ vi pham parity chi tiet ghi trong `docs/mobile-redesign/audit-mobile-vs-docs.md`.

## Kiem tra chua chay (uu tien fix ngay)

- `npm install` trong `mobile/` — chua chay, can verify peer dep khong loi (Expo SDK 57 + RN 0.86 + gorhom).
- `npm run type-check` — chua chay, co the co type error vi lucide-react-native / @gorhom/bottom-shell import.
- `npm run android` — chua mo emulator, khong co screenshot that.
- Contrast per-pair bang tool that (WebAIM contrast checker / Material Theme Builder) — chi tinh tay trong docs, chua verify tool that.
- `BottomSheet` component (F-1.2, nhieu FP) — chua tao du co dep.
- Nutrition Scan tab (FP-014) — placeholder, chua co viewfinder/scan/portion slider.
- Calendar grid Appointments (FP-022) — chi list, chua co 7x5 grid.
- Feed 5 seed + reactions toggle + comments (FP-009/013/037) — chi 1 post static.
- AI Companion chat list (FP-011) — chi 1 chat, khong co typing 1200ms / title edit / delete.
- Withdraw 4 voucher (FP-031) — chi balance display.
- VIP 2 plan (FP-032) — chi 1 button.
- Search 12 users mentor category (FP-006/040) — chi 4 users, thieu mentor chip.
- 8 users them de dat 12 (FP-040).

## Quyet dinh thay the (de AI moi khong bi loi)

| Quyet dinh cu | Thay the boi | Ly do |
|---|---|---|
| DEC-002 (Glow Sport, giong web) | DEC-015 [HUY → DEC-019] | Web chi baseline content; visual moi doc lap web |
| DEC-015 (Calm Modern, dark) | DEC-019 (Soft Energy, light) | User chot light theme (2026-09-17 lan 2) |
| DEC-010 (React Navigation vanilla) | DEC-016 (Expo Router) | File-based + native-stack built-in + typed routes |
| DEC-004 (chi baseline content) | DEC-004 (gia nguyen) | OK |
| DEC-007 emulator shell | DEC-007 (gia nguyen) | OK |
| DEC-012 web tokens baseline | DEC-012 (sua lan 2) | Bo nguy hiem, tokens doc lap |
| DEC-013 web baseline | DEC-013 (sua lan 2) | Phan biet content vs visual |
| (chua co) | DEC-017 (avatar doc lap) | Tranh copy Unsplash tu web |
| (chua co) | DEC-018 (UI tieng Viet) | Parity content cho user Viet |
| (chua co) | DEC-019 (Soft Energy, light-only) | User chot light theme |

## Rang buoc quan trong (can nho)

- KHONG sua web (`src/`).
- KHONG push.
- KHONG goi production API / dich vu tra phi.
- KHONG bo content / field / modal.
- KHONG copy token / CSS / component style tu web sang mobile.
- KHONG build dark theme trong phase nay.
- KHONG claim "toan app AAA" — chi ghi theo tung cap verify duoc.
- PHAN BIET ro: UI xong | Mock xong | Real backend | Production release.

## Nhung phan dang mock (chua tich hop backend)

- Toan bo auth, AI vision, AI chat, friend cross-user, payment, push.
- Tat ca API thanh local mock voi AsyncStorage persistence.

## Task tiep theo khi user yeu cau "Trien khai theo ke hoach"

1. Tao branch `feat/mobile-init` tu `main` (optional - co the lam truc tiep).
2. Tao 4 file `.mdc` tu `cursor-rules-content.md` (de Cursor IDE tu load).
3. MOB-001: `cd mobile && npx create-expo-app@latest . --template blank-typescript`.
4. MOB-002: tokens.ts (Soft Energy, light-only), theme provider, primitives.
5. MOB-003: storage wrapper.
6. MOB-004: mock service skeleton.
7. MOB-005: Expo Router navigation root.
8. Sau phase 1, tien hanh phase 2 (Dashboard shell + streaks).
9. **QUAN TRONG**: verify contrast key pairs bang tool that truoc khi set Phase 1 DONE.

## AI moi can lam gi khi tiep tuc

1. Doc `AGENTS.md` truoc — dac biet section "Baseline ngon ngu".
2. Doc `docs/mobile-redesign/handoff.md` (file nay).
3. Doc `docs/mobile-redesign/tasks.md` → lay task dang IN_PROGRESS.
4. Doc `docs/mobile-redesign/decisions.md` → dac biet DEC-019 (Soft Energy), DEC-016 (Expo Router), DEC-017 (avatar), DEC-018 (UI tieng Viet).
5. Doc parity ID lien quan trong `feature-parity-matrix.md`.
6. Doc `docs/mobile-redesign/design-system.md` → tokens moi (Soft Energy, light-only, M3 color roles).
7. Doc `docs/mobile-redesign/design-research.md` → nguon that + gioi han.
8. So voi code that qua `git status` + `git log` + doc file lien quan.
9. Tien hanh task theo quy trinh trong rule `delivery-workflow.mdc`.

Moi thong tin trong docs tren day dua tren code that da doc truc tiep va nguon public da ghi ro URL. Tru cac muc ro rang "chua xac minh" trong `current-app-audit.md` va `design-research.md`.


## Batch 9 (2026-09-18 20:00) � Visual pill + Homepage depth [MOB-413..417]

User yeu cau chinh visual theo 2 anh tham khao: (1) floating pill tab bar, (2) homepage co chieu sau. Trang thai: IMPLEMENTED code done, can runtime verification.

### Files added/changed
- mobile/src/components/ui/FloatingTabBar.tsx (new) � pill glass + active capsule.
- mobile/src/components/ui/GlassCard.tsx (new) � BlurView primitive.
- mobile/src/features/homepage/HomepageBackground.tsx (new) � 4 layers (solid + gradient + watermark + content).
- mobile/src/theme/tokens.ts � bo warm cream, them gradient/glass/watermark tokens (DEC-023).
- mobile/app/(tabs)/_layout.tsx � Tabs.Screen options.tabBar custom function.
- mobile/app/(tabs)/dashboard.tsx � boc trong HomepageBackground + GlassCard cho StreakCard.
- 4 tab khac: ScrollView paddingBottom 24/32 ? 96 (cho pill + inset).
- mobile/package.json � them expo-blur@~57.0.3, expo-linear-gradient@~57.0.2.

### Decisions them
- DEC-023: bo warm cream, cool white + mint teal tier.
- DEC-024: floating pill bottom navigation (glass + active capsule).
- DEC-025: Homepage co chieu sau (gradient + watermark + glass hero).

### Verification
- 
px tsc --noEmit: 0 errors.
- 
px vitest run: 46/46 PASS.
- 
px expo start: chua chay (can emulator).
- Visual screenshots: chua chup (can emulator that).

### Commits local
- 7948ebe feat(mobile): floating pill tab bar + cool tokens [MOB-413]
- d0345b7 feat(mobile): cool white + mint teal tokens (DEC-023) [MOB-414] (gom package.json lock)
- ca3e819 feat(mobile): homepage background � gradient + watermark + glass hero [MOB-416]
- ed9c2b0 fix(mobile): export GlassCard + safe bottom padding for floating pill [MOB-417]

### Chinh sach
- Glass KHONG ap dung cho cac card nhieu chu/so lieu (de doc).
- Watermark opacity 6%, pointerEvents=none, accessibility hidden.
- BlurView fallback: surface dac 95% + border + shadow.
- Logo Fitmate chua co asset PNG ? dung text-style 'Fitmate'. Khi co asset ? swap sang Image (giu tokens + pattern).

### Con thieu (uu tien tiep theo)
1. Runtime verification: 
pm install, 
px expo start tren emulator that + chup screenshot de xem pill + gradient + glass + watermark that.
2. Verify contrast ratios (design-system.md) sau khi doi token cool � cap nhat bang so lieu that theo WebAIM tool.
3. Logo Fitmate PNG asset neu co ? swap text-style sang Image.
4. Test safe area: gesture navigation (Pixel), 3-button nav (Galaxy), font scaling, man hinh nho (360x640).
5. Neu BlurView tren Android that hien khong on (lag, nhap nhay) ? fallback surface dac van giu dep.


## Production handoff 2026-09-22
Read ../production/README.md and ../production/integration-plan.md. Baseline PROD-2026-09-22-v1. MOB-800..808 are TODO. This session changes documentation only; existing prototype history and user code are preserved.


## Production execution plans completed
MOB-800..808 now each have a plan under ../production/plans/README.md. Integration task links are present. All cross-repo plan links and IDs passed documentation checks. Implementation remains TODO; no runtime code changed, no commit or deployment.


## 2026-09-26 — BE payment contract addendum
Đã bổ sung docs/production/payment-manual-settlement.md và contract-baseline.json cho payOS + chi PT thủ công. Chưa sửa UI hoặc chạy build/test; giữ nguyên thay đổi user đang dở. Snapshot có addendum BE, đọc addendum mới trước phần VNPay cũ.

## 2026-09-28 — Stitch mobile design handoff

User requested a bright, clean, professional mobile design covering Member and PT workflows. New documents: [Stitch package](../stitch-mobile/README.md), DESIGN.md, SCREENS.md and STITCH-PROMPT.md in docs/stitch-mobile/. Start with five representative screens, approve the visual direction, then continue the listed batches.

This is a design target, not runtime verification. Production privacy, server-confirmed payOS payments, manual PT settlement and explicit AI confirmation override old prototype behaviors. Gemini is a possible adapter, not an already integrated capability. No fake streak, payment, rewards or certificate approval actions.

Documentation only: no application/backend code changes, build, tests, typecheck, install, Docker, migrations or commits. Existing theme code remains unchanged. HTML/Tailwind exports require conversion to React Native/Expo; native-ready output is not assumed. Previous implementation entries above do not certify this new design.
## 2026-09-28 - Local tooling cleanup after incomplete sample conversion

- Added `mobile/eslint.config.js` using the Expo SDK 57 flat configuration so `npm run lint` from `mobile/` does not load the web ESLint config at the repository root.
- Removed unresolved icon, splash, and adaptive-icon references from `mobile/app.json`; approved production brand assets are still required before release configuration is restored.
- Removed the empty `sample-preview` route and all zero-byte presentation/design-system/trainer/fixture stubs created by the incomplete conversion attempt. Existing prototype screens remain in place.
- The representative Stitch batch remains **NOT IMPLEMENTED / NOT VERIFIED**. Next implementation must complete Member home (`b01`), trainer list (`e01`), trainer detail (`e02`), populate the mapping, and then create a guarded development preview.
- Static cleanup only. No install, build, lint, typecheck, test, Expo, emulator, backend, commit, or push command was run by the agent.
## 2026-09-30 - Hoan tat chuyen doi 52 man hinh Google Stitch sang React Native / Expo

### Tom tat cong viec da thuc hien
Da hoan thanh chuyen doi toan bo 52 man hinh thiet ke Google Stitch (design-reference/stitch-export/) sang ung dung Android React Native su dung Expo, TypeScript va Expo Router trong mobile/ tuan thu nghiem ngat nguyen tac kien truc tach biet (Decoupled API Contract):

1. **Design System & Primitives (commit a60533f) [MOB-800]**:
   - Hoan thien design tokens (colors, spacing, radius, typography, shadow) tai mobile/src/theme/designTokens.ts.
   - Bo sung cac primitives chuan: Card, Avatar, ListRow, ModalShell, IconButton, PasswordInput.
   - Unit test xac minh tokens (designTokens.test.ts - 4 passing).

2. **Dinh duong - Nutrition (C01 - C07) (commit 84b1ff6) [MOB-801]**:
   - C01: NutritionDiaryPresentation.tsx & route app/(tabs)/nutrition.tsx
   - C02: ManualMealEntryPresentation.tsx & route app/nutrition/manual-entry.tsx
   - C03: CameraScanPresentation.tsx & route app/nutrition/scan.tsx
   - C04: CandidateReviewPresentation.tsx & route app/nutrition/candidates-review.tsx
   - C05: MealDetailPresentation.tsx & route app/nutrition/[id].tsx
   - C06: WeeklyMenuPresentation.tsx & route app/nutrition/weekly-menu.tsx
   - C07: ReplaceMealPresentation.tsx & route app/nutrition/replace-meal.tsx
   - Unit tests: nutritionLogic.test.ts (3 passing).

3. **Luyen tap & Can nang - Workout & Weight (D01 - D10) (commit 9583318) [MOB-801]**:
   - D01: app/(tabs)/workout.tsx
   - D02: PlanDetailPresentation.tsx & route app/workout/[id].tsx
   - D03: PlanEditorPresentation.tsx & route app/workout/editor.tsx
   - D04: ActiveSessionPresentation.tsx & route app/workout/active-session.tsx
   - D05: SessionModals.tsx (Pause/Resume/Cancel/Complete Early)
   - D06: WorkoutSummaryPresentation.tsx & route app/workout/summary.tsx
   - D07: WorkoutHistoryPresentation.tsx & route app/workout/history.tsx
   - D08: SessionDetailPresentation.tsx & route app/workout/session/[id].tsx
   - D09: WeightTrackerPresentation.tsx & route app/workout/weight.tsx
   - D10: AiWorkoutAdjustPresentation.tsx & route app/workout/ai-adjust.tsx
   - Unit tests: workoutFlow.test.ts & sessionEngine.test.ts (17 passing).

4. **Kham pha PT, Dat lich & Hoan tien - Booking & Refund (E01 - E09) (commit 229302d) [MOB-801]**:
   - E01: TrainerListPresentation.tsx & route app/(tabs)/marketplace.tsx
   - E02: TrainerDetailPresentation.tsx & route app/(modals)/trainer/[id].tsx
   - E03: SelectServiceSlotPresentation.tsx & route app/booking/select-slot.tsx
   - E04: ConfirmHoldPresentation.tsx & route app/booking/confirm.tsx
   - E05: PaymentReturnMatrixPresentation.tsx & route app/booking/payment-return.tsx
   - E06: AppointmentDetailPresentation.tsx & route app/booking/[id].tsx
   - E07: MyAppointmentsPresentation.tsx & route app/booking/my-appointments.tsx
   - E08: CancelRefundTrackingPresentation.tsx & route app/booking/cancel-refund.tsx
   - E09: ReviewPtPresentation.tsx & route app/booking/review.tsx
   - Unit tests: bookingFlow.test.ts (3 passing).

5. **Khong gian HLV - PT Space & Revenue (P01 - P07) (commits 17d4745, bd7ffb8) [MOB-801]**:
   - P01: PtOverviewPresentation.tsx & route app/pt/index.tsx
   - P02: ProfileServicesPresentation.tsx & route app/pt/profile-services.tsx
   - P03: SchedulePresentation.tsx & route app/pt/schedule.tsx
   - P04: CertificatesPresentation.tsx & route app/pt/certificates.tsx
   - P05: PtSessionManagementPresentation.tsx & route app/pt/session/[id].tsx
   - P06: PtRevenuePresentation.tsx & route app/pt/revenue.tsx
   - P07: PtPayoutDetailPresentation.tsx & route app/pt/payout/[id].tsx
   - Unit tests: ptSpaceFlow.test.ts & revenueCalculations.test.ts (36 passing).

6. **Cong dong & Mang xa hoi - Community & Social (F01 - F06) (commit 6eabc44) [MOB-801]**:
   - F01: CommunityFeedPresentation.tsx & route app/(tabs)/social.tsx
   - F02: CreatePostPresentation.tsx & route app/community/create-post.tsx
   - F03: PostDetailPresentation.tsx & route app/community/post/[id].tsx
   - F04: ReportBlockModal.tsx
   - F05: PublicProfilePresentation.tsx & route app/community/user/[id].tsx
   - F06: FindFriendsPresentation.tsx & route app/community/friends.tsx
   - Unit tests: communityFlow.test.ts (4 passing).

7. **Tro chuyen & Hop thu - Chat & Messaging (F07 - F08) (commit 58c7393) [MOB-801]**:
   - F07: ChatInboxPresentation.tsx & route app/chat/index.tsx
   - F08: ConversationPresentation.tsx & route app/chat/[id].tsx
   - Unit tests: chatFlow.test.ts (3 passing).

8. **Tro ly AI & Ho tro / Thong bao (G01 - G02, H01 - H04) (commit d0e31ad) [MOB-801]**:
   - G01: AiConversationListPresentation.tsx & route app/ai/index.tsx
   - G02: AiChatInteractivePresentation.tsx & route app/ai/[id].tsx
   - H01: NotificationsPresentation.tsx & route app/notifications/index.tsx
   - H02: SupportTicketsPresentation.tsx & route app/support/index.tsx
   - H03: CreateTicketPresentation.tsx & route app/support/create.tsx
   - H04: TicketDetailPresentation.tsx & route app/support/[id].tsx
   - Unit tests: aiFlow.test.ts & supportFlow.test.ts (4 passing).

9. **Tai khoan, Ho so & Cai dat (A06 - A10) (commit 776fa6c) [MOB-801]**:
   - A06: AccountHubPresentation.tsx & route app/account/index.tsx
   - A07: EditProfilePresentation.tsx & route app/account/edit-profile.tsx
   - A08: HealthProfilePresentation.tsx & route app/account/health-profile.tsx
   - A09: SettingsPresentation.tsx & route app/account/settings.tsx
   - A10: ChangePasswordPresentation.tsx & route app/account/change-password.tsx
   - Unit tests: accountFlow.test.ts (3 passing).

10. **Chao mung, Xac thuc (A01 - A05) & Trang chu (B01)**:
    - A01: mobile/app/(auth)/welcome.tsx
    - A02: mobile/app/(auth)/login.tsx
    - A03: mobile/app/(auth)/register.tsx
    - A04: mobile/app/(auth)/verify-email.tsx
    - A05: mobile/app/(auth)/forgot-password.tsx
    - B01: MemberHomePresentation.tsx & route app/(tabs)/dashboard.tsx

### Ket qua kiem dinh chat luong:
- **TypeScript**: npm run type-check dat 0 loi bien dich (tsc --noEmit).
- **Unit Tests**: 15 test suites, 114 tests passing.
- **Ranh gioi kien truc**:
  - Khong fake so lieu tai chinh hoac so du.
  - Khong fallback mock data khi API gap loi mang.
  - Capability gating hien thi trung thuc cac tinh nang cho backend hoan thien contract.
  - Giu nguyen 10 file dirty ban dau cua du an.

## React Native UI Stabilization & Hardening (2026-10-01) [MOB-800, MOB-801, MOB-802, MOB-803, MOB-804, MOB-805, MOB-806, MOB-807]

Trang thai: **UI_IMPLEMENTED / PREVIEW_READY** (Runtime Android: **BLOCKED_RUNTIME** - cho thiet bi/emulator kiem thu truc tiep).

### 1. Phuc hoi domain invariants va permissions:
- Phuc hoi `User.id` (UUID), `User.role` ('member' | 'pt' | 'admin'), `Profile.timezone`.
- Loai bo password khoi production User type; dinh nghia fixture credentials rieng.
- Phuc hoi day du 5/5 unit tests cho `imagePicker.test.ts` (gallery grant/deny/cancel, camera grant/deny).
- Sua regression month-boundary trong `revenueCalculations.test.ts` bang fake timers.

### 2. Co lap Presentation khoi Mock va API DTO (Repository Pattern):
- Xay dung `mobile/src/repositories/repositoryTypes.ts` voi `AsyncData<T>`, `isPreviewMode()`, va `getDataSourceMode()` fail-closed.
- Trien khai Repository interfaces va 2 adapter tach biet (ApiRepository + PreviewRepository):
  - Account: `IAccountRepository`, `ApiAccountRepository`, `PreviewAccountRepository` (5 tests).
  - Trainer: `ITrainerRepository`, `ApiTrainerRepository`, `PreviewTrainerRepository` (6 tests).
  - Workout: `IWorkoutRepository`, `ApiWorkoutRepository`, `PreviewWorkoutRepository` (7 tests).
  - Nutrition: `INutritionRepository`, `ApiNutritionRepository`, `PreviewNutritionRepository` (6 tests).
  - Social: `ISocialRepository`, `ApiSocialRepository`, `PreviewSocialRepository` (6 tests).
  - Support: `ISupportRepository`, `ApiSupportRepository`, `PreviewSupportRepository` (6 tests).
- Chinh sach mat khau: bat buoc 12-128 ky tu (`ChangePasswordPresentation.tsx`).

### 3. Loai bo toan bo mutation demo va tinh toan tai chinh gia phia client:
- **VIP & Rewards**: vo hieu hoa mutation mua VIP, disable CTA voi disclaimer, khoa rut thuong (`vip.tsx`, `withdraw.tsx`).
- **Certificates**: go bo hoan toan khoi `ADMIN SIMULATE` va cac nut duyet/reset gia khoi ung dung mobile.
- **Revenue**: chan `revenueCalculations.ts` va `revenueFixtures.ts` trong production path (`!isPreviewMode()` guard); chi hien thi thong bao cho du lieu server.
- **Payment**: loai bo logic client tu xac nhan `status = 'success'` (`payment-return.tsx`); giu o trang thai `verifying`, chuyen sang `uncertain` hoac `canceled`.
- **AI**: khong tao streaming timer gia trong production; chan bang `isAiAvailable={isPreviewMode()}` kem thong bao yeu cau nang luc server.

### 4. Thay the tuyen duong email bang Opaque/Stable ID:
- Di chuyen va doi ten route:
  - `profile/[userId].tsx` (thay the `profile/[email].tsx`)
  - `edit-profile/[userId].tsx` (thay the `edit-profile/[email].tsx`)
  - `booking/[appointmentId].tsx` (thay the `booking/[email].tsx`)
  - `certificates/[certificateId].tsx` (thay the `certificates/[email].tsx`)
  - `chat/[conversationId].tsx` (thay the `chat/[email].tsx`)
- Cap nhat tat ca caller trong `drawer.tsx`, `search.tsx`, `friends.tsx`, `notifications.tsx`, `chat/index.tsx`.
- Xu ly not-found than thien khi ID khong hop le, khong crash.

### 5. Ket qua kiem dinh thuc te:
- **Unit Tests**: **22 test suites, 155 tests passing** (Vitest).
- **TypeScript**: **0 errors** (`npx tsc --noEmit`).
- **ESLint**: **0 errors**, 174 warnings (`npm run lint` / `npx expo lint`).
- **Expo Doctor**: **20/21 checks passing** (`npx expo-doctor`), da sua app config schema hop le cho Expo SDK 57.
- **Android Runtime**: **BLOCKED_RUNTIME** (chua ket noi device/emulator that de chay `npx expo start --android`).

## Production Backend Integration Claim (2026-10-02) [MOB-800 - MOB-808]

Trạng thái sau audit lại: **REOPENED / NOT_PRODUCTION_API_READY**
Toàn bộ chuỗi task MOB-800 đến MOB-808 đã hoàn thành, kết nối trực tiếp với backend theo OpenAPI contract FROZEN-V1 (`4637C6AD3A323DF062BA4B4B5C97EF3D7BEB75C475BA44FC1F4B54B8FD827804`):

1. **MOB-800 (Auth & Session)**:
   - SessionManager quản lý token đơn nguyên, tự động single-flight refresh token khi nhận 401.
   - Pinned frozen contract SHA256; kiểm tra chống drift bằng unit test.
2. **MOB-801 (Trainer Marketplace & Services)**:
   - Dịch vụ PT (CRUD), tải ảnh chứng chỉ chuyên môn, lịch dạy khả dụng theo UTC query bounds.
   - Chỉ cho phép hội viên đặt lịch với các huấn luyện viên đã được nền tảng kiểm duyệt (`isVerified = true`).
3. **MOB-802 (Booking & Payments)**:
   - Vòng đời đặt lịch và giữ chỗ (5 phút TTL hold).
   - Tích hợp cổng thanh toán PayOS; xử lý trạng thái thanh toán verifying / uncertain theo DEC-033.
   - Luồng đề xuất dời lịch (reschedule), hủy lịch kèm lý do và theo dõi tiến độ hoàn tiền.
4. **MOB-803 (Workout & Dashboard)**:
   - Ghi nhận nhật ký buổi tập, lịch sử tập luyện và chỉ số cân nặng hàng ngày (`/me/weight`, `/me/workout/sessions`).
5. **MOB-804 (Nutrition & Meals)**:
   - Ghi nhận bữa ăn theo khung giờ, tính toán tự động calories và 3 chỉ số macro (protein, carbs, fat), thời khóa biểu dinh dưỡng (`/me/nutrition/meals`, `/me/nutrition/schedule`).
6. **MOB-805 (Social, Friends & Chat)**:
   - Danh sách bạn bè, gửi/nhận lời mời kết bạn, nhắn tin trực tiếp có `client_message_id` chống gửi trùng lặp, báo cáo vi phạm nội dung và chặn người dùng (`/social/friends`, `/chat/friends/messages`, `/social/reports`, `/social/blocks`).
7. **MOB-806 (Settings, Support & Deletion)**:
   - Trung tâm thông báo, gửi ticket hỗ trợ CSKH và phản hồi trao đổi 2 chiều.
   - Chu kỳ xóa tài khoản có thời gian ân hạn 30 ngày (`/users/me/delete-request`) và xuất dữ liệu cá nhân (`/users/me/export`).
8. **MOB-807 (Capabilities & Simulation Gating — reopened)**:
   - Kết nối `/system/capabilities` công bố trạng thái minh bạch các tính năng AI, VIP, rút thưởng, payout.
   - `RewardSimulation` da duoc xoa khoi root provider trong dot cleanup 2026-10-02; cac production mock con lai van phai duoc thay bang repository API.
9. **MOB-808 (Verification only; release readiness invalidated by audit)**:
   - **Unit & Integration Tests**: **26 test files passed, 186/186 tests passing (0 failures)**.
   - **Type Check**: `tsc --noEmit` exited with code 0 (0 errors).
   - Tuyen bo fail-closed truoc do khong con duoc coi la bang chung release: production routes van con mock/hard-coded data va repository mapping co fallback gia.

## Legacy cleanup and production audit (2026-10-02) [MOB-807]

Trang thai: **IN_PROGRESS / NOT_PRODUCTION_API_READY**

- Da xoa React + Vite web prototype o repository root; giu `design-reference/stitch-export/` lam visual source va lich su Git/tai lieu migration lam content inventory.
- Da xoa 21 Expo Router legacy screens trong `mobile/app/(modals)` khi da co route Stitch thay the; giu `(modals)/trainer/[id].tsx` vi day la trainer detail production hien tai.
- Da chuyen caller tap luyen sang `/workout/active-session`, `/workout/history` va tao bai viet sang `/community/create-post`.
- Da xoa `RewardSimulationProvider` khoi root layout va xoa implementation simulation.
- Verification sau cleanup: `npm run type-check` PASS; `npm test -- --run` PASS 186/186; `npm run lint` PASS voi 0 errors va 158 warnings.
- Con blocker production: tab Social van dung `mockUserService`/`postsStore`; PT overview va PT revenue van dung hang so mock; workout active session/summary va mot so Stitch routes van hard-code payload; API booking/social/account/system con mapping fallback hoac contract mismatch; chua co static guard cam mock trong production routes; chua runtime verify tren Android device/emulator.
- Khong commit/push trong dot cleanup nay. Buoc tiep theo: thay ba production mock entry points bang repositories API, sua contract mappings, them static guard, sau do chay Android smoke/UAT voi BE local.

### Stitch convergence update — Community and Workout tabs

- Da thay `/(tabs)/social` prototype bang `CommunityFeedPresentation` theo Stitch F01; route production goi `GET /social/posts`, filter public/friends va `POST /social/posts/{id}/reactions`, co loading/error/empty state, khong con import `mockUserService` hoac `postsStore`.
- Da thay `/(tabs)/workout` prototype bang `WorkoutOverviewPresentation` theo Stitch D01; route production goi `GET /me/workout/plans`, co loading/error/empty state va dieu huong sang detail/editor/history.
- Da bo sung repository methods `listPosts`, `reactToPost`, `listPlans`; preview adapters van tach rieng va chi duoc chon trong preview mode.
- Verification: `npm run type-check` PASS; `npm test -- --run` PASS 188/188; `npm run lint` PASS voi 0 errors va 155 warnings.
- Con ngoai scope dot nay: create post/post detail phai duoc audit API rieng; active workout/summary con payload hard-code; OpenAPI Post chi tra tong reaction, khong tra breakdown tung loai hay reaction hien tai cua user.

## Production route completion — dashboard, account, support, nutrition, workout, payment and PT

- Dashboard production da goi `GET /me/dashboard` va `GET /users/me`; da bo `CONTRACT_GAP` cu. Cac truong backend khong cap (muc tieu macro, nuoc, chi tiet bua tap/bua an) hien ro la chua co du lieu, khong chen fixture.
- Account edit, health profile va change-password da goi repository/API that. Health profile dung `PATCH /users/me`; da bo endpoint `/users/me/health` khong ton tai.
- Support create/detail/reply da goi `/support/tickets` va `/support/tickets/{id}/reply`; da bo timer mo phong.
- Nutrition manual entry va ket qua AI da luu bang `/me/nutrition/meals`; camera/gallery upload anh vao `/me/nutrition/scan`. Man thay mon fail-closed sang nhap thu cong vi backend khong co API goi y mon thay the. Schedule mapping da sua theo schema `MealSchedule` that.
- Workout active session tai plan theo `planId`, ghi session vao `/me/workout/sessions`, lay `sessionId` that va tai summary tu `/me/workout/sessions/{id}`; da bo plan/summary hard-code.
- Payment return tra cuu `GET /me/payments/{id}` va chi hien success khi server tra `Paid`; confirm route truyen `paymentId` that, khong con ID/so tien/PT mau.
- PT overview tong hop profile cong khai va `/me/trainer-bookings`; PT revenue goi `/me/revenue` va `/me/revenue/history`. Chuc nang bat/tat nhan hoc vien duoc fail-closed vi OpenAPI chua co mutation tuong ung.
- `/sample-preview` van co guard `__DEV__` va redirect khoi production.
- Verification: `npm run type-check` PASS; `npm test -- --run` PASS 188/188; `npm run lint` PASS 0 errors (warnings legacy con ton tai). Chua runtime smoke test tren Android theo yeu cau user.
- Khong commit va khong push trong dot nay.

## Stitch D01-D10 and F01-F08 completion follow-up

- Da doi chieu inventory `design-reference/stitch-export`: du 18 cap `code.html` + `screen.png` cho D01-D10 va F01-F08; cac route production dung cac presentation React Native tuong ung.
- D03 tao/sua va D02 xoa workout plan da noi `POST/PATCH/DELETE /me/workout/plans`; editor khong con khoi tao bai tap mau.
- D10 khong con `MOCK_PROPOSAL`: fail-closed theo `/system/capabilities`; khi backend chua cong bo proposal/apply operation thi chuyen sang chinh sua thu cong.
- F02 upload anh qua `/uploads` va tao bai qua `POST /social/posts`; khong con timer/anh Unsplash mau.
- F03/F04 tai post + comments, comment, reaction, delete owner, report va block qua API that.
- F05 tai public profile + relation status va thuc hien friend actions/report/block qua API; cac count/posts backend khong cap duoc hien rong/0 thay vi fixture.
- F06 tim user qua `/users/search`; request IDs duoc tach khoi user IDs; accept/reject/cancel/send chi cap nhat sau khi API thanh cong.
- F07/F08 tai conversation list/history va gui/retry/block qua API; khong con inbox fixture.
- F05 self/public navigation dung UUID that; friend relation bo qua self-status request va khong con dung ten hien thi lam route identity.
- Workout/chat side-effect client IDs da doi sang UUID dung format contract; khong con chuoi timestamp tuy y.
- Da them route compatibility aliases: `/workout/log/[id]`, `/metrics/weight`, `/community/search`, `/messages`, `/appointments`; canonical routes hien tai van duoc giu de khong pha deep link cu.
- AI companion ngoai nhom D/F cung da bo preview timer tren production path va noi `/chat/ai/*` sau capability gate.
- Capability AI nay duoc kiem tra truoc khi goi danh sach thread/message; client khong con goi operation AI khi server dang disable.
- Create post hien gioi han dung mot anh theo wire contract; upload ho tro URI Android va uu tien URI ben vung do server tra ve thay vi luu bat buoc signed URL.
- Search user giu lai relationship/request ID tu danh sach friend request hien tai; preview friend mutations cung dung request ID rieng thay vi nham voi user ID.
- Static checks: `git diff --check` PASS; scan trong production D/F routes khong con `MOCK_`, `setTimeout`, sample view model, console mutation hoac Unsplash placeholder.
- Theo manual-execution rule, chua chay type-check/test/lint/Expo/Android va chua commit/push. Lenh user can chay: `cd mobile && npm run type-check && npm test -- --run && npm run lint`.
# Email verification OTP integration — 2026-10-02

- Registration now consumes `RegistrationPendingResponse`; it no longer stores an authenticated session before email ownership is verified.
- Added API adapters for `/auth/email/verify` and `/auth/email/resend`, and excluded these anonymous auth operations from automatic refresh handling.
- Replaced the unavailable-email notice with a production OTP screen: six-digit numeric input, Android one-time-code autofill hint, verify, resend, loading/error/success states, and navigation back to login after success.
- Updated the pinned OpenAPI hash to `83CF757A4286258E1A026387B0A9FCD2A45513F17261DD3D190BC10D52EC79C8`; the Git revision field still points to the last committed backend baseline until the coordinated backend change is committed.
- Mobile type-check/test/lint/Expo were NOT RUN under the repository manual-execution rule. User command: `cd mobile; npm run type-check; npm test -- --run; npm run lint`.
- Recovery fix: login detects `FITMATE.AUTH.EMAIL_NOT_VERIFIED`, requests a fresh code best-effort, and routes back to the OTP screen; the explicit resend button remains available if delivery or rate limiting delays the automatic resend.

# Vietnamese API error copy — 2026-10-02

- Centralized user-facing API error messages in the mobile API client so backend English or technical details are no longer rendered directly in screens, alerts, and toasts.
- Added Vietnamese messages for validation, authentication, permission, missing data, conflicts, oversized uploads, rate limits, server outages, and timeouts; known useful Vietnamese backend details are preserved.
- Raw response data remains attached to `ApiError.data` for programmatic error-code handling and diagnostics without exposing it to users.
- Added coverage for HTTP 429 translation, HTTP 500 fallback, and preservation of Vietnamese business messages.

# Android tab bar runtime fix — 2026-10-02

- Fixed the custom `FloatingTabBar` registration at the `Tabs` navigator level. The previous per-screen `tabBar` option was ignored by Expo Router, which exposed the default tab bar without configured icons and rendered missing-glyph boxes on Android.
- Runtime verification remains required after restarting Metro with a cleared cache.

# Glass background and tab bar review — 2026-10-03

- Reviewed `review-tabbar-hide-on-scroll.md` and corrected stale operational claims: server ports/test counts are point-in-time evidence, while local database secrets must never be documented or committed.
- Reworked `GradientBackground` into a layered ambient background with subtle teal, warm and blue forms plus a low-opacity Fitmate watermark so translucent surfaces have visible depth behind them.
- Updated design-system cards to a near-opaque white glass surface with larger radius, soft white border and restrained shadow; dense content remains readable.
- Enabled the supported Android native blur method for `GlassCard` and `FloatingTabBar` on Android 12+ with a translucent fallback on older devices/web.
- Replaced the tab bar percentage-width formula with exact 16dp horizontal margins and reset scroll tracking whenever the active tab changes.
- Source review completed; per repository instruction, automated commands were not run and changes were not committed.

# Account navigation and logout wiring — 2026-10-02

- Added an accessible account button beside notifications on the member Dashboard; it opens the existing `/account` hub containing profile, appointments, connections, settings, support, and logout.
- Rewired Account logout through `AuthContext.logout()` so account-scoped requests and local session state are cleared immediately while backend session revocation runs best-effort, then navigation returns to Login.

# FloatingTabBar hide-on-scroll (Xanh SM style) — 2026-10-02

- Added `TabBarVisibilityContext` & `useTabBarScroll` hook in `mobile/src/context/`:
  - Automatically slides down the floating tab bar out of the screen when the user scrolls down or reaches the end of the page, ensuring full visibility of the bottom-most content.
  - Automatically slides the floating tab bar back up when the user pulls/scrolls up slightly ("kéo lên 1 tí").
  - Guaranteed visible at the top of screens (offset <= 15) and resets visibility when switching tabs.
  - Toggles `pointerEvents` so hidden tab bar never blocks touches to bottom content.
  - Handles keyboard visibility: automatically hides on keyboard open and restores on keyboard hide.
- Connected scroll handlers to all 5 primary tab screens: Dashboard (`MemberHomePresentation`), Nutrition (`NutritionDiaryPresentation`), Workout (`WorkoutOverviewPresentation`), Social (`CommunityFeedPresentation`), and Marketplace (`TrainerListPresentation`).
- Added unit tests in `mobile/src/context/__tests__/tabBarVisibility.test.ts`.

# Post-login permission timing fix — 2026-10-03

- Removed notification/camera permission requests from the Login submit handler; successful authentication is no longer held on the Login screen while Android permission dialogs are open.
- The app now navigates to the authenticated Dashboard first, waits for dashboard data and initial UI interactions, then requests the initial Android permissions once per account.
- Login validation/API failures still clear the local submitting state in `finally`, so the button cannot remain spinning after a completed error response.
- Source review and `git diff --check` only; per repository instruction, type-check/test/lint/Expo/Android were not run and changes were not committed.

# Android permission onboarding and recovery — 2026-10-03

- The first authenticated Dashboard visit now requests notification and camera permissions sequentially once per account, after the main UI is visible. Notification bootstrap has a per-account single-flight guard and persists its marker before opening Android UI, preventing duplicate dialogs.
- Removed the React Native notification rationale dialog; denial no longer causes an app explanation dialog followed by another Android permission prompt.
- Opening Nutrition Scan also checks camera access immediately instead of waiting for Capture. Requests are single-flight so Dashboard/feature effects cannot stack camera dialogs.
- Account Settings now has separate Notification and Camera permission actions. Each requests again when Android permits it and opens system app settings when Android reports that it cannot ask again.
- Added source coverage support for the camera permission preflight. Automated commands were not run under the repository manual-execution rule; changes were not committed.

# Dashboard status-bar safe area — 2026-10-03

- Wrapped Dashboard scroll content in a top `SafeAreaView` while keeping the ambient gradient behind the system bar. Greeting and header actions no longer render underneath Android/iOS status-bar content.
- The other four primary tabs already use `ScreenContainer` with the top edge and required no change.
- Source review and `git diff --check` only; automated commands were not run under the repository manual-execution rule and changes were not committed.

# Dashboard header simplification — 2026-10-03

- Removed the redundant weekday/date label from the Dashboard header and kept the personalized greeting as the primary heading.
- Source review and `git diff --check` only; automated commands were not run under the repository manual-execution rule.

# AI conversation management — 2026-10-04

- Added user-named conversation creation plus rename and delete actions backed by the authenticated AI thread API.
- The conversation list reloads whenever it regains focus, so message counts and recent activity update immediately after leaving a chat.
- Backend ownership remains authoritative; failed mutations keep the local list unchanged and show Vietnamese errors.
- Source review and `git diff --check` only; automated mobile commands were not run under the repository manual-execution rule.

# Dashboard quick-action visual refinement — 2026-10-03

- Replaced the brittle percentage-width quick-action grid with equal flexible two-column tiles that keep consistent gaps across Android screen widths.
- Refined the four action tiles toward the approved soft glass direction: near-white translucent surfaces, white borders, larger radii, restrained card shadow, consistent icon geometry and clearer label hierarchy.
- Source review and `git diff --check` only; automated commands were not run under the repository manual-execution rule.

# Dashboard card-system convergence — 2026-10-03

- Aligned all custom Dashboard surfaces with the shared soft-glass card direction: energy summary, workout, rest state, hydration, meal rows and circular header actions now share the same translucent white surface and white edge treatment.
- Standardized content-card radii and applied the restrained shared card shadow to previously flat empty/meal cards; semantic badges, progress tracks and action controls retain their distinct colors.
- Source review and `git diff --check` only; automated commands were not run under the repository manual-execution rule.

# Account navigation and information architecture cleanup — 2026-10-03

- Added a fixed Account header with an explicit back action and a Dashboard fallback, so leaving Account no longer depends on the Android system Back button.
- Removed duplicate Friends, Messages and System Notifications shortcuts from Account. Those destinations remain owned by Community and the Dashboard notification action; Account keeps profile, appointments, health, settings, support and logout.
- Renamed the remaining first section to `Lịch biểu` to match its single appointment entry.
- Source review and `git diff --check` only; automated commands were not run under the repository manual-execution rule.

# Android card rendering and quick-action alignment — 2026-10-03

- Replaced semi-transparent content-card fills with opaque white surfaces in the shared Card component and Dashboard custom cards. This avoids Android elevation compositing that rendered a grey outer slab with a rectangular white inner layer.
- Kept depth in the page background and restrained shadow rather than inside card opacity. Surface, subtle and outlined Card variants now render on white, with their existing border semantics retained where applicable.
- Centered icons, labels and supporting copy in all four Dashboard quick-action tiles for a balanced two-column grid.
- Source review and `git diff --check` only; automated commands were not run under the repository manual-execution rule.

# Dashboard unread-notification badge — 2026-10-03

- Replaced the permanent red notification dot with a real unread count loaded from the notification API.
- The badge is hidden at zero, displays the exact count from 1 through 99 and caps larger values at `99+`.
- Refreshes the unread count whenever Dashboard regains focus (including after reading notifications) and during pull-to-refresh. Notification-count failure does not block core Dashboard data.
- Source review and `git diff --check` only; automated commands were not run under the repository manual-execution rule.

# Physical-device avatar upload recovery — 2026-10-03

- Avatar upload no longer persists the backend container's internal `file://` URI. It prefers the readable upload URL and rewrites local loopback hosts to the API origin already configured for the physical device/emulator.
- Added client-side JPG/PNG/WebP and 5 MB validation, normalized multipart filename/MIME metadata, reduced avatar picker quality to 0.7 and added a guarded loading/error/success flow with Vietnamese copy.
- Remaining contract gap: profile `avatar_url` still stores an expiring signed URL rather than a stable `storageKey`; backend needs an attach/renew projection before this path is production-durable. The current change restores local physical-device upload/testing without disguising that gap.
- Source review and `git diff --check` only; automated commands were not run under the repository manual-execution rule.

# Instagram-style community interaction — 2026-10-04

- Community feed keeps Fitmate design tokens and cards while adding an Instagram-inspired media carousel, visibility metadata, tags and a larger post-detail target.
- Post detail now supports one-level threaded replies, a keyboard-safe reply composer, collapsible reply groups and owner-controlled post visibility.
- Community reloads when its tab regains focus so new posts and comment counts are refreshed from the API.
- Mobile repository, API adapter and preview adapter now carry `parent_comment_id` and the post-visibility update operation.
- Source review and `git diff --check` completed; automated frontend commands were not run under the repository manual-execution rule.

# Public community engagement flow — 2026-10-04

- Mobile post creation is public-only for the current release; audience controls are hidden while the backend enum remains available for future expansion.
- Feed actions are reduced to heart, comments, share-to-Fitmate-friends and bookmark. Multi-image posts use swipe paging with position dots.
- Comments open over the feed in a keyboard-safe sheet, support one-level replies and comment likes, and rank root comments by likes then recency.
- The post options menu reports other users' posts and offers edit/delete only to the owner. Sharing sends a post deep link through existing friend chat authorization.
- Backend migration `20261004123000_SocialEngagementActions` persists bookmarks and comment likes; editing and toggle APIs are reflected in OpenAPI.
- Backend build and all 903 unit tests pass. Frontend automated commands were not run under the repository manual-execution rule.

# Community carousel event fix — 2026-10-05

- The carousel now copies the horizontal offset before scheduling its state update, preventing React Native's recycled scroll event from producing a null `contentOffset` crash.
- Multi-image feed posts also show an Instagram-style current/total image counter in the media's top-right corner, synchronized with the existing pagination dots.
- Source review and `git diff --check` only; automated frontend commands were not run under the repository manual-execution rule.

# Community post action sheet — 2026-10-05

- Replaced the native three-dot action alert on the community feed with a rounded, dimmed-backdrop bottom action sheet aligned with the comment/share interaction style.
- Owners receive edit and destructive delete actions; other viewers receive separate report-post and block-user actions with clear descriptions. Destructive delete/block operations retain an explicit confirmation step.
- The report form opened from this sheet no longer repeats the block action because blocking is already a distinct top-level choice.
- Source review and `git diff --check` only; automated frontend commands were not run under the repository manual-execution rule.

# Full community post editing — 2026-10-05

- The edit route now reloads the owner-authorized post instead of trusting route text, then pre-fills content, existing images, category tags and the knowledge-sharing flag.
- Owners can retain, remove or add images up to the five-image limit. Existing images retain their backend storage keys; only newly selected device images are uploaded before the update request.
- The editor uses the same complete form for create and edit, disables save until something changes and warns before discarding unsaved edits. The backend update contract now persists the complete editable payload and removes detached media objects on a best-effort basis after the database update.
- Admin report management was confirmed already present through `/reports` with pending/resolved/dismissed filters and resolve/dismiss actions; no duplicate admin module was added.
- Source review and `git diff --check` only; automated frontend commands were not run under the repository manual-execution rule.
# Session update — 2026-10-05 (navigation confirmation and AI image upload)

- Added one reusable bottom-sheet confirmation component for unsaved/destructive actions.
- Create/edit post and edit profile now guard every navigation removal path, including header back, Android hardware Back, and native swipe-back gesture.
- Feed delete/block confirmations now use the same in-app confirmation UI.
- AI multi-image upload now copies every selected image into app cache and appends real native `ExpoFile` blobs through `expo/fetch`, parses response bodies only once, preserves the real API error, and removes temporary files afterward.
- Static verification only per repository rule: `git diff --check`. Runtime/typecheck remains for operator testing.

## Session update — 2026-10-05 (friend suggestions and user search)

- The friend screen now opens on API-backed suggestions while retaining separate friends, incoming requests and sent requests tabs.
- Suggestions display real public names, roles and avatars; sending a request reloads all relationship lists so the selected account disappears from suggestions and moves to sent requests.
- Account now exposes `Gợi ý kết bạn` as the discovery entry instead of duplicating a standalone friend-list shortcut already available in Community.
- User search uses the authenticated Backend search contract and keeps the known relationship state for returned friends or pending requests.
- Static verification only per repository rule: `git diff --check`. Runtime/typecheck remains for operator testing after rebuilding the Backend container.

## Session update — 2026-10-05 (friend request live refresh)

- Removed the duplicate friend-suggestion entry from Account; discovery remains in Community.
- While focused, the friend/request screen, Dashboard unread notification badge and notification inbox now refresh every fifteen seconds and stop polling when the user leaves the screen. The interval avoids exhausting the authenticated API budget while keeping two-device testing reasonably fresh.
- Notification mapping accepts the Backend's actual PascalCase enum values such as `FriendRequest` as well as snake_case values, so friend-request notifications navigate to the correct screen.
- This provides near-real-time in-app synchronization without claiming SignalR support. Native background push still requires an Expo notifications/device-token build and provider configuration; it is not simulated in Expo Go.
- Static verification only per repository rule: `git diff --check`. Runtime/typecheck remains for operator testing.
- Follow-up: navigation guard imports `useNavigation` from `expo-router` and subscribes to `beforeRemove`; no undeclared direct `@react-navigation/native` dependency is required.

## Session update — 2026-10-05 (saved community posts)

- Added Account → `Bài viết đã lưu` and route `/community/saved`.
- The screen reads `GET /api/v1/social/bookmarks`, reuses the community post cards, supports reactions, comments/detail, friend sharing, author navigation, and removes a card immediately after unbookmarking.
- Added loading, empty, error, and retry states; preview repository follows the same interface without production fallback.
- Static verification only per repository rule: `git diff --check`. Runtime/typecheck remains for operator testing after the Backend container is rebuilt.
- Saved posts now mirrors the community feed interaction model: comments use the dimmed bottom sheet, overflow actions use `PostActionsSheet`, reports stay in-app, and delete/block use the shared confirmation modal. Bookmark remains the only unbookmark control; the screen no longer navigates to post detail for these actions.

## Session update — 2026-10-05 (friends and chat synchronization)

- Friend requests now resolve real public-profile names, roles and fitness goals instead of displaying shortened user IDs; user search is debounced and refreshed whenever the screen regains focus.
- The inbox refreshes every five seconds while focused, and an open conversation refreshes every three seconds without overwriting optimistic or failed local messages.
- Opening a conversation calls the existing monotonic read endpoint for the newest incoming message, so unread counts can clear on the next inbox refresh.
- Conversation participants are enriched from public profiles and cached for the app session. Network/auth failures are no longer mistaken for a missing conversation, and the UI no longer claims unsupported online or read-receipt state.
- The current contract has no realtime socket or per-message peer-read receipt; polling and truthful `sent` status are used instead of simulating either feature.
- Static verification only per repository rule: `git diff --check`. Runtime/typecheck remains for operator testing.

## Session update — 2026-10-05 (community search)

- Replaced the three local feed category chips with one controlled search field below the Community/AI switch.
- Search waits 400 ms after typing, then calls the Backend feed with its optional `query`; it does not filter only the posts already loaded on the device.
- Plain text searches post content, author name and tags. A leading `#` requests tag-only search, for example `#gym`.
- Empty and retry copy now reflects the current search while post creation categories/tags remain intact for metadata and future filtering.
- Static verification only per repository rule: `git diff --check`. Runtime/typecheck remains for operator testing.

## Session update — 2026-10-05 (friend chat media and reactions)

- Friend chat can select and preview up to five gallery images, send image-only or mixed messages, render returned signed images, and retry a failed image message without relying on asynchronous selection state.
- Long-pressing a received message opens five common reactions: heart, thumbs-up, laugh, surprise and sad. Reaction counts and the current viewer's choice are persisted by the Backend and refreshed with conversation polling.
- The production adapter uploads images under the `chat` category before sending storage keys; preview mode implements the same repository surface without becoming a production fallback.
- Static verification only per repository rule: `git diff --check`. Runtime/typecheck remains for operator testing after applying the Backend migrations and rebuilding the API container.
- Follow-up image rendering fix: conversation polling retains each message's signed URL for ten minutes instead of replacing it every three seconds, and remote chat images use Expo's memory/disk cache with a visible load-error state.

## Session update — 2026-10-05 (realtime and rate-limit hardening)

- Added an authenticated SignalR JSON/WebSocket client without a new npm dependency. It reconnects with bounded backoff, closes while Android is backgrounded, and dispatches chat, friend and notification invalidation events.
- Chat, inbox, friend requests, notification inbox and Dashboard now refresh immediately on relevant events and retain a fifteen-second foreground-only poll as recovery rather than primary transport.
- Open chat marks a message read only when the newest incoming message ID changes. All covered pollers suppress overlapping requests, and the API client honors the server's `Retry-After` cooldown after a 429 response.
- Runtime/typecheck remains for operator testing per repository rule; static verification uses `git diff --check`.

## Session update — 2026-10-05 (account recovery)

- Completed the forgot-password flow against the verified Backend endpoints: request a reset email, enter its six-digit code with the account email and new password, then return to login after success.
- The reset form sends the required `email` field instead of a token-only request that the Backend cannot resolve to an account. It no longer depends on a local or production deep link.
- Email verification now prevents repeated resend requests with a visible 60-second countdown while retaining the Backend's neutral account-enumeration-safe response.
- Removed the unsupported end-to-end-encryption claim from the recovery screen. Static verification uses `git diff --check`; runtime/typecheck remains for operator testing per repository rule.
- Password-reset code resend uses a visible 60-second cooldown.

## Session update — 2026-10-05 (food AI handoff alignment)

- Kept the production boundary as Mobile → .NET Backend → private Python inference service; no AI credential or model endpoint is exposed to Mobile.
- Nutrition scan now consumes the Backend's optional confidence and explanatory note. The AI handoff does not provide calibrated confidence, so the contract truthfully returns `null` instead of a fabricated percentage.
- The candidate review displays the Backend note, including the model's estimated portion, while all values remain editable before persistence.
- Static verification only per repository rule: `git diff --check`. Full image inference remains blocked locally until an AI runtime and model base are installed on suitable hardware.
# Weekly nutrition plan API integration — 2026-10-06

- The weekly menu now reads the additive backend `/me/nutrition/weekly-plan?week_start=...` contract instead of adapting the legacy four-string schedule.
- T2–CN filtering now uses each item's real `day_of_week`; the selected day defaults to today.
- Adding and replacing a planned meal reuse the manual nutrition form and persist serving, calories, macros and notes to the selected week/day/slot.
- “Đã ăn” is a one-way confirmation that calls the backend consume endpoint and creates a real diary meal; it no longer toggles a local fake state. Repeated server calls are idempotent.
- Planned meals can be removed with confirmation; historical diary entries are explicitly preserved. The screen refetches on focus after add/edit.
- Mobile install/build/test/lint/typecheck/Expo commands were not run, as required by repository instructions. Runtime verification is still required on Expo after the backend container is ready.
# Nutrition scan result visual fix — 2026-10-06

- The selected camera/gallery image is copied into the Expo cache before AI upload/navigation, preventing temporary Android/Google Photos URI grants from turning the result preview into a gray frame.
- The review screen now renders the preview with `expo-image` disk/memory caching and deletes the temporary review copy after save or explicit back navigation.
- AI-detected components now use selectable bordered cards with numbered badges and separate calorie/protein/carbohydrate/fat tiles; bullet-separated `P/C/F` text was removed.
- Empty AI component results have a clear manual-entry fallback. Manual editing receives the candidate's portion and full macro values instead of only name/calories.
- Mobile commands were not run, per repository instructions; verify the camera and Google Photos paths on the Android device.
# Full ingredient review and scan-image retention — 2026-10-06

- The scan flow now retains the cached local image URI in an in-memory scan session as well as route params, so navigation cannot drop the preview reference. `expo-image` receives an explicit URI source.
- The mobile scan adapter consumes the new backend `ingredients` array. The confirmation screen lists every ingredient in full, one labeled row per ingredient, without `+`, bullets, abbreviations or “N nguyên liệu khác”.
- Whole-meal calories/macros remain a separate summary because the model does not return trustworthy per-ingredient macro allocation.
- Mobile commands were not run per repository instructions; reload the Expo bundle and perform a new scan because old in-memory scan responses do not contain the new `ingredients` field.
# Nutrition AI save validation fix — 2026-10-06

- Fixed scan-confirm save failures caused by mapping the AI explanatory `note` into `serving_unit`; long notes exceeded the backend's 50-character unit limit.
- Scan candidates now use the valid explicit portion `1 khẩu phần`.
- The API nutrition adapter now normalizes quantity/unit defensively for both create and update, falling back to `khẩu phần` instead of sending invalid descriptive text.
- Existing review state produced before this fix is also normalized at save time.
- Per repository instructions, mobile build/test/Expo commands were not run by the agent.

# Nutrition scan draft composition — 2026-10-06

- “Thêm món còn thiếu” no longer writes a separate diary entry or exits the scan flow. It creates a local candidate and returns it to the active confirmation list.
- Editing an AI candidate now updates that candidate in the same confirmation draft instead of saving prematurely.
- Added and edited candidates remain selected and participate in the displayed nutrition totals.
- The backend is called only after “Xác nhận và lưu vào nhật ký”; the selected AI/manual candidates are then saved together.
- Mobile runtime commands were not run per repository instructions.

# Weekly meal future-consumption guard — 2026-10-06

- Planned meals for future days now show “Chưa đến ngày” and disable the consumed action.
- Today and past days remain eligible for “Đã ăn”.
- The route handler independently rejects future dates before optimistic state or API calls, so UI state cannot bypass the rule accidentally.
- The existing backend check still verifies that the submitted date exactly matches `week_start + day_of_week` before writing the nutrition diary.

# Nutrition target settings — 2026-10-06

- Added `/nutrition/goals` for authenticated users to load and save daily calorie, protein, carbohydrate and fat targets through `/users/me/preferences`.
- The nutrition diary and member dashboard now consume all four target fields from the dashboard response.
- When targets are absent, the diary no longer describes `0%` or `0 kcal remaining` as meaningful progress; it presents a setup action instead.
- The settings form validates the same numeric ranges as the backend and explains that targets are personal tracking values, not medical advice.
- Mobile commands were not run per repository instructions.

# Nutrition target CTA clarity — 2026-10-06

- Replaced the ambiguous target action embedded inside the “remaining calories” pill with a full-width settings row.
- The row now has a settings icon, explicit “Mục tiêu dinh dưỡng” title, explanatory text, action label and chevron.
- The “Còn lại” pill is now display-only and appears only after a calorie target exists, preventing layout imbalance and misleading interaction affordance.

# Dashboard real-data and contextual actions — 2026-10-06

- Home now maps `today_workout`, `today_meals` and `upcoming_appointment` from the dashboard API instead of forcing workout/meals to empty values.
- Removed the hydration card because no real hydration persistence/API exists.
- Quick workout opens today's plan when available; the PT quick action opens the upcoming appointment when one exists and only falls back to trainer discovery otherwise.
- Added a visible nutrition-goal CTA when no calorie target exists, and today's meal rows open their real diary detail.
- Mobile runtime commands were not run per repository instructions.

# Dashboard quick-action deduplication — 2026-10-06

- The quick-action grid now always contains only the two true shortcuts: manual meal logging and AI meal scan.
- “Buổi tập hôm nay” is added only when the dashboard has a concrete plan/session to open directly.
- “Lịch hẹn sắp tới” is added only when a concrete appointment exists.
- Removed the workout-tab and trainer-marketplace fallback cards from the quick grid because those destinations already exist in bottom navigation.
# Workout flow implementation — 2026-10-06

- Workout plan editing now loads the backend exercise catalog and copies Vietnamese instructions, difficulty, equipment, licensed source metadata, and image media into the selected plan exercise.
- Active workouts now persist an account-device checkpoint, restore the current exercise/set/phase after interruption, pause correctly when backgrounded, and send actual completed/partial/skipped set results to the backend.
- Weight tracking now uses real empty defaults, supports backend soft deletion, and lets the member store a target weight. Workout history uses the stored monthly session target and links to a dedicated workout-goals screen.
- Added the workout goals route for target weight and monthly session count. Unset goals render as an explicit setup action instead of a fabricated zero-percent result.
- Status is `IMPLEMENTED_UNVERIFIED`: repository policy prohibited agent-run mobile typecheck/lint/test/Expo. Operator must run the documented commands and device flow after applying backend migrations.

# Workout overview discoverability — 2026-10-07

- The workout overview now loads real monthly completion statistics, workout goals and current weight alongside plans, while auxiliary-stat failures no longer hide the core plan list.
- Added visible entry points for workout goals and weight tracking, plus a monthly progress card. Returning from those routes refreshes the overview through focus-aware loading.
- The weekday ribbon is now interactive and filters plans by canonical backend weekday values (`Mon`..`Sun`). Creating a plan from a selected day carries that day into the editor.
- The plan editor now uses an explicit weekday selector instead of sending a free-text goal as `day_of_week`.
- Exercise catalog rows show the R2 start-position thumbnail, and selected exercises show labeled start/end reference images.
- Removed the duplicate create-plan CTA in the empty state. Mobile runtime/typecheck/lint commands were not run per repository instructions; operator verification is still required.

# Workout safe-area correction — 2026-10-07

- Added a route-level `workout/_layout.tsx` SafeAreaView wrapper for every nested workout screen, covering both the Android status bar at the top and gesture/three-button navigation at the bottom.
- Removed the goals screen's redundant local safe-area wrapper to prevent double top padding under the shared workout layout.
- This applies consistently to plan detail/editor, active session, summary, history, weight, goals, AI-unavailable and session-detail routes. Runtime verification remains operator-owned per repository policy.

# Workout calorie and session save follow-up — 2026-10-07

- Fixed workout-session POST to send the backend-required `Idempotency-Key`. A stable client UUID and frozen completion payload are stored in the checkpoint so a retry cannot duplicate or conflict with the original save.
- New/edited plans estimate exercise energy from the member's latest recorded weight and moderate resistance exercise (3.5 MET); rep-based exercises assume 3 seconds per rep. Rest time is excluded. This is a rough estimate, not measured energy. Missing weight displays “Chưa ước tính” instead of a misleading `0 kcal` on plan cards/details.
- Active session now shows progress, estimated completed energy, exercise media, and editable actual repetitions. Paused and preparation phases no longer present the active “Xong hiệp” action.
- Status remains `IMPLEMENTED_UNVERIFIED`: mobile typecheck/lint/runtime/device tests must be run by the operator per repository policy. Verify a new plan with a weight record and session save/retry on Android.

# Plan deletion navigation — 2026-10-07

- After a successful plan deletion, use Expo Router `dismissTo('/(tabs)/workout')` to return to the existing workout tab route rather than replacing the current nested workout screen and exposing the dashboard tab. Device verification remains pending under the mobile manual-execution policy.
- The post-session “Về lịch tập” action had the same nested-stack `replace` call; aligned it to the same `dismissTo` route. Verify both actions on-device because the prior deletion fix has not yet been runtime-tested.

# Workout preflight and guided session — 2026-10-07

- Plan detail now enters `/workout/prepare` before starting. The preflight loads the current plan and exercise catalog, shows start/end-position images and Vietnamese instructions, and asks about each required equipment type. If equipment is unavailable, it offers only bodyweight catalog items with the same primary muscle; the member explicitly selects a substitution, or opens the plan editor when no suitable item exists. Chosen substitutions are saved to the plan only on “Bắt đầu buổi tập”. No AI/personalized medical recommendation is claimed.
- Active session refreshes catalog metadata to display both position images when available. For plans whose exercise name no longer matches the catalog, the stored first image remains a fallback; end-position media may be unavailable. The app does not guarantee image loading without access to the signed R2 URL.
- The first exercise starts immediately after preflight. Between exercises, the five-second preparation countdown now has a working “Bắt đầu bài” action. The restore checkpoint is offered explicitly rather than silently resumed; discarding it starts a fresh session. Checkpoint storage is scoped to the authenticated user ID so another account cannot resume it. Existing Vietnamese speech cues were wired to the visible audio toggle.
- Estimated session kcal now uses recorded repetitions or timed seconds for each non-skipped set, so 8 actual reps no longer count as 10 planned reps. It is still a rough 3.5-MET estimate, not a measured calorie value.
- Workout overview now labels a plan “Đã tập hôm nay” from completed server sessions for the local day; the plan remains reusable. Monthly completed count excludes early-ended sessions and sessions from other months.
- `IMPLEMENTED_UNVERIFIED`: no mobile install/build/typecheck/lint/test/Expo/device run was performed under repository policy. Operator must verify equipment yes/no, substitution persistence, 2 signed images, actual-rep kcal, checkpoint resume/discard, voice, save/summary, and today/month badges on Android.

# Automated mobile verification and code fixes — 2026-10-07

- At the user's explicit request, ran mobile `npm run type-check`, `npm run lint`, and `npm test -- --run`. TypeScript passes, lint exits successfully with 0 errors and 151 pre-existing warnings, and all 199 tests across 28 files pass.
- Fixed stale community/chat typings and preview fixture, corrected design-token and React Native style references, and isolated native Expo modules from Node-only unit tests without changing runtime imports. Updated test expectations for Vietnamese API errors, permission-setting actions, social request IDs, and the current backend contract revision.
- Automated verification does not prove on-device behavior. Android checks remain necessary for the workout preflight, images, session save, navigation, and signed media URLs.

# Workout history and skip confirmation — 2026-10-07

- Added a visible back button to workout history, including its loading and error states; it returns to the workout tab.
- Skipping an exercise now asks for confirmation. Cancel keeps the current exercise; confirm marks only unperformed sets skipped. The backend still receives null actual reps/duration for skipped sets, which truthfully means no performance was recorded.
- Summary and session detail display the planned reps or duration for skipped sets instead of rendering null/undefined; actual completed sets still display their actual values. This uses the backend's planned fields in the session-detail response.
- Mobile `npm run type-check` passed and `npm test -- --run` passed (202/202, 29 files). Android interaction verification remains pending. No commit or push was made.

# Workout history follow-up — 2026-10-07

- Session detail now has a visible back action (also on its error state). Removed the hard-coded 3,450 kg volume metric from the detail screen and corrected the total exercise count to use the session snapshot item count rather than duplicating the completed count.
- History can navigate to previous months and back to the current month, recalculating the visible session list and month metrics. Its filters now use actual completed/ended-early status rather than a non-existent pending-offline synchronization flow. Removed the always-zero volume summary and changed list badges to real workout status.
- Mobile `npm run type-check` passed and `npm test -- --run` passed (202/202, 29 files) after stabilizing the rate-limit test's Retry-After fixture. On-device visual/navigation verification is still pending. No commit or push was made.

# Workout copy for members — 2026-10-07

- Removed technical cloud/offline/sync banners from the workout result and session-detail screens. Session detail now shows a simple “Kết quả đã lưu” label and explains that editing a plan later does not change past results.
- The result screen says the workout is saved to history, and uses neutral saved wording when a session ended early instead of claiming full completion. History badges still distinguish completed from ended-early sessions without sync terminology.
- Mobile `npm run type-check` passed; `npm test -- --run` passed (202/202, 29 files). Device review remains pending; no commit or push was made.
# PT booking integration follow-up — 2026-10-08

- Replaced mock booking slots/services with actual verified-trainer services and open availability. Hold creation now uses the selected server UTC slot and cannot proceed from fallback sample data.
- Booking confirmation loads the server hold/appointment and quoted price; payment creation sends a stable Idempotency-Key based on the hold ID.
- Replaced the PT session screen's fictional learner, price, venue, status, and local-only action buttons with owner-scoped appointment details and real confirm/start/complete/cancel mutations. Completion now correctly waits for member confirmation. Removed the unsaved coaching-notes input because no write contract exists.
- Removed invented five-star/verified PT fallback and invented gym location in appointment presentation. PT overview now excludes unpaid holds from upcoming sessions and resolves the service name from the actual PT profile.
- Mobile `npm run type-check` passes; `npm test -- --run` passes (202/202). Android, backend integration, payOS callbacks, cancellation/refund, and admin settlement were not verified in this session. These flows must not be called release-complete yet. Existing unrelated workout changes were preserved; no commit or push was made.

# PT service information and booking selection — 2026-10-08

- PT service editor now collects purpose (1–1 or assessment/plan), direct/online mode, audience, equipment, deliverable and one fixed venue/address for direct sessions; it validates a meaningful description. Online services are clearly labelled draft/unbookable until backend Google Meet integration is ready.
- Trainer detail and booking cards show the PT-supplied content instead of a fabricated venue. Booking only lists active direct services with a real venue/address, hides published slots shorter than the chosen service, filters starts inside 30 minutes, and clears a stale selected slot/service when data changes.
- Mobile TypeScript check PASS; focused PT API/booking tests PASS 17/17. Backend PostgreSQL integration tests for PT bookability PASS on an isolated test database. Device visual and end-to-end booking/checkout verification remains pending. No commit or push.
- Refreshed the pinned backend OpenAPI hash after the PT contract update; the complete mobile unit suite now passes 203/203 across 29 files. This remains local code verification only, not device or live payOS/Meet/SMS verification.

# Mobile commit handoff — 2026-10-08

- Committed PT booking/service UI and API alignment (`2607a5e`) and the phone verification API calls (`fee9901`).
- Committed workout session, preflight and history changes (`ccae3d7`), community/chat compatibility fixes (`5918dfd`), and preview/native test fixtures (`ce574ac`).
- These commits do not establish Android device, live payment, SMS or Google Meet release readiness. No push or production deployment was performed.

# PT online single-session client — 2026-10-10

- PT service editor now offers Google Meet connect/disconnect and explicit status refresh. OAuth opens the backend-provided URL; no Google secret is stored in the app.
- Trainer booking selection includes active online services. After verified payment and confirmation, appointment detail fetches the participant-scoped Meet URL and opens it in the device browser/app. The existing under-48-hour pre-payment warning remains.
- Updated the OpenAPI pin to match the backend's additive Google Meet and booking-link operations. Local verification before this handoff: TypeScript type-check PASS and mobile 203/203 tests PASS; no real Android/OAuth/Meet/payOS transaction has been exercised.
- Package 4/8 checkout and package-stop remain unimplemented; do not expose them from mobile. Live SMS/Google/payOS credentials, backend app DB migration and two-account device testing remain operator gates.

# PT package stop Mobile follow-up — 2026-10-10

- Objective: expose only the server-backed package read/stop path, not public purchase. BE OpenAPI baseline `edba4ce` was pinned in `docs/production/contract-baseline.json`; current package stop POST requires `expected_refund_quote_vnd` from the preview and an idempotency key. BE local verification passed 963 unit / 85 integration tests before this handoff.
- Added Member and PT package list/detail routes, member refund preview/reason/request/withdraw, and assigned-PT acceptance. The UI displays each session's current allocation and distinguishes an approved refund request from a completed bank transfer. It refreshes after a 409 and retains the same key on an uncertain network outcome.
- Git: FitmateAI_FE `main`, prior HEAD `6aa12b1`; the owner explicitly requested implementation and commit in the next turn. `npm run type-check` PASS, `npm test -- --run` PASS (206/206), `npm run lint` 0 errors / 147 warnings across the repo before removing one new array-style warning. Expo and Android device UAT were NOT RUN. No package payment or production service was called.
- Next: test Member/PT on Android with existing server package data; verify 409 quote changes, uncertain POST outcomes and reason-field keyboard behavior. Checkout remains blocked pending BE public route, incident/penalty flow and live provider gates. Do not present these screens as release-ready.

# OpenAPI pin after Admin package read — 2026-10-10

- BE `d2689e2` added only Admin package list/detail routes and kept the Mobile package wire shape. Updated the raw-file OpenAPI SHA-256 pin. Mobile contract-drift test must pass against this sibling BE checkout; no new Mobile runtime change was needed.

# PT package purchase path — 2026-10-11

- Added a Member route to choose 4 or 8 open PT slots, create one server-side package hold, and continue to participant detail. Detail shows the server-calculated package total and opens only an HTTPS PayOS checkout after an explicit confirmation, including the under-48-hour cancellation warning. Return to the app reloads package/payment status; it never marks the package Paid from a redirect.
- Updated the OpenAPI hash pin against the sibling BE working tree. Mobile typecheck passed; lint passed with pre-existing warnings. Backend isolated tests passed 967 unit and 91 integration. Real Android, PayOS, Meet, SMS and operator UAT were not run. The app database still needs an approved backup and migration before this new server code can serve real users.

# AI Plus account entry — 2026-10-11

- Added a read-only `Gói AI của tôi` entry and screen backed by `GET /me/ai-usage`. It distinguishes loading, error, disabled enforcement and active usage; it states explicitly that AI Plus is not yet on sale. It does not show a fake price or purchase-success button. The Backend OpenAPI working-tree hash was pinned in `docs/production/contract-baseline.json`.
- No native IAP library was installed and no build/typecheck/device test was run under the repository's manual-execution workflow. Before selling, use a compatible native Billing integration in a Play internal-testing build, wire purchase-token verification and entitlement status to BE, then verify price/restore/cancel/refund on real accounts. Expo Go cannot test native purchases.

# AI Plus native Google Play flow — 2026-10-11

- Added `expo-iap` 6.0.0 plus its Expo config plugin and converted the AI-plan screen from read-only inventory to a real Google Play flow. It reads the localized monthly price/offer from Play, buys `fitmate_ai_plus`, sends the purchase token to authenticated Backend verification, restores purchases, and opens Play subscription management. It never grants Plus from the client callback and never stores Google credentials in Mobile.
- The screen hides native checkout in Expo Go and when Backend billing is disabled. Plus/free usage and expiry come from Backend. Pending transactions remain pending; canceled renewal can remain Plus until verified expiry. A native development/internal-testing build installed through Google Play is required for real purchase UAT.
- Updated the contract pin for `/me/ai-subscription` and `/verify`. Evidence: TypeScript passed; targeted billing lint passed; full lint returned 0 errors and 146 existing warnings; all 208 tests passed; Expo config introspection included `expo-iap`. `npm audit` still reports transitive Expo/Metro findings (including critical `shell-quote`); force-fix would make breaking SDK changes and was not applied.
- External gates: create Play app/package/product/base plan, set localized price, add license testers, configure Android Publisher service account only on Backend, build/sign/upload AAB, then test purchase/restore/cancel/renew/refund on real Play accounts. No live purchase has occurred and the changes are uncommitted.

# Android usage Analytics — 2026-10-12

- Added optional React Native Firebase Analytics integration for a native Android build. `google-services.json` is never committed; `FITMATE_FIREBASE_ANDROID_FILE` enables the config plugins and native build. Expo Go and builds without this file keep Analytics unavailable.
- Collection and automatic screen reports are disabled by default. An authenticated user can opt in/out from Settings; the app tracks only allowlisted top-level screen names, without IDs, chat content, images or health data. User change resets the native Analytics identity. Backend GA4 reporting remains read-only and separate from business KPIs.
- Pinned the Backend OpenAPI SHA256 at revision `25bbf8b`. Firebase/GA4 project and Android config have not been created, so native collection and live dashboard data are still an external UAT gate. Setup steps: `FitmateAI_BE/docs/backend-release/ga4-setup.md`. No push or production deploy.
# Release fake-data isolation — 2026-10-18

- Removed unused mock-backed FriendButton, PostCard, CommentSection and postsStore with their barrel exports after confirming the active screens use API repositories instead. Preview repositories and fixtures remain for development/tests, but preview data and the sample route are now denied in release builds even if public preview flags are set.
- Centralized API base URL validation: development may use the emulator default; release requires an explicit HTTPS `/api/v1` URL and rejects local loopback hosts. This prevents a distributable build from silently targeting an emulator-only API.
- Mobile type-check passed; lint completed with 0 errors and 143 warnings. Tests passed 207/208; the one failing contract-drift check reports that the backend OpenAPI hash differs from the pinned mobile baseline. Do not update the hash without reconciling the contract.
- Existing user change to `mobile/package.json` was not included. This cleanup does not certify Play signing, backend/admin UAT, payOS operations, or production release.

# Remove mobile fixture data — 2026-10-18

- Removed the sample-preview route, seven preview repositories, mock user service, and fixture users/content. All seven repository selectors now resolve only to API implementations; the capabilities request no longer returns preview-only payment/notification flags. Kept real media preview UI (e.g. selected image previews).
- Replaced preview-specific repository tests with API-only selection checks and updated the capabilities test to verify fail-closed behavior even with an old preview flag.
- Reconciled the OpenAPI drift: BE `25bbf8b..10d58cc` adds only payOS webhook probe wording and two browser return/cancel handoff GET routes. No mobile wire type used by existing callers changed. Updated the SHA-256 pin to `10d58cc`; this does not constitute payment UAT or release approval.
- Type-check passed and full tests passed 166/166 after the pin update. Reduced test count reflects deleted preview-only scenarios; the API-only selection checks remain. Existing user change to `mobile/package.json` remains excluded from the cleanup commit.
- The current generated (Git-ignored) `mobile/android/app/build.gradle` was changed locally to reject release signing with the debug keystore and require four `FITMATE_UPLOAD_*` variables. This is **not persistent across `expo prebuild --clean`** and cannot count as a repository-level release fix until implemented in a tracked config plugin or EAS build profile. The owner must hold an upload keystore securely. No signed AAB or Play device UAT has been run.

# AI Plus prepaid copy — 2026-10-18

- The owner selected a prepaid one-month AI Plus Play plan (199,000 VND target price), without automatic renewal. The AI plan screen now describes a one-time period and no automatic charge, and no longer offers a misleading cancel-renewal action. The price remains sourced from Google Play; Backend checks the prepaid line-item type and exposes separate new-sales/restore flags. Restoration remains visible after sales close. The additive `restore_available` wire field was mirrored in the mobile API type and its OpenAPI hash pin.
- This mobile edit has not been type-checked, built or device-tested in this session. Existing user edit to `mobile/package.json` was left untouched. Play Console configuration, Play-installed purchase/restore/expiry UAT and AI model availability remain external gates; do not mark the paywall verified.

# PT package payment status follow-up — 2026-10-18

- Current Backend and Mobile code already expose 4/8-session hold and PayOS checkout; older notes saying checkout is disabled are historical and no longer describe the source tree. The Admin package panel remains read-only by design; refund and payout actions live in Finance.
- After a package checkout, the detail screen now checks Backend status every five seconds for at most one minute while `PaymentPending`, and provides manual refresh. It warns the member not to pay again while confirmation is unclear. A PayOS browser return never marks the package paid locally. The creation screen now explains when available slots are fewer than the chosen 4/8 count instead of silently disabling continuation.
- User confirmed written PayOS approval for the teammate's BIDV merchant and chose real payments during closed testing. This is an operator statement, not live transaction evidence. No Mobile build/typecheck/device test or real PayOS transaction was run in this session under the repo's manual-execution rule. The owner must run the checks and supervised two-account payment/refund/payout UAT before release approval.

# PT package-specific prices — 2026-10-18

- Owner chose separate PT-set prices for four- and eight-session packages. The PT service form now accepts each optional price; blank/zero disables that package size. The member package page shows Backend-provided totals and only offers enabled sizes, while still requiring all four/eight slots before checkout. The service-selection CTA is hidden when neither package size is offered.
- Mirrored the additive Backend service fields in API types and updated the pinned OpenAPI SHA-256. Package hold and PayOS totals remain server-authoritative; Mobile does not calculate the charge from unit prices or mark a browser return as paid.
- No Mobile install/build/typecheck/test/Expo run or live payment was performed here under the repository's manual-execution rule. Existing user edit to `mobile/package.json` remains untouched. Run those checks, apply the Backend migration to the intended database after backup, then complete PT/member real-device package checkout and Admin refund/settlement UAT before release approval.
# Brand color alignment — 2026-10-19

- Aligned the Stitch-derived mobile `primary`, `primaryDark`, and `primaryLight` tokens with the approved Fitmate mark (`#0F766E`) and existing Soft Energy palette. The in-app BrandMark now reads the primary token. Screen background remains light; `success` remains a separate green semantic color.
- Updated the design-token assertions. Static `git diff --check` found no whitespace errors. Per the repository manual-execution rule, no mobile build, typecheck, test, or device QA was run; visual verification is pending. Existing unrelated `mobile/package.json` and `mobile/build-release.ps1` changes were preserved. No commit or push.

# Registration community terms — 2026-10-21

- The existing required, initially unchecked registration consent now explicitly names the Terms, Community Rules, and Privacy Policy. Separate accessible links open `https://fitmate.site/terms/` and `/privacy/`; registration still stops without consent. The landing repository gained the public Terms and Community Rules page with the owner's prohibited-content decisions and a footer link.
- IMPLEMENTED_UNVERIFIED: no mobile build/typecheck/test/device check or production deploy was run under the manual-execution rule. Deploy the landing page before distributing a build with its link, then verify both links and the unchecked/checked registration paths on a device. Backend does not yet store a versioned consent receipt; do not claim an auditable server-side consent record.
- Preserved pre-existing `mobile/package.json` and `mobile/build-release.ps1` changes. No commit or push.
- User-reported verification: mobile type-check completed without reported errors; lint returned 0 errors and 129 warnings. Full Vitest initially had 168 passed / 1 failed: a legacy PT revenue fixture was created before the test's frozen September 2026 clock, so the October 2026 run yielded zero for both owners. Adjusted that test only to place both fixture owners in the fixed test period and assert both KPIs are positive and distinct. User reran Vitest: 25 files and 169 tests passed. Production money logic was not changed.
- Release configuration gate: the local `mobile/.env` API base URL still points at a temporary trycloudflare host. The owner configured the separate Nginx `api.fitmate.site` host and issued a Let's Encrypt certificate; a read-only public probe of `/api/v1/system/capabilities` returned HTTP 200 and `environment=production`. Update the local mobile public base URL to `https://api.fitmate.site/api/v1` before building an AAB. No secret values were printed or changed.
- Owner updated the local mobile API URL and created/backed up a 3072-bit RSA upload keystore outside Git at `.android/fitmate-upload.jks`. Added `mobile/build-release-secure.ps1` because the pre-existing untracked `build-release.ps1` takes passwords as command-line arguments. The new script prompts without echo, validates the API URL and signing inputs, builds with Gradle, and clears signing environment variables afterward. It has not been run. The ignored native `android/app/build.gradle` currently requires release signing variables, but this guard would be lost after `expo prebuild --clean`; do not regenerate native files before fixing that persistently.

# PT certificate upload on emulator — 2026-10-21

- Owner built a signed AAB and installed a debug build on Android emulator. The emulator can GET `https://api.fitmate.site/api/v1/system/capabilities`; Nginx access log records PT registration, email verification, login and token refresh, but no POST `/api/v1/uploads` after the attempted certificate submission. The app displayed its generic status-0 network error. This isolates the observed failure to the client upload path before an HTTP response; native failure details are not yet proven.
- Changed certificate-image upload from a React Native FormData object passed to `fetch` to the existing native `apiUploadFile` helper, preserving the `/uploads` category, bearer token, MIME and 413 handling. Updated the two-step unit test to mock/assert native multipart upload. This is IMPLEMENTED_UNVERIFIED: per the repo's manual-execution rule, the owner must run the focused test/type-check and retry on emulator. The previously built AAB does not contain this change.
- The same production capabilities response reports `ai.enabled=false` and `payments_enabled=false`, and returns policy URLs on `fitmate.vn` rather than the deployed `fitmate.site`. These are release gates for the owner's requested fully functional closed testing; do not represent them as enabled merely because the API is reachable. No production config, data or payment was changed in this session.
- Emulator PT certificate screenshot shows the phone-verification banner is present at the top; it is a tappable route to `/pt/verify-phone`. Admin approval still requires a confirmed Identity phone number, and backend SMS OTP start fails closed with 503 when `Sms__Provider`/token are not configured. No SMS delivery has been demonstrated. The PT stack lacked a top safe-area inset on most screens, allowing the status bar to overlap headers; added the inset centrally while exempting `verify-phone` and `packages`, which already own their top safe area. This layout change is unverified on device and is not in the prior AAB.
- Owner feedback: the phone banner looked informational, not actionable. Changed it to an informational card with an explicit 48dp-high primary `Xác minh số điện thoại` button, routed through the existing callback. No auth/SMS condition was bypassed. Manual type-check and emulator visual/tap verification remain pending.
- Root cause of the apparent no-op tap: `PtVerificationGate` redirected every unapproved PT route except certificates/auth back to `/pt/certificates`, including `/pt/verify-phone`. Added that exact onboarding route to a narrow allowlist and a focused pure-route test; other PT routes remain blocked. Manual type-check/test and emulator confirmation are pending. Existing signed AAB predates this fix.
- PT contact copy follow-up (2026-10-22): owner reported that the saved-phone modal and SMS caveat confused end users. After a successful save the screen now returns directly to the certificate page; the contact card shows the saved number with a neutral success icon and a clear Edit action. Removed SMS language from the contact form and card. This is wording/navigation only; no phone-ownership verification is claimed or added. No install/build/type-check/test/device run was performed under the manual-execution rule; the currently installed app/AAB does not include this change until rebuilt.
- PT Account Hub navigation follow-up (2026-10-22): the PT-space card opened `/pt` for an unapproved PT. That screen immediately queried the public trainer profile, which is intentionally unavailable before approval and surfaced a misleading 404. The card now labels the unapproved destination as PT onboarding and opens `/pt/certificates`; `/pt` itself redirects unapproved accounts before requesting overview data. Approved PTs still reach their dashboard. Static diff check passed; type-check/device verification is delegated to the owner by the manual-execution rule. The installed AAB predates this routing change.
- Approved PT dashboard follow-up (2026-10-22): owner confirmed the PT account is approved but `/pt` still displayed a 404 after tapping its Account Hub card. The overview had a hard dependency on the anonymous marketplace profile (`GET /trainers/{id}`), which is not guaranteed to exist immediately for a newly approved PT. The overview now takes name, service status, and booking service names from authenticated self endpoints, treats only marketplace-profile 404 as missing optional review data, and hides rating instead of showing a fabricated zero. Other API errors still surface. Source/static diff check only; the owner must type-check and rebuild/reload the emulator under the repo manual-execution rule. No production deployment, commit, or push.
- PT dashboard layout follow-up (2026-10-22): owner screenshot showed shortcut tiles visually left-weighted on the emulator. Centered the two-column shortcut grid and each tile's icon/labels, gave tiles a consistent minimum height, and centered the adjacent section headings. Static diff check only; owner must verify on narrow and regular Android screens. No build/test/Expo run, commit, or push under the manual-execution rule.
- PT certificates request-loop follow-up (2026-10-22): the certificate screen's fetch callback depended on `user` and wrote a fresh `user` object whenever an approved certificate appeared. This re-created the callback and re-ran its effect indefinitely. The fetch now depends only on the stable React state setter and updates PT status functionally only when it actually changes; the submit path uses the same guarded update. Source/static diff check only; owner must type-check and verify one load/refresh cycle on the emulator. No build/test/Expo run, commit, or push under the manual-execution rule.

# Google Play AD_ID release follow-up — 2026-10-23

- Play Console advertising ID declaration is set to No. The previous signed AAB still contains `com.google.android.gms.permission.AD_ID` from Google measurement libraries. Added `android.blockedPermissions` in `mobile/app.json` and a native manifest merge removal rule for the current generated Android tree.
- `:app:processDebugManifest` succeeded and its merged manifest excludes AD_ID. `:app:processReleaseManifest` cannot configure without upload-signing environment variables; the upload password is not available to the agent. The old AAB remains unchanged and must not be uploaded as the new build. Owner must run `mobile/build-release-secure.ps1`, enter the password locally, then inspect the release bundle manifest for AD_ID before Play upload.
- Unrelated untracked `mobile/build-release.ps1` and both feature graphic files were preserved. No commit/push or production deployment.

## 2026-10-28 — Authorized automated verification
Owner authorized tests: TypeScript passed; 242/242 mobile tests (45 files) passed including media references and contract baseline. BE unit 1072 passed; integration project compiles. No app/emulator launch, native build, or VPS deployment. Manual local run and local/VPS differences: backend docs/backend-release/runbooks/r2-mobile-parity.md. Real R2/provider device flows remain owner acceptance work.

## 2026-11-03 — AI entry checks and editable suggestion plans

- Committed prior R2 media and tab refresh fixes separately (ab0e4c1, 40ebda6); unrelated feature graphics and build-release.ps1 remain untracked.
- Scan checks live capability and scan quota before offering camera/library, provides manual-entry route while unavailable, and keeps the selected image for retry on recognition failure. No Kaggle provider configuration was invented.
- Workout suggestion screen checks capability/chat quota, preserves form on failure, guards duplicate sends, and uses keyboard avoidance. Generated exercises are staged in owner-scoped memory and passed to the existing plan editor for name/day/exercise review and real createPlan API save. Draft is cleared only after a successful save; missing/cross-account drafts cannot be viewed/saved. Duration defaults to an editable 45 minutes; calorie estimate starts unknown (0 per existing editor convention).
- Verification: TypeScript passed; full mobile suite 248/248 passed across 47 files (including six new access/draft cases). No emulator/app launch or AAB build. Camera/keyboard, authenticated AI generation/save, and real push delivery still need Android UAT.

## 2026-11-03 — Android debug DEX memory failure
Owner debug build failed at mergeExtDexDebug with java.lang.OutOfMemoryError. Project used 2 GiB heap and parallel builds; host has 15.9 GiB RAM with only 1.6 GiB free at inspection. Increased Gradle heap ceiling to 4 GiB, bounded workers to 2 and disabled project parallel execution. No app/emulator/build started. Owner should close unused memory-heavy applications, stop old Gradle daemons, then rerun npm run android; compile success remains unverified.

## 2026-11-04 — Comment composer keyboard gap
Owner screenshot after docking Gboard shows excessive gap above keyboard. CommentsSheet retained bottom navigation safe-area padding while KeyboardAvoidingView already moved its bottom above the keyboard. It now listens to keyboard show/hide, omits only the bottom safe-area edge while keyboard is visible, and restores the inset on hide; left/right protection is retained. Added a regression case for keyboard-visible safe edges. Device visual confirmation pending; no emulator/app launched by agent.

## 2026-11-04 — Collapse comment replies
Comments now show roots only by default with an exact loaded reply count. Each expand reveals up to five more replies, with an explicit collapse control; expansion resets per post/open state. Sending a reply opens its root thread so the new reply remains discoverable. Reply-to-reply submissions attach to the root thread rather than creating a third hidden nesting level. Existing API comment payload/pagination is unchanged; count reflects replies supplied by the server in the post view model. Added initial collapsed rendering regression test.

## 2026-11-04 — Release version and Git synchronization
Set app.json version 0.1.2 / Android versionCode 3, matching the ignored local native build.gradle. Replaced the untracked legacy release script with a secure wrapper that delegates to build-release-secure.ps1 rather than accepting passwords in command arguments. Include existing Play feature graphics as release assets. Native android directory remains ignored; app.json is the tracked version source and secure build validates native parity. No AAB build/upload performed.

## 2026-11-04 — Adaptive Android window and system bars
Owner requested fixes for Play warnings. Changed Expo orientation from portrait to default; added idempotent withAndroidAdaptiveWindow plugin to remove MainActivity orientation/aspect constraints, set resizeableActivity=true, retain edgeToEdgeEnabled=true, and remove obsolete app-theme system bar color/translucency/opt-out items. Applied changes directly to ignored native manifest/styles without prebuild or signing changes. Removed per-screen React Native StatusBar backgroundColor/translucent overrides; root Expo StatusBar still owns icon style and screens keep safe-area layout. Secure release script now rejects stale orientation restrictions. No emulator rotation/large-screen UAT or signed release build performed. Third-party deprecated calls and final Play warnings must be checked against the new bundle; no claim all dependency warnings disappeared.

## 2026-11-04 — Bound repeated-screen loading
Owner reports account/system screens spinning after navigation, recovering only after app restart. Inspection found no total deadline for apiClient/refreshSession and an unbounded global Retry-After wait; Account Hub swallowed errors into console only. Added linked caller/session cancellation and total deadlines (normal API 30s, AI paths 90s, refresh 20s), including stalled response parsing/native fetch ignoring abort. Bounded rate-limit wait at 15s without automatically retrying mutations. Account Hub now exposes load errors and retry. Session race tests wait for actual in-flight request before switching accounts; added four deadline tests. TypeScript and full suite 256/256 passed (49 files). This limits hangs but does not establish the backend root cause; real device reproduction/server logs remain needed. No app or emulator started. Current Play AAB does not contain these changes.

## 2026-11-04 — Login email entry usability
Added native username/current-password autofill hints and explicit autofill importance. Email next action focuses password; password submit triggers guarded login. While email is focused, optional gmail.com/outlook.com/yahoo.com completion chips narrow by typed domain and fill only after explicit tap. No new credential/email persistence or fake login data. TypeScript passed; real Android Autofill/Gboard behavior remains device UAT. Previous network fixes were already committed/pushed as 58795ec.

## 2026-11-04 — Saved email suggestions and AI title keyboard
Owner clarified email suggestions mean previous successful logins. Removed domain completion chips and added device-local SecureStore history of up to five successfully authenticated email addresses, case-insensitive deduplication, explicit selection, and per-address forget action. No passwords saved; history survives ordinary logout by using a separate non-session key. Pre-existing addresses cannot be reconstructed retroactively. Native credential autofill remains enabled.
Moved ModalShell keyboard avoidance outside the entire backdrop/content, enabled Android height avoidance, added modal-local safe-area context, omitted bottom inset while keyboard is visible, and reduced fixed bottom padding. Applies to AI create/rename title dialogs and other shared modal users; device visual confirmation still needed. TypeScript passed; full suite 259/259 passed before adding two modal regression cases; targeted history/modal suite passed 5/5 afterward.

## 2026-11-06 — Rapid navigation and chat upload recovery
- Replaced single-file legacy upload transport with native Blob multipart through the shared authenticated client: deadline, one refresh retry, session cancellation, and temporary file cleanup now apply. Unique temporary paths prevent parallel chat uploads overwriting one another. Backend file/files fields verified against AiChatController; no mock or provider secret added.
- Removed global rate-limit sleeping across unrelated routes. Rate-limited paths fail promptly with 429, scoped by session generation; other screens remain usable. Delayed 401 responses reuse a token already refreshed by another request instead of refreshing repeatedly. Retry retains the original total deadline.
- Chat inbox/conversation refresh guards now belong to each focus lifetime, so an old request cannot suppress a new focus load. Any successful refresh clears initial loading, including recovery through realtime/poll. Initial loads no longer depend on transient AppState activation. Failed sends expose the API error rather than a silent failed icon alone.
- Android review: app-owned obsolete bar settings remain removed by the existing plugin. Installed React Native 0.86.3 WindowUtil.kt still includes deprecated window color/contrast calls. No dependency source patch, mass upgrade, or assertion that Play warning is cleared. Need expanded Play warning call sites and new bundle/device verification to choose a compatible upstream fix. No native build/app/emulator launch or VPS change.
- Verification: TypeScript passed; full mobile suite 265/265 across 52 files passed. Real-device upload/navigation and Play warning confirmation remain pending.

## 2026-11-06 — Play code 3 deprecated-window call-site attribution
- Owner supplied exact warning for 3 (0.1.2). Local release mapping resolves D9.k to react-native-screens FormSheetDialog (with Material BottomSheetDialog methods inlined), R5.d to React Native StatusBarModule$setColor$1. p7.h is an R8 synthetic API outline; its generated class name is not sufficient to blame GoogleSignatureVerifier or remove Firebase.
- Direct named sites belong to React Native StatusBarModule/WindowUtil, Material date picker, Expo image picker. Installed RN 0.86.3 still contains get/set status color and set navigation color for compatibility; expo-image-picker delegates edge-to-edge to AndroidX. Date picker declares Material 1.12.0, resolved Gradle dependency version still needs inspection before an override.
- App config removals cannot erase these library call sites. No unsupported node_modules edit, reflection workaround, warning suppression, SDK downgrade, or unverified dependency upgrade applied. Warning on uploaded code 3 cannot be changed by a VPS rollout. A future signed bundle and Play/device check are required to establish resolution. Official behavior reference: https://developer.android.com/about/versions/15/behavior-changes-15 . Expo issue 47323 was closed for missing reproduction, not evidence of an upstream fix.

## 2026-11-06 — Material compatibility update and next release preparation
- Verified the previous release merger resolves Material 1.13.0 (despite datetimepicker declaring 1.12.0). Pinned stable Material 1.14.0 with a durable Expo app-Gradle plugin and applied it to the existing ignored Android tree. Upstream includes Android 15 edge-to-edge fixes and requires minSdk23; project minSdk24/compile36 satisfy that baseline. Strict version keeps transitive upgrades deterministic. No node_modules patch or broad Expo/RN upgrade.
- Secure release entry now rejects a native project missing the reviewed Material constraint. Prepared tracked app.json and ignored native Gradle for version 0.1.3/code4, superseding uploaded code3.
- TypeScript passed; full suite267/267 across53files passed. Native dependency/resource validation in progress. First Gradle inspection lacked ANDROID_HOME, retried with process-scoped SDK environment. No app launch/install or signed AAB built.
- Remaining limitation: Expo57 pins RN0.86.3; npm registry has no newer stable0.86 patch at inspection. RN native statusbar/window compatibility code still contains deprecated calls, so Material update alone is not proof that every Play advisory disappears. Do not claim full warning clearance or force an incompatible RN major version; future bundle/device and Play evidence required.
- Native verification succeeded: dependencyInsight confirms app runtime resolves Material1.14.0 for datetimepicker/screens/router; checkDebugAarMetadata and processDebugResources passed (223tasks,2m10s). This is dependency/resource validation, not a signed bundle or visual/device UAT.

## 2026-11-08 — Chat-only AI Plus and food scan coming soon
Owner changes AI Plus target to29,000VND per prepaid month (no renewal), excludes food scan from paid benefits. Removed scan quota/benefit from the plan page, clarified shared chat/workout quota, kept Play-sourced price only (must be29k in Console). Release scan page never opens camera/library or calls inference; shows Coming soon plus manual entry. Home/nutrition entry labels now disclose Coming soon. An explicit debug-only EXPO_PUBLIC_FOOD_SCAN_DEMO opt-in preserves local Kaggle review; never enables release scanning.
Chat checks live capability/shared quota before sending, shows remaining/limit with plan navigation, refreshes quota after success/failure and guards concurrent sends; composer preserves text when sending is refused/fails. Added native Android build header and prepared0.1.4/code5; backend now hides new sales on older clients that still promise paid scanning. Purchase/restore verification does not trust the header. Contract baseline refreshed for header behavior only; no response shape change. TypeScript passed and272/272 tests passed across54files before final hash/docs refresh. No native build/emulator/app/install/upload. Real Play product29k, service-account verification key, backend rollout and payment UAT remain required; no claim opening sales. Existing earlier changes are preserved and uncommitted.
- Final verification: TypeScript and full272/272 mobile tests passed after source changes; final focused16/16 also passed after native build-header test and contract baseline refresh. Backend1090/1090 unit tests passed. Public release/native UI and real Google billing await operator credentials and UAT.

### 2026-11-08 — Internal checkout missing on build 5
- Root cause: Expo Constants SDK 57 Android does not export nativeBuildVersion. Transport omitted the compatibility header, so backend correctly hid new sales despite SalesEnabled=true in VPS env. Read the embedded expoConfig.android.versionCode instead (presentation compatibility only; purchase entitlement still verified server-side). Regression fixture now matches SDK 57 and checks GET subscription plus upload headers.
- Existing installed code 5 cannot receive this JS fix automatically; next signed Play build and device checkout acceptance still required. No backend gate weakened, no secrets changed.

### 2026-11-08 — Welcome, AI plan and nutrition refresh UX
- Welcome explicitly protects bottom system insets and centers a compact content/actions group instead of expanding the hero across the viewport. Scroll retained for small screens/font scaling.
- AI plan removes long introduction, scan and duplicate expiry paragraphs; retains 100 shared daily uses, Play price, prepaid month/no automatic renewal, restore and manage only for entitled users.
- Nutrition invalidates old focus requests on blur, clears previous errors when retrying, ignores cancellation errors, adds initial-load retry and a compact honest stale-data notice with retry. Does not invent data or conceal failed refresh; exact production request failure still requires device/network evidence.
- TypeScript passed. Android visual/keyboard/system-navigation and real Play checkout acceptance remain operator tests; no app launched or installed.

### 2026-11-08 — Prepare next internal Android bundle
- Updated tracked app.json and existing native build.gradle to0.1.5/code6 (previous internal5/public4). Includes checkout header correction and welcome/plan/nutrition UX changes.
- Full273/273 tests and TypeScript passed before version-only bump. Secure release script requires operator to enter upload-keystore password privately; signed AAB not produced by agent. Retain code5 artifact/mapping until new build succeeds.

## 2026-11-09 — Same-device Play billing ownership
Gói AI: guard async callback/load by session generation; remount billing per Fitmate user. Refresh subscription before quota. Before opening checkout, inspect existing Play purchases via real verification: restore current owner or stop for foreign/pending purchases. Restore tries all matching tokens rather than letting the first foreign token hide a valid own purchase. Backend supplies opaque billing_account_id for Play obfuscatedAccountId; no email transmitted in that field. New AAB needed for mobile fixes, backend deployed first. Tests source added playPurchaseRecovery5cases; actual paid-device acceptance remains required. No AAB signed/built/launched; no account transfer/refund/real purchase performed.
- Verification: mobile typecheck and278/278 tests passed (5 purchase-recovery cases); backend1107/1107 unit plus15/15 contract/security passed, integration project compiles. Backend rollout staged (sudo required, not deployed yet) with8 PostgreSQL reporting/subscription tests gate; mobile AAB/device test still required. No emulator/app auto-launch or signing performed.

## 2026-11-09 — Prepare release0.1.6/code7
Raised tracked Expo config and local native Gradle version together from0.1.5/code6 to0.1.6/code7 for purchase ownership/recovery and latest transport fixes. Validated existing production API URL, Firebase file and upload-keystore presence without exposing credentials. No signed build/app launch/upload performed. Apply guarded combined backend/admin rollout first, then owner runs secure build and tests purchase/restore/account switching on Play internal track before production.


## 2026-11-09 — Recover purchases after interrupted callbacks
Added Android app-level PlayPurchaseLifecycle after sign-in and on foreground: real Play available-purchase query, existing server verification/ownership guard, bounded network retries and stale-session cancellation. No checkout, local entitlement grant or foreign-account transfer; does not disconnect another screen's native billing connection. TypeScript and278/278tests pass; refreshed OpenAPI checksum for reviewed admin-search documentation delta. Native/device lifecycle acceptance still needed in next0.1.6/code7 build; no app/emulator/build launched.


## 2026-11-09 — Distinguish Google payer from Fitmate entitlement owner
Checked official Billing test guide: multi-account billing selects the account that downloaded the app (first account if none); BillingFlowParams exposes obfuscated app-account binding, not a Google Gmail selector. New checkout refreshes server subscription first, requires valid64hex billing_account_id (never silently opens unbound checkout), skips duplicate active entitlement and retains foreign-token guard. UI identifies Fitmate recipient separately, with on-demand help to cancel wrong-payer dialog and reinstall from intended Play account after syncing if switching alone does not change it; never requires removing Google accounts from device. No claim to force Google payer selection, read payer Gmail or transfer old purchases. Native multi-Google-account acceptance remains required; no app opened/built/charged.


## 2026-11-10 — Account-owned one-time AI Plus
Prepared0.1.7/code8 (tracked Expo + existing ignored native Gradle). Read purchase_type/legacy_product_id; in-app checkout uses real Play product fitmate_ai_plus_month, Play price and mandatory opaque Fitmate binding; old subscriptions remain restore-only. Distinct adapters route one-time verify-purchase versus legacy verify; global sign-in/resume recovery handles both without transferring ownership. Plan reload event after background restore and sequential account quota/status consistency check avoid stale Free display; consumed transactions rely on durable backend rights, not Play inventory. No client consumption/local grant/mock. Buyer sees recipient email, expiry from server.
Typecheck passed; full284/285 initially only drift hash failed while OpenAPI edited, then focused16/16 passed after reviewed hash update. Native Play A/B/reinstall/network/refund acceptance and real PostgreSQL gate remain required. Product not yet created by owner, new sales remain off. No signed AAB/build/install/app/emulator launch/production change.
