# Android analytics consent — 2026-10-25

Owner request: make the preference reachable and ask after login because users do not know about the buried setting. This changes discovery, not the default to opt-out.

- Ask on the authenticated dashboard only when the account-scoped local choice is absent. Reuse the existing permissions sequence so dialogs do not overlap. No SDK collection before affirmative agreement.
- Explicit refusal, close X and Android back store false; do not nag on every login. Settings remains the opt-in/revocation entry point. Choices are account-scoped on the current installation; reinstall/new device may ask again.
- Use the existing native modal and mobile tokens with a centered, scrollable card, 48dp controls, Vietnamese disclosure, and accept/refuse actions. Do not claim Firebase metadata is completely anonymous. Only coarse allowlisted route names are custom event parameters; no raw user ID, route parameters, name, email, chat, photos or health data.
- Settings API/deletion status failures must not prevent local consent or navigation back. Preserve server-backed settings and deletion authorization; do not invent default server settings or unknown deletion status.
- Recognize standard gitignored google-services.json as well as an explicit config override, keeping the JS gate aligned with native configuration. Missing explicit config is an error. Secure release builds must fail if config is absent. Config contents are not committed.
- Preserve app-instance identity over cold starts. Account switch/logout still disables collection and resets analytics identity; serialize these operations to prevent stale enable calls.

This is local implementation only, not a correction delivered to the current Play AAB. Runtime validation on a signed Android build and Google DebugView/realtime is required before release. The legacy decisions.md encoding is preserved unchanged.
