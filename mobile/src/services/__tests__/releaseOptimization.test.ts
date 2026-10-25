import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

interface GradleProperty { type: string; key?: string; value?: string }
const require = createRequire(import.meta.url);
const { optimizeGradleProperties, optimizeAppBuildGradle } = require('../../../plugins/withAndroidReleaseOptimization.js') as {
  optimizeGradleProperties: (properties: GradleProperty[]) => GradleProperty[];
  optimizeAppBuildGradle: (contents: string) => string;
};

describe('Android release optimization config', () => {
  it('enables minification and resource shrinking without duplicate or unrelated property changes', () => {
    const properties = optimizeGradleProperties([
      { type: 'property', key: 'hermesEnabled', value: 'true' },
      { type: 'property', key: 'android.enableMinifyInReleaseBuilds', value: 'false' },
      { type: 'property', key: 'android.enableMinifyInReleaseBuilds', value: 'false' },
    ]);
    expect(properties).toContainEqual({ type: 'property', key: 'hermesEnabled', value: 'true' });
    expect(properties.filter((item) => item.key === 'android.enableMinifyInReleaseBuilds'))
      .toEqual([{ type: 'property', key: 'android.enableMinifyInReleaseBuilds', value: 'true' }]);
    expect(properties).toContainEqual({ type: 'property', key: 'android.enableShrinkResourcesInReleaseBuilds', value: 'true' });
    expect(optimizeGradleProperties(properties)).toEqual(properties);
  });
  it('uses the optimizing default while preserving app keep rules and signing', () => {
    const source = `signingConfig = signingConfigs.release\nproguardFiles getDefaultProguardFile('proguard-android.txt'), "proguard-rules.pro"`;
    const result = optimizeAppBuildGradle(source);
    expect(result).toContain('getDefaultProguardFile("proguard-android-optimize.txt")');
    expect(result).toContain('"proguard-rules.pro"');
    expect(result).toContain('signingConfig = signingConfigs.release');
    expect(optimizeAppBuildGradle(result)).toBe(result);
  });
  it('fails on unrecognized Gradle templates rather than silently shipping unoptimized code', () => {
    expect(() => optimizeAppBuildGradle('android { buildTypes { release {} } }')).toThrow('unrecognized');
  });
});
