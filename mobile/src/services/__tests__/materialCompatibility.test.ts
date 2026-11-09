import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { configureMaterial } = require('../../../plugins/withAndroidMaterialCompatibility.js');
describe('Material Android window compatibility', () => {
 it('pins the stable Material fix and is idempotent', () => {
  const result = configureMaterial('apply plugin: "com.android.application"\ndependencies {}');
  expect(result).toContain("strictly('1.14.0')");
  expect(configureMaterial(result)).toBe(result);
 });
 it('fails instead of modifying an unexpected Gradle file', () => {
  expect(() => configureMaterial('')).toThrow();
 });
});
