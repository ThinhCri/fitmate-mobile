/**
 * Theme types — semantic role bindings (per design-system.md Section 2).
 *
 * Semantic roles map M3 color roles to our palette tokens. Components consume
 * semantic roles (e.g. `colors.text.body`) rather than palette names so we can
 * change the palette or add dark variants later without touching components.
 */
import type { PaletteKey } from './tokens';

export interface SemanticColors {
  // Background tiers
  bg: {
    page: PaletteKey;
    card: PaletteKey;
    subtleCard: PaletteKey;
    selected: PaletteKey;
    hover: PaletteKey;
    pressed: PaletteKey;
    divider: PaletteKey;
  };
  // Text
  text: {
    body: PaletteKey;
    secondary: PaletteKey;
    disabled: PaletteKey;
    inverse: PaletteKey;
    onPrimary: PaletteKey;
    onSecondary: PaletteKey;
    onTertiary: PaletteKey;
    onError: PaletteKey;
    onPrimaryContainer: PaletteKey;
    onSecondaryContainer: PaletteKey;
    onTertiaryContainer: PaletteKey;
    onErrorContainer: PaletteKey;
  };
  // Border / outline
  border: {
    hairline: PaletteKey; // outline — input border focus
    subtle: PaletteKey; // outlineVariant — card border subtle 1dp
  };
  // Brand
  primary: PaletteKey;
  primaryContainer: PaletteKey;
  secondary: PaletteKey;
  secondaryContainer: PaletteKey;
  tertiary: PaletteKey;
  tertiaryContainer: PaletteKey;
  // Status
  error: PaletteKey;
  errorContainer: PaletteKey;
  success: PaletteKey;
  warning: PaletteKey;
  info: PaletteKey;
  // Backdrop
  scrim: PaletteKey;
}
