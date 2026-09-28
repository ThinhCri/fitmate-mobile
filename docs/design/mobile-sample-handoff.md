# Mobile sample handoff

Status: **NOT IMPLEMENTED / NOT VERIFIED**

## Current inputs

- Stitch export: `design-reference/stitch-export/` (local visual reference, ignored by Git).
- Rules: `docs/design/stitch-react-native-rules.md`.
- Mapping: `docs/design/stitch-to-react-native-map.md` (inventory pending).
- App: `mobile/` React Native + Expo.
- Wire contract: backend `docs/backend-release/openapi/fitmate-v1.yaml`, pinned by `docs/production/contract-baseline.json`.

## Required first batch

Member home, trainer list, and trainer detail must be mapped to exact Stitch IDs, converted using shared production components, and exposed through the development-only preview. Existing API, authentication, navigation, privacy, and error behavior must be preserved.

## Known state

- The first conversion attempt did not complete the representative batch: the generated presentation, design-system, trainer, fixture, and preview files were zero-byte placeholders. They were removed rather than kept as false implementation evidence.
- No `sample-preview` route exists until the three real presentation screens and their explicit development-only data boundary are implemented. Recreate it only with a default component and `__DEV__` protection.
- A mobile-local Expo flat ESLint config now prevents `expo lint` from loading the unrelated web ESLint config at the repository root.
- Missing `icon.png`, `splash.png`, and `adaptive-icon.png` references were removed from `mobile/app.json`. Restore those properties only after approved production brand assets exist under `mobile/assets/`.
- The current working tree contains user/agent changes; preserve them and inspect the relevant diff before editing.
- No build, test, typecheck, lint, Expo, emulator, or backend command was run as part of this documentation audit.

## Completion evidence to add

- Files added/changed/removed and removal rationale.
- Stitch ID → route → component → API mapping.
- Preview routes and available states.
- Static review findings.
- User-run commands and outputs.
- Remaining blockers and release gates.

Until that evidence exists, report `IMPLEMENTED_UNVERIFIED` at most; never “production-ready”.
