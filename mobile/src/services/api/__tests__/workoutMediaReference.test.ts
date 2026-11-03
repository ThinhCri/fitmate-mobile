import { describe, expect, it } from 'vitest';
import { stableWorkoutMediaReference } from '../resourceUrl';

describe('durable exercise artwork', () => {
  it('removes expiring signatures from stored shared catalog identity', () => {
    expect(stableWorkoutMediaReference('https://account.r2.cloudflarestorage.com/bucket/exercise-catalog/Plank/0.jpg?X-Amz-Signature=expired'))
      .toBe('storage://exercise-catalog/Plank/0.jpg');
    expect(stableWorkoutMediaReference('/uploads/exercise-catalog/Plank/1.jpg?expires=1&sig=old'))
      .toBe('storage://exercise-catalog/Plank/1.jpg');
  });
  it('does not strip private media signatures or convert arbitrary paths into catalog keys', () => {
    const privateUrl = 'https://storage.example/chat/private.jpg?signature=private';
    expect(stableWorkoutMediaReference(privateUrl)).toBe(privateUrl);
    expect(stableWorkoutMediaReference('storage://exercise-catalog/../secret.jpg')).toBe('storage://exercise-catalog/../secret.jpg');
  });
});
