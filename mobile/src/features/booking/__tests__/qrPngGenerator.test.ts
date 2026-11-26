import { describe, expect, it } from 'vitest';
import {
  buildQrPngBase64,
  buildQrSvgData,
  buildVietQrFallback,
} from '../qrPngGenerator';

describe('qrPngGenerator', () => {
  it('builds a non-empty SVG path grid for EMVCo QR payloads', () => {
    const payload = '00020101021238570010A000000727012700069704180113V3CAS6802047639';
    const svg = buildQrSvgData(payload);

    expect(svg).not.toBeNull();
    expect(svg!.moduleCount).toBeGreaterThan(25);
    expect(svg!.path.startsWith('M')).toBe(true);
  });

  it('encodes a valid PNG file header and chunks offline', () => {
    const b64 = buildQrPngBase64('FITMATE-PAYOS-TEST', 320);
    const bytes = Buffer.from(b64, 'base64');

    // Standard 8-byte PNG signature + IHDR + IDAT + IEND
    expect(Array.from(bytes.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(bytes.subarray(12, 16).toString('ascii')).toBe('IHDR');
    expect(bytes.toString('latin1')).toContain('IDAT');
    expect(bytes.toString('latin1')).toContain('IEND');
  });

  it('builds EMVCo VietQR TLV payload with CRC16 when bank bin and account exist', () => {
    const qr = buildVietQrFallback('970418', '6802047639', 200000, 'FITMATE');
    expect(qr).not.toBeNull();
    expect(qr!.startsWith('000201010212')).toBe(true);
    expect(qr).toContain('970418');
    expect(qr).toContain('6802047639');
    expect(qr!.slice(-8, -4)).toBe('6304');
  });
});
