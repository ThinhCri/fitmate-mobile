# Fitmate Android

Android client for Fitmate members and personal trainers, built with React Native, Expo SDK 57, TypeScript and Expo Router. The backend owns account access, bookings, payments and durable records; the app presents those server results and must not substitute demo data when an API fails.

## Start here

The runnable project is [`mobile/`](mobile/README.md). Read [production integration notes](docs/production/README.md), [mobile release status](docs/mobile-redesign/handoff.md) and [contributor rules](AGENTS.md) before changing behavior. `design-reference/stitch-export/` is a visual reference, not an API or business-rule source.

## Verification and release boundary

The GitHub Actions workflow installs the locked dependencies and runs TypeScript, lint and unit tests. It does **not** sign or publish an Android App Bundle, deploy the backend, exercise payOS, or replace physical-device UAT. A release requires the approved backend contract, reachable HTTPS API, native Firebase/IAP configuration where enabled, upload signing key, Play Console setup and a real end-to-end check. No test account or password is bundled in this README.

Never commit `.env`, signing keys, provider credentials or user data. Variables named `EXPO_PUBLIC_*` are embedded in the client and therefore are **public configuration**, not secrets.
