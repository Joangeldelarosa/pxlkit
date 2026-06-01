import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import robots from './robots';

describe('sitemap()', () => {
  const result = sitemap();

  it('returns a non-empty array', () => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('every entry has url, lastModified, changeFrequency, priority', () => {
    for (const entry of result) {
      expect(typeof entry.url).toBe('string');
      expect(entry.url).toMatch(/^https:\/\/pxlkit\.xyz/);
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(typeof entry.changeFrequency).toBe('string');
      expect(typeof entry.priority).toBe('number');
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });

  it('includes the public routes the SEO contract requires', () => {
    const urls = result.map((r) => r.url);
    const required = [
      'https://pxlkit.xyz',
      'https://pxlkit.xyz/ui-kit',
      'https://pxlkit.xyz/docs',
      'https://pxlkit.xyz/pricing',
      'https://pxlkit.xyz/templates',
      'https://pxlkit.xyz/templates/dashboards',
      'https://pxlkit.xyz/templates/docs',
      'https://pxlkit.xyz/templates/landing-full',
      'https://pxlkit.xyz/templates/portfolio',
      'https://pxlkit.xyz/templates/ecommerce',
      'https://pxlkit.xyz/changelog',
      'https://pxlkit.xyz/explore',
      'https://pxlkit.xyz/icons',
      'https://pxlkit.xyz/builder',
    ];
    for (const url of required) {
      expect(urls).toContain(url);
    }
  });

  it('home route has the highest priority', () => {
    const home = result.find((r) => r.url === 'https://pxlkit.xyz');
    expect(home).toBeDefined();
    expect(home?.priority).toBe(1.0);
  });
});

describe('robots()', () => {
  const result = robots();

  it('has rules and a sitemap reference', () => {
    expect(Array.isArray(result.rules)).toBe(true);
    expect(result.sitemap).toBe('https://pxlkit.xyz/sitemap.xml');
  });

  it('disallows /api/ and /dev/ for all rule blocks', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    for (const rule of rules) {
      const disallow = rule.disallow;
      const list = Array.isArray(disallow) ? disallow : disallow ? [disallow] : [];
      expect(list).toContain('/api/');
      expect(list).toContain('/dev/');
    }
  });

  it('allows / for the wildcard user agent', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcard = rules.find((r) => r.userAgent === '*');
    expect(wildcard).toBeDefined();
    expect(wildcard?.allow).toBe('/');
  });
});
