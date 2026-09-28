# Mobile documentation audit — 2026-09-28

Status: **DOCUMENTATION ALIGNED, IMPLEMENTATION UNVERIFIED**

## Scope reviewed

- Root `AGENTS.md` and active `.cursor/rules/*.mdc`.
- `docs/production/` requirements, business rules, plans, and contract snapshot.
- Mobile redesign README, integration boundaries, feature parity, acceptance checklist, design system, decisions, tasks, and handoff.
- Stitch design package and current empty sample handoff files.
- Backend production README/business rules/API conventions/task status/OpenAPI and relevant runtime controller routes.

No build, test, typecheck, lint, package install, Expo, emulator, backend, Docker, migration, or deployment command was run. No commit was made.

## Corrections made

- Added one production rule for Stitch → React Native conversion, API integration, privacy, session security, money, idempotency, AI gates, accessibility, and status reporting.
- Added an always-applied migration rule pointing agents to that source.
- Removed active mock-only API instructions from the Android implementation rule.
- Changed active delivery rules from automatic commits to explicit user-authorized commits.
- Marked prototype-only documents as historical where rewriting them would destroy useful inventory.
- Updated the backend contract snapshot to the observed HEAD and OpenAPI hash.
- Recorded core verified modules separately from payment/UAT/release gates.
- Changed BR-06 to payOS-new/VNPay-historical wording.
- Added a static contract-versus-runtime gap table.
- Added non-empty Stitch mapping/sample design/sample handoff documents.
- Ignored raw Stitch web exports so they are not accidentally pushed as application source.
- Changed the mobile environment example to fail-closed client presentation defaults.

## Important findings

1. The backend OpenAPI is real and is the wire source of truth. It currently contains 93 paths.
2. OpenAPI presence alone does not mean live/production release. Payment, AI, UAT, and release gates remain separate.
3. Runtime controllers expose several operations absent from the current OpenAPI, including dashboard, preferences, deletion/export, support, upload, reviews, and parts of booking. The mobile agent must not guess those contracts.
4. Verify/resend-email requirements were not observed in the current OpenAPI/controller audit and remain a backend/contract gap.
5. Current mobile code still contains prototype services, email-based routes, RewardSimulation, public feature flags, and sample data paths. Documentation now requires their removal or isolation, but this audit did not claim the code was already converted.
6. `mobile/app/sample-preview.tsx` was still zero bytes at audit time. It must export a development-only React component before it can be used.
7. Some older mobile Markdown contains invalid UTF-8 bytes and garbled characters. It remains historical; agents should not treat those files as current production instructions.

## Source order for the next agent

1. `AGENTS.md`
2. `docs/design/stitch-react-native-rules.md`
3. `docs/production/README.md`
4. `docs/production/mobile-api-readiness.md`
5. `docs/production/contract-baseline.json`
6. Backend OpenAPI and owning BE task/evidence
7. `docs/design/stitch-to-react-native-map.md`
8. Historical mobile redesign documents only for inventory

## Remaining documentation work

- Populate the Stitch map from the actual export directories.
- Record exact tokens/components after inspecting three representative screens.
- Reconcile missing/mismatched backend operations in OpenAPI before a mobile caller is generated.
- Update contract hash whenever the backend spec changes.
- Replace the zero-byte sample preview and then fill its handoff with actual file/symbol evidence.
- Normalize legacy Markdown encoding in a dedicated mechanical cleanup only after preserving content and reviewing the diff.
