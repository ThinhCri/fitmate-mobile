import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

const mobileDir = process.cwd();
const source = readFileSync(path.join(mobileDir, 'app.config.js'), 'utf8');
function evaluate(env: Record<string, string>, existing: string[]) {
  const context = {
    module: { exports: {} as { extra?: { firebaseAnalyticsEnabled?: boolean }; android?: { googleServicesFile?: string } } },
    __dirname: mobileDir,
    process: { env },
    require: (name: string) => {
      if (name === 'node:path') return path;
      if (name === 'node:fs') return { existsSync: (file: string) => existing.includes(file) };
      if (name === './app.json') return { expo: { android: { package: 'vn.fitmate.app' }, plugins: [], extra: {} } };
      throw new Error(`Unexpected module: ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  return context.module.exports;
}

describe('Firebase build configuration', () => {
  it('enables the JS gate from a standard local native config without an env override', () => {
    const configPath = path.join(mobileDir, 'google-services.json');
    const config = evaluate({}, [configPath]);
    expect(config.extra?.firebaseAnalyticsEnabled).toBe(true);
    expect(config.android?.googleServicesFile).toBe(configPath);
  });
  it('rejects an explicitly configured missing file instead of silently disabling analytics', () => {
    expect(() => evaluate({ FITMATE_FIREBASE_ANDROID_FILE: 'missing.json' }, []))
      .toThrow('does not exist');
  });
  it('keeps unconfigured development builds unavailable rather than faking the SDK', () => {
    expect(evaluate({}, []).extra?.firebaseAnalyticsEnabled).toBe(false);
  });
});
