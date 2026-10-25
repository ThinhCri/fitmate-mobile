import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
const { resources } = createRequire(import.meta.url)('../../../plugins/withAndroidBrandIcon.js') as {
  resources: Record<string, string>;
};

describe('Android adaptive brand icon', () => {
  it('uniformly scales and centers every F vertex within the 66dp circular safe area', () => {
    const xml = resources['drawable/fitmate_adaptive_foreground.xml'];
    const attribute = (name: string) => Number(xml.match(new RegExp(`android:${name}="([^"]+)"`))?.[1]);
    const sx = attribute('scaleX'); const sy = attribute('scaleY');
    expect(sx).toBe(sy);
    const coordinates = xml.match(/android:pathData="([^"]+)"/)![1].match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    const points = Array.from({ length: coordinates.length / 2 }, (_, index) => ({
      x: 54 + (coordinates[index * 2] - 54) * sx + attribute('translateX'),
      y: 54 + (coordinates[index * 2 + 1] - 54) * sy + attribute('translateY'),
    }));
    for (const point of points) expect(Math.hypot(point.x - 54, point.y - 54)).toBeLessThan(33);
    expect((Math.min(...points.map((p) => p.x)) + Math.max(...points.map((p) => p.x))) / 2).toBeCloseTo(54);
    expect((Math.min(...points.map((p) => p.y)) + Math.max(...points.map((p) => p.y))) / 2).toBeCloseTo(54);
  });
  it('uses the same safe vector for normal, round and monochrome launchers', () => {
    expect(resources['mipmap-anydpi-v26/ic_launcher_round.xml']).toBe(resources['mipmap-anydpi-v26/ic_launcher.xml']);
    expect(resources['mipmap-anydpi-v26/ic_launcher.xml']).toContain('<monochrome android:drawable="@drawable/fitmate_adaptive_foreground"');
  });
});
