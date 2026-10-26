import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (['__tests__', 'test', 'node_modules'].includes(entry.name)) return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sources(path) : /\.[jt]sx?$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name) ? [path] : [];
  });
}
describe('production import boundary', () => {
  it('keeps test fixtures and retired local mock repositories out of runtime imports', () => {
    const root = resolve(process.cwd());
    const violations: string[] = [];
    for (const file of [...sources(resolve(root, 'src')), ...sources(resolve(root, 'app'))]) {
      const code = readFileSync(file, 'utf8');
      const imports = [...code.matchAll(/(?:from\s*|import\s*\(|require\s*\(|import\s*)['"]([^'"]+)['"]/g)];
      for (const item of imports) if (/(?:__tests__|\/test\/|fixtures|mockData|localDb|RewardSimulation|DEMO_USERS)/i.test(item[1])) violations.push(`${relative(root, file)}: ${item[1]}`);
      if (/['"]bk-\d+['"]/.test(code)) violations.push(`${relative(root, file)}: hardcoded prototype booking ID`);
    }
    expect(violations).toEqual([]);
  });
});
