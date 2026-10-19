# Fitmate brand mark

The icon combines an F stem with two forward-pointing bars. It uses one shape and two colors so it remains recognizable at small sizes and in monochrome. Do not add a dumbbell, heart, shadow, gradient, or extra slogan to the icon.

- Master vector: `fitmate-mark.svg` (teal `#0F766E`, white glyph).
- Google Play: `play-store-icon.png`, 512 × 512, full-bleed square. Google Play applies its own corner mask.
- Expo/app icon: `app-icon.png`, 1024 × 1024.
- Android adaptive: transparent foreground and monochrome PNGs in this folder. `mobile/android/` is gitignored; generated native resources on this machine are local only. Run Expo prebuild when preparing a fresh native checkout so `app.json` applies them.
- In-app logo: `src/features/auth/BrandMark.tsx`; web logo and favicon use the same path. Keep the geometry synchronized if the mark changes.
- Regenerate raster assets with `scripts/export_brand_assets.py` in a Python environment with Pillow. The script also refreshes native launcher and splash assets when the ignored Android project exists locally.

The design has not received trademark clearance. Before public launch, search both the Fitmate name and visually similar marks via WIPO Global Brand Database and the Vietnamese trademark register.
