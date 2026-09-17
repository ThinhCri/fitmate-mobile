/**
 * Semantic color roles — single source of truth for component bindings.
 *
 * Components read `colors.text.body`, `colors.bg.card`, etc.
 * NEVER read `palette.onSurface` directly from a component.
 *
 * Vai tro mau nhan (DEC-020):
 * - primary thong tri: CTA chinh, focus, selected, link, nav indicator.
 * - secondary tiet che: streak warm accent, macro bar carb/fat, spec chip.
 *   KHONG dung cho CTA cạnh tranh.
 * - tertiary chi khi can: PT verified hero, verify badge, achievement.
 *   Phase UI hien tai: chi Profile PT verified hero + verify badge + PT role chip.
 */
import type { SemanticColors } from './types';

export const semanticColors: SemanticColors = {
  bg: {
    page: 'surface',
    card: 'surfaceContainerLowest',
    subtleCard: 'surfaceContainerLow',
    selected: 'surfaceContainer',
    hover: 'surfaceContainerHigh',
    pressed: 'surfaceContainerHigh',
    divider: 'surfaceContainerHighest',
  },
  text: {
    body: 'onSurface',
    secondary: 'onSurfaceVariant',
    disabled: 'onSurfaceDisabled',
    inverse: 'inverseOnSurface',
    onPrimary: 'onPrimary',
    onSecondary: 'onSecondary',
    onTertiary: 'onTertiary',
    onError: 'onError',
    onPrimaryContainer: 'onPrimaryContainer',
    onSecondaryContainer: 'onSecondaryContainer',
    onTertiaryContainer: 'onTertiaryContainer',
    onErrorContainer: 'onErrorContainer',
  },
  border: {
    hairline: 'outline',
    subtle: 'outlineVariant',
  },
  primary: 'primary',
  primaryContainer: 'primaryContainer',
  secondary: 'secondary',
  secondaryContainer: 'secondaryContainer',
  tertiary: 'tertiary',
  tertiaryContainer: 'tertiaryContainer',
  error: 'error',
  errorContainer: 'errorContainer',
  success: 'success',
  warning: 'warning',
  info: 'info',
  scrim: 'scrim',
};
