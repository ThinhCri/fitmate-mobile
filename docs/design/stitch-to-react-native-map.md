# Stitch to React Native mapping

Status: **MAPPING REQUIRED**  
Reference root: `design-reference/stitch-export/`

This file must be completed from the actual Stitch directories before bulk conversion. Do not infer screen behavior from folder names alone.

## Mapping rules

- Preserve the Stitch ID prefix (`a01`, `b01`, and so on).
- One main screen may have several state variants; do not turn every variant into a route.
- Map to UUID/conversation-ID routes, not legacy email routes.
- Record the real API operation and release gate. “Present in OpenAPI” is not equivalent to “enabled in production”.
- Use `NEEDS_REVIEW` when Stitch conflicts with business rules, privacy, authorization, or the current contract.

## Inventory

| Stitch ID/folder | Screen/state | Role | React Native route | API operations | Reusable components | Decision | Notes/security gate |
|---|---|---|---|---|---|---|---|
| Pending inventory | — | — | — | — | — | NEEDS_REVIEW | Agent must inspect the export before implementation. |

Allowed decisions: `CONVERT`, `STATE_VARIANT`, `MERGE_WITH`, `REFERENCE_ONLY`, `OUT_OF_SCOPE`, `NEEDS_REVIEW`.

## Representative approval batch

The first approval batch is limited to:

1. Member home.
2. Trainer list.
3. Trainer detail.

The implementing agent must replace this section with exact Stitch IDs and current routes before coding the batch.
