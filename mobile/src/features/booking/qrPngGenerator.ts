import QRCode from 'qrcode';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encodeBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;
    out += BASE64_CHARS[(triplet >>> 18) & 0x3f];
    out += BASE64_CHARS[(triplet >>> 12) & 0x3f];
    out += i + 1 < bytes.length ? BASE64_CHARS[(triplet >>> 6) & 0x3f] : '=';
    out += i + 2 < bytes.length ? BASE64_CHARS[triplet & 0x3f] : '=';
  }
  return out;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % MOD;
    b = (b + a) % MOD;
  }
  return ((b << 16) | a) >>> 0;
}

function writeU32BE(buf: Uint8Array, offset: number, val: number): void {
  buf[offset] = (val >>> 24) & 0xff;
  buf[offset + 1] = (val >>> 16) & 0xff;
  buf[offset + 2] = (val >>> 8) & 0xff;
  buf[offset + 3] = val & 0xff;
}

function makePngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  writeU32BE(chunk, 0, data.length);
  for (let i = 0; i < 4; i++) chunk[4 + i] = type.charCodeAt(i);
  chunk.set(data, 8);
  writeU32BE(chunk, 8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
  return chunk;
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16Ccitt(text: string): string {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= (text.charCodeAt(i) & 0xff) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildVietQrFallback(
  bin?: string | null,
  accountNumber?: string | null,
  amountVnd?: number | null,
  description?: string | null
): string | null {
  const cleanBin = (bin ?? '').replace(/\s+/g, '');
  const cleanAcc = (accountNumber ?? '').replace(/\s+/g, '');
  if (!cleanBin || !cleanAcc) return null;

  const merchantInfo = tlv(
    '01',
    tlv('00', cleanBin) + tlv('01', cleanAcc)
  );
  const tag38 = tlv('00', 'A000000727') + merchantInfo + tlv('02', 'QRIBFTTA');
  const amountPart =
    amountVnd && amountVnd > 0 ? tlv('54', String(Math.round(amountVnd))) : '';
  const cleanDesc = (description ?? '').trim().slice(0, 25);
  const tag62 = cleanDesc ? tlv('62', tlv('08', cleanDesc)) : '';

  const unsigned =
    tlv('00', '01') +
    tlv('01', amountPart ? '12' : '11') +
    tlv('38', tag38) +
    tlv('53', '704') +
    amountPart +
    tlv('58', 'VN') +
    tag62 +
    '6304';

  return unsigned + crc16Ccitt(unsigned);
}

export function buildQrSvgData(payload: string): { path: string; moduleCount: number } | null {
  const trimmed = payload.trim();
  if (!trimmed) return null;
  try {
    const qr = QRCode.create(trimmed, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const quiet = 4;
    const parts: string[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (data[r * size + c]) {
          parts.push(`M${c + quiet},${r + quiet}h1v1h-1z`);
        }
      }
    }
    return { path: parts.join(''), moduleCount: size + quiet * 2 };
  } catch {
    return null;
  }
}

export function buildQrPngBase64(payload: string, targetPx = 380): string {
  const qr = QRCode.create(payload.trim(), { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const quiet = 4;
  const totalModules = size + quiet * 2;
  const scale = Math.max(4, Math.floor(targetPx / totalModules));
  const dim = totalModules * scale;

  const rowStride = 1 + dim;
  const raw = new Uint8Array(rowStride * dim);
  raw.fill(255);

  for (let y = 0; y < dim; y++) {
    const rowStart = y * rowStride;
    raw[rowStart] = 0; // PNG filter type 0 (None)
    const modR = Math.floor(y / scale) - quiet;
    if (modR < 0 || modR >= size) continue;
    for (let x = 0; x < dim; x++) {
      const modC = Math.floor(x / scale) - quiet;
      if (modC >= 0 && modC < size && data[modR * size + modC]) {
        raw[rowStart + 1 + x] = 15; // Near-black crisp QR module
      }
    }
  }

  const MAX_BLOCK = 65535;
  const blockCount = Math.ceil(raw.length / MAX_BLOCK);
  const zlibLen = 2 + raw.length + blockCount * 5 + 4;
  const zlib = new Uint8Array(zlibLen);
  zlib[0] = 0x78;
  zlib[1] = 0x01;
  let pos = 2;
  let srcOff = 0;
  for (let b = 0; b < blockCount; b++) {
    const remaining = raw.length - srcOff;
    const len = Math.min(MAX_BLOCK, remaining);
    const isFinal = b === blockCount - 1 ? 1 : 0;
    zlib[pos++] = isFinal;
    zlib[pos++] = len & 0xff;
    zlib[pos++] = (len >>> 8) & 0xff;
    const nlen = ~len & 0xffff;
    zlib[pos++] = nlen & 0xff;
    zlib[pos++] = (nlen >>> 8) & 0xff;
    zlib.set(raw.subarray(srcOff, srcOff + len), pos);
    pos += len;
    srcOff += len;
  }
  writeU32BE(zlib, pos, adler32(raw));

  const ihdr = new Uint8Array(13);
  writeU32BE(ihdr, 0, dim);
  writeU32BE(ihdr, 4, dim);
  ihdr[8] = 8; // 8-bit grayscale
  ihdr[9] = 0; // colorType grayscale

  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makePngChunk('IHDR', ihdr);
  const idatChunk = makePngChunk('IDAT', zlib);
  const iendChunk = makePngChunk('IEND', new Uint8Array(0));

  const png = new Uint8Array(sig.length + ihdrChunk.length + idatChunk.length + iendChunk.length);
  let p = 0;
  png.set(sig, p); p += sig.length;
  png.set(ihdrChunk, p); p += ihdrChunk.length;
  png.set(idatChunk, p); p += idatChunk.length;
  png.set(iendChunk, p);
  return encodeBase64(png);
}
