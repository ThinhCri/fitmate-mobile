import { describe, expect, it } from 'vitest';
import { normalizeApiResourceUrl } from '../resourceUrl';

describe('device-readable media URLs', () => {
  const api = 'https://api.fitmate.site/api/v1';
  it('preserves signatures when resolving relative and loopback image paths', () => {
    expect(normalizeApiResourceUrl('/uploads/exercise-catalog/Plank/0.jpg?expires=123&sig=abc', api))
      .toBe('https://api.fitmate.site/uploads/exercise-catalog/Plank/0.jpg?expires=123&sig=abc');
    expect(normalizeApiResourceUrl('http://localhost:5116/uploads/Plank.jpg?expires=123&sig=abc', api))
      .toBe('https://api.fitmate.site/uploads/Plank.jpg?expires=123&sig=abc');
  });
  it('does not rewrite another provider or forge a URL for a storage key', () => {
    expect(normalizeApiResourceUrl('https://media.example/x.jpg?signature=abc', api)).toBe('https://media.example/x.jpg?signature=abc');
    expect(normalizeApiResourceUrl('storage://exercise-catalog/Plank/0.jpg', api)).toBe('storage://exercise-catalog/Plank/0.jpg');
  });
});
