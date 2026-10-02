/**
 * Contract drift guard — verifies the pinned OpenAPI baseline has not changed.
 *
 * If the backend contract file changes without updating contract-baseline.json,
 * this test will fail, preventing silent drift.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const MOBILE_ROOT = path.resolve(__dirname, '..', '..', '..');
const FE_ROOT = path.resolve(MOBILE_ROOT, '..');

// Contract baseline lives in FE repo docs
const BASELINE_PATH = path.join(FE_ROOT, 'docs', 'production', 'contract-baseline.json');

// Backend OpenAPI lives in the sibling BE repo
const BE_ROOT = path.resolve(FE_ROOT, '..', 'FitmateAI_BE');
const OPENAPI_PATH = path.join(
  BE_ROOT,
  'docs',
  'backend-release',
  'openapi',
  'fitmate-v1.yaml'
);

describe('Contract drift guard', () => {
  it('contract-baseline.json exists and is valid JSON', () => {
    expect(fs.existsSync(BASELINE_PATH)).toBe(true);
    const raw = fs.readFileSync(BASELINE_PATH, 'utf-8');
    const baseline = JSON.parse(raw);
    expect(baseline.openapiSha256).toBeDefined();
    expect(baseline.backendFrozenRevision).toBeDefined();
    expect(baseline.contractStatus).toBe('FROZEN-V1');
  });

  it('OpenAPI file exists in the backend repo', () => {
    if (!fs.existsSync(BE_ROOT)) {
      // Skip gracefully in CI where BE repo may not be present
      console.warn('Backend repo not found at', BE_ROOT, '— skipping OpenAPI existence check');
      return;
    }
    expect(fs.existsSync(OPENAPI_PATH)).toBe(true);
  });

  it('OpenAPI SHA-256 matches pinned baseline', () => {
    if (!fs.existsSync(OPENAPI_PATH)) {
      console.warn('OpenAPI file not found — skipping hash verification');
      return;
    }

    const raw = fs.readFileSync(BASELINE_PATH, 'utf-8');
    const baseline = JSON.parse(raw);
    const pinnedHash = baseline.openapiSha256.toUpperCase();

    const fileBytes = fs.readFileSync(OPENAPI_PATH);
    const actualHash = crypto
      .createHash('sha256')
      .update(fileBytes)
      .digest('hex')
      .toUpperCase();

    expect(actualHash).toBe(pinnedHash);
  });

  it('pinned revision matches expected frozen revision', () => {
    const raw = fs.readFileSync(BASELINE_PATH, 'utf-8');
    const baseline = JSON.parse(raw);
    expect(baseline.backendFrozenRevision).toBe(
      '848a0455061382f1866fde1814ddbec13bf02fac'
    );
  });
});
