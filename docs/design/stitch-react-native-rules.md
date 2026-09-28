# Stitch to React Native — production implementation rules

Status: **AUTHORITATIVE FOR THE CURRENT MOBILE REDESIGN**  
Date: 2026-09-28  
Scope: `mobile/**`, `design-reference/stitch-export/**`, and mobile integration docs.

This document replaces prototype-only instructions when they conflict with the production baseline. Historical prototype documents remain useful for content inventory, but they do not authorize mock fallbacks, email-based identity, client-side money calculations, or fake AI/payment success.

## 1. Sources of truth

Use this order when sources disagree:

1. Backend business rules and authorization rules in `FitmateAI_BE/docs/backend-release/`.
2. Backend OpenAPI contract at `FitmateAI_BE/docs/backend-release/openapi/fitmate-v1.yaml`.
3. Mobile production requirements under `docs/production/`.
4. Stitch export for visual appearance only.
5. Existing mobile code for behavior that already matches the sources above.
6. Prototype docs and fixtures for historical inventory only.

The OpenAPI file defines the wire format; it does not by itself prove that an operation is released. Check the owning BE task and evidence before enabling it. BE-801..807, BE-811..816, and BE-819 are recorded as VERIFIED in the backend task ledger. Payment/payOS work (BE-808..810 and BE-400), three-repo UAT (BE-826), and release (BE-827) still have open gates as of this snapshot. AI inference remains capability-gated.

Current contract snapshot metadata is recorded in `docs/production/contract-baseline.json`. Regenerate client types only from that exact OpenAPI source and update the recorded hash when the backend contract changes.

## 2. Stitch boundary

`design-reference/stitch-export/` is a read-only visual reference. Each child directory is one screen or state. Preserve its ID during mapping.

- Do not import HTML, DOM components, CSS, Tailwind classes, `window`, or `localStorage` into React Native.
- Do not embed the export in a WebView.
- Do not run or deploy the exported web project.
- Do not treat sample users, prices, ratings, schedules, badges, or CTA behavior as real product data.
- Do not copy an asset into `mobile/assets/` until its ownership/license and intended public/private use are known.
- Convert the visual hierarchy into semantic React Native tokens and components; do not reproduce a screenshot with absolute positioning.

## 3. Safe replacement and cleanup

Never delete the current app before the replacement exists. Use this order:

1. Map Stitch screen IDs to current routes and approved requirements.
2. Extract one shared token/component system.
3. Implement a small approved batch using current services and navigation.
4. Move callers and tests to the replacement.
5. Confirm a file has no remaining imports and contains no business logic.
6. Remove only the obsolete presentation code and record the reason in the handoff.

Preserve authentication, API adapters, secure storage, DTO mapping, state transitions, route/deep-link behavior, permissions, tests, and native configuration. If a component mixes presentation with business logic, extract the behavior first.

## 4. Code structure

- `mobile/app/**`: thin Expo Router entries; route params and screen composition only.
- `mobile/src/components/design-system/**`: reusable visual primitives with no API calls.
- `mobile/src/features/<feature>/**`: feature screens, components, hooks, mappers, and feature API facade.
- `mobile/src/services/api/**`: transport, auth refresh, generated wire types, and shared error handling.
- `mobile/src/services/storage/**`: typed persistence adapters.
- `mobile/src/theme/**`: semantic tokens; screens must not scatter raw hex values or ad-hoc spacing.
- `mobile/src/mocks/preview/**`: development preview fixtures only.

Presentation components receive data, status, and callbacks. They do not calculate authoritative money, decide permissions, decode tokens, or call arbitrary URLs. Convert wire DTOs to view models at a mapper boundary. Keep unknown/null distinct from zero or empty text.

### Dependency policy

- The project baseline is the Expo SDK, React Native, React, and TypeScript versions pinned in `mobile/package.json`. Use Expo-compatible versions resolved from the active SDK; do not copy version numbers from tutorials or older prototype documents.
- Prefer, in order: an existing project dependency, an Expo SDK module, a React Native platform API, then a third-party package. Do not add a package when the platform or an existing dependency already covers the need cleanly.
- A new third-party dependency requires a concrete feature need and a short recorded check of: active maintenance, current React Native/New Architecture and Expo compatibility, release recency, security history, license, bundle/native impact, accessibility, and community adoption. Popularity alone is not approval.
- Do not introduce abandoned, deprecated, archived, unmaintained, web-only, or legacy bridge-only UI libraries. Do not use packages that require unsupported peer-dependency overrides to install.
- Keep one library per responsibility where practical. Do not add a second navigation, icon, sheet, gesture, animation, storage, form, or component framework that overlaps with the approved stack.
- Use `npx expo install <package>` when the user performs dependency installation so Expo selects a compatible version. The agent must present the exact command and reason, and must not install or upgrade dependencies under the current manual-execution workflow.
- Never mass-upgrade packages during a screen conversion. Propose dependency changes separately, preserve the lockfile, and require user-run type-check, lint, Android runtime, and affected-flow verification before recording them as verified.
- The approved foundation is Expo Router, `@gorhom/bottom-sheet`, `lucide-react-native`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, Expo modules, AsyncStorage for non-secret account-scoped persistence, and SecureStore for session secrets. Reuse it unless an explicit architecture decision replaces an item.

## 5. Production API integration

- Base URL comes from validated environment configuration. Local Android Emulator uses `http://10.0.2.2:<port>/api/v1`; staging/production use HTTPS.
- Cleartext HTTP is debug-local only. Never disable TLS certificate validation, accept all certificates, or ship a production network-security exception to make integration easier.
- Do not place secrets, provider credentials, signing keys, or model keys in `EXPO_PUBLIC_*` variables. Expo public variables are readable by the client.
- Access token stays in memory. Refresh token uses `expo-secure-store`; never AsyncStorage, source code, logs, screenshots, or analytics.
- Refresh is single-flight. Logout/account lock/deletion cancels in-flight work and clears account-scoped caches, drafts, queues, notification installation state, and sensitive view state.
- A stale response from a prior session must not restore authentication or overwrite a newer account.
- Use UUID identity and conversation IDs. Email is a mutable attribute, never an authorization key or route identity.
- Password policy for new passwords is 12..128 characters. Do not independently hardcode a weaker client rule.
- Handle RFC 7807 errors by `status`, stable `code`, and `traceId`; do not show raw server exceptions.
- Distinguish 400 validation, 401 expired session, 403 forbidden, 404 hidden/not found, 409 conflict, 429 throttled, and 503 unavailable.
- Retry GET only when safe. Retry mutations only when the contract permits it and reuse the same idempotency key and payload. Never retry payment/booking mutations with a new key after an uncertain result.
- Honor cancellation and timeouts. Do not turn network failure into sample data or success.
- Server-side pagination/filter/sort remains server-side. Lists must not fetch everything and pretend to paginate locally.

## 6. Security and privacy

- Authorization and ownership are enforced by the backend; the client still hides actions it knows are unavailable but never treats UI hiding as security.
- Public PT/profile projections must not expose email, phone, birthday, medical conditions, allergies, bank details, raw certificates, support evidence, or private media keys.
- Health, chat, payment, certificate, and support media use authorized/signed URLs. Persist stable storage keys only when the contract permits it; refresh expired signed URLs through an authorized endpoint.
- Never log passwords, tokens, MFA/recovery codes, raw health/chat payloads, payment payloads, bank references, private file URLs, or photos.
- Uploads must follow the server category/ownership flow. Do not attach an arbitrary URL or storage key supplied by another account.
- Account switching must not leak queries, images, drafts, offline jobs, notification tokens, or cached responses from account A to account B.
- Deep links are navigation hints; every destination reloads and re-authorizes the resource.
- External URLs use an allowlisted HTTPS scheme/host appropriate to the feature. Never open `javascript:`, `file:`, arbitrary intent URLs, or an untrusted URL returned in free-form content.
- Development preview routes and fixtures must be guarded by `__DEV__` and excluded from production navigation.

## 7. Money, booking, and settlement

- Money is integer VND supplied by the server. The app formats values but does not compute authoritative quote, fee, refund, revenue, or payout.
- payOS is the intended new checkout provider; VNPay remains for historical records while payment tasks are being re-verified. Respect server capabilities before showing a live checkout.
- A payment return/deep link never means Paid. Poll `GET /api/v1/me/payments/{id}` and show pending/failed/unknown states truthfully.
- Appointment, payment, refund, dispute, and PT settlement statuses are separate.
- PT payout is manual. The app must not promise automatic payout or present approved settlement as transferred money.
- Booking, payment, workout-session, and other side-effect mutations use the exact idempotency requirements in OpenAPI. A timeout produces an uncertain state with status re-query, not an immediate repeat that can duplicate money or bookings.
- Capability flags do not grant authorization and must not be invented as wire fields outside the contract.

## 8. AI and unavailable capabilities

- The mobile app never embeds or calls Gemini/model providers directly and never stores provider keys.
- AI is called through the backend only when the advertised capability is enabled and the operation is released.
- AI results are suggestions. Meal candidates require user review/confirmation before changing the food log. Workout suggestions do not silently replace a plan.
- Missing artifact, timeout, disabled provider, invalid output, or quota failure must show an honest recoverable state. Manual nutrition/workout paths remain usable.
- Never create fake confidence, progress percentage, diagnosis, allergy safety, or generic AI success.

## 9. UI quality and accessibility

Stitch is the approved visual reference, while the React Native result must remain adaptive:

- Use semantic colors, spacing, type, radius, elevation, and motion tokens.
- Minimum touch target is 48 dp. Icon-only controls need accessible labels.
- Support safe areas, keyboard avoidance, Android back, 360 dp width, the 390 x 844 reference viewport, long Vietnamese text, and font scale up to 1.5.
- Color is never the only state signal. Do not truncate money, time, or critical status.
- Data-driven screens provide populated, loading, empty, error, offline, permission-denied, session-expired, and disabled states where applicable.
- Loading, empty, and error are distinct; an API error must not render as zero metrics or an empty success state.

## 10. Verification and status language

Agents may write test source but must not claim success without command output supplied by the user. Under the current user workflow, agents do not run install, build, test, lint, typecheck, Expo, emulator, Docker, migrations, or servers, and do not commit/push unless explicitly instructed.

Use these states:

- `MAPPED`: source/reference mapping exists.
- `IMPLEMENTED_UNVERIFIED`: code and static review completed; user has not run verification.
- `VERIFIED`: required commands and device/API scenarios passed with evidence.
- `BLOCKED`: an external decision, credential, provider, artifact, or backend gate prevents completion.

Do not use “production-ready” until mobile UAT, staging integration, security/privacy checks, payment/operator gates, and release gates have all passed.
