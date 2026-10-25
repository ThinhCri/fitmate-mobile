# Android release DEX optimization — 2026-10-25

Owner requested fixing Play's DEX obfuscation warning (1%, affected versionCode 1). This is a release build issue, not VPS configuration.

## Observed cause and change

- Existing native app/build.gradle defaults minification and resource shrinking to false unless Gradle properties enable them. Neither property was present locally. Its default ProGuard file was proguard-android.txt, which disables optimization.
- Added the local Expo config plugin withAndroidReleaseOptimization (existing expo/config-plugins API; no dependency installation). It writes both release properties true and uses proguard-android-optimize.txt, preserving app keep rules and signing. Unknown Gradle templates fail for review; repeated application is idempotent.
- Applied the same two property values and default-file correction directly to this machine's ignored android/ checkout. The tracked plugin/app.json are the durable version for future prebuilds; do not force-add generated Android files or run prebuild --clean, which can discard existing upload signing configuration.
- Secure release script explicitly enables the release flags, rejects an unoptimized default or app-level dontshrink/dontoptimize/dontobfuscate, and checks nonempty mapping.txt plus the mapping entry inside the resulting AAB. It warns when r8.json is absent. Preserve mapping.txt with the exact version's bundle for crash deobfuscation. No native/SDK upgrades or blanket keep-rule removal.

## Verification and rollout

IMPLEMENTED_UNVERIFIED. No tests, typecheck, Gradle build, device run, version bump or Play upload executed under the manual workflow. Static git diff --check passed. New unit source covers idempotent properties, preserving unrelated/signing/keep-rule content, and failing unknown templates.

From mobile/: `npm test -- src/services/__tests__/releaseOptimization.test.ts`; `npm run type-check`; `npm run lint`. When owner is ready for the grouped mobile release, increase versionCode above the published value, run build-release-secure.ps1, then inspect R8 mapping/configuration/usage and bundle metadata. Test the signed optimized app's cold start, auth, Firebase consent/events, workout/media/audio, image picker, comments/keyboard and billing paths. R8 can expose missing reflection/JNI keep rules; fix narrowly rather than disabling optimization globally.

Do not claim the 25% score is reached from flags or mapping existence alone. Review r8.json and the new bundle's actual Play optimization report; if still below threshold, analyze merged consumer keep rules before narrowing them with runtime evidence. The already-uploaded bundle is immutable and keeps its existing warning.

Sources: [Android R8 configuration](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization), [DEX metrics and metadata](https://developer.android.com/google/play/vitals/code-optimization).

## Verification run authorized by owner

- Owner subsequently authorized build/test, but deferred the version bump and Play release. Full Vitest: 197/197 passed. TypeScript initially found missing react-dom/server types in the comments regression test; switched that test to a locally typed createRequire of the existing renderer, then TypeScript passed and the affected 4 test cases passed again. Lint initially found a Settings callback dependency mismatch; fixed the dependency, then lint exited 0 (131 warnings remain across the repository).
- No signing environment variables or attached adb devices were present. Added scripts/verify-android-release.init.gradle, which creates an unsigned verification build type initialized from release via finalizeDsl. It does not modify or disable the release-signing guard. Use :app:bundleVerification with this init script; it creates a separately named non-publishable bundle, preserving app-release.aab. Actual signed/device tests remain required later.
- The first build failed before R8 with a misleading Firebase android() configuration error. Read-only argument reproduction showed PowerShell split unquoted `-Pandroid.enableMinifyInReleaseBuilds=true` into `-Pandroid` and `.enableMinifyInReleaseBuilds=true`, injecting an inherited android property and preventing the Firebase library plugin from applying. Quoted both dotted -P arguments in the secure release script and verification rerun; no Firebase package or SDK upgrade was necessary.
- Rerun succeeded in 15m23s. ZIP android/app/build/outputs/bundle/verification/app-verification.aab: 74,783,072 bytes, no signature entries, embedded mapping and r8.json. R8 8.12.14 reports obfuscation/optimization/shrinking enabled, debug/compatibility disabled; noObfuscationPercentage 18.11, noOptimizationPercentage 18.63, noShrinkingPercentage 18.01. DEX falls from 48.10 MiB in the old release to 11.61 MiB. Existing app-release.aab is untouched. This verifies the optimizer ran, not a final signed release or Play approval.
- Mapping/configuration/seeds/usage/resources reports exist under android/app/build/outputs/mapping/verification; keep mapping with the matching bundle. R8 emitted nonfatal play-services-auth 21.5.0 stack-map warnings; do not hide them with blanket keep/dontwarn rules. No adb device was attached, so actual optimized app startup/auth/consent/comments/etc. remain unverified. No version/Play/commit/push changes.
