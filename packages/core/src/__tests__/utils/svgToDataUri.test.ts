import { describe, it, expect } from 'vitest';
import { svgToDataUri, svgToBase64 } from '../../utils/svgToDataUri';

const sampleSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect x="0" y="0" width="1" height="1" fill="#FF0000"/></svg>';

describe('svgToDataUri', () => {
  it('returns string starting with data:image/svg+xml,', () => {
    const uri = svgToDataUri(sampleSvg);
    expect(uri).toMatch(/^data:image\/svg\+xml,/);
  });

  it('encodes special characters', () => {
    const uri = svgToDataUri(sampleSvg);
    // Angle brackets should be encoded
    expect(uri).not.toContain('<');
  });

  it('is round-trippable via decodeURIComponent', () => {
    const uri = svgToDataUri(sampleSvg);
    const dataPrefix = 'data:image/svg+xml,';
    const encoded = uri.slice(dataPrefix.length);
    const decoded = decodeURIComponent(encoded);
    expect(decoded).toBe(sampleSvg);
  });
});

describe('svgToBase64', () => {
  it('returns string starting with data:image/svg+xml;base64,', () => {
    const uri = svgToBase64(sampleSvg);
    expect(uri).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('contains valid base64 content', () => {
    const uri = svgToBase64(sampleSvg);
    const base64Part = uri.split(',')[1];
    expect(base64Part).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('decoding base64 restores original SVG', () => {
    const uri = svgToBase64(sampleSvg);
    const base64Part = uri.split(',')[1];
    const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
    expect(decoded).toBe(sampleSvg);
  });
});
