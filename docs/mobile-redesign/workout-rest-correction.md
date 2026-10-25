# Workout rest correction — 2026-10-25

The owner reported a countdown of 749999:57. Rest data was unbounded, and the editor reinserted a default when cleared, making it hard to replace the number.

- Rest between sets is an integer 0..600 seconds (up to 10 minutes), mirrored in backend validation/OpenAPI. Zero means no rest.
- Invalid legacy plan/checkpoint values are not written back automatically: the current workout uses 45 seconds and tells the user to edit the plan.
- Recorded completed sets and the server password policy are unchanged.
- Legacy decisions.md contains invalid UTF-8; that file was not re-encoded for this targeted fix.
