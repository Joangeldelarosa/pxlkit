import { afterEach, describe, expect, it } from 'vitest';
import { canonicalDom, canonicalHtml, canonicalPage, type CanonicalOptions } from '../canonical';

const same = (a: string, b: string, options?: CanonicalOptions) =>
  expect(canonicalHtml(a, options)).toBe(canonicalHtml(b, options));
const differ = (a: string, b: string, options?: CanonicalOptions) =>
  expect(canonicalHtml(a, options)).not.toBe(canonicalHtml(b, options));

afterEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});

describe('canonicalHtml', () => {
  it('compares classes as a sorted set and drops an empty list', () => {
    same('<i class="b a  a"></i>', '<i class="a b"></i>');
    same('<i class=" "></i>', '<i></i>');
    differ('<i class="a"></i>', '<i class="a b"></i>');
  });

  it('compares styles declaration by declaration, folding vendor aliases', () => {
    same('<i style="top: 0px; left:0"></i>', '<i style="left: 0px;top:0px"></i>');
    same('<i style="-webkit-filter: blur(1px)"></i>', '<i style="filter: blur(1px)"></i>');
    differ('<i style="top: 1px"></i>', '<i style="top: 2px"></i>');
  });

  it('ignores attribute order, comments, framework bookkeeping and whitespace', () => {
    same(
      '<p data-v-1a2b="" b="2" a="1"><!--x-->  hello \n  world </p>',
      '<p a="1" ng-reflect-x="y" _ngcontent-ng-c1="" b="2">hello world</p>',
    );
    differ('<p>hello world</p>', '<p>hello  there</p>');
  });

  it('numbers ids by first appearance in ids, references and #fragments', () => {
    same(
      '<label for="r-1">A</label><input id="r-1"><svg><use href="#r-1"></use></svg>',
      '<label for="v-0">A</label><input id="v-0"><svg><use href="#v-0"></use></svg>',
    );
    same('<p aria-labelledby="x y"></p><b id="y"></b><i id="x"></i>', '<p aria-labelledby="a b"></p><b id="b"></b><i id="a"></i>');
    differ('<label for="a"></label><input id="a">', '<label for="a"></label><input id="b">');
  });

  it('compares form controls by state', () => {
    const a = canonicalHtml('<input value="x">');
    const input = document.createElement('input');
    input.value = 'x';
    document.body.appendChild(input);
    expect(canonicalDom(document.body)).toBe(a);
    same('<input type="checkbox" checked>', '<input type="checkbox" checked="checked">');
    differ('<input type="checkbox" checked>', '<input type="checkbox">');
    same('<textarea>text</textarea>', '<textarea>text</textarea>');
    same('<select><option value="a">A</option><option value="b" selected>B</option></select>', '<select><option value="a">A</option><option selected value="b">B</option></select>');
  });

  it('maps Angular hosts onto the element React renders and drops their implicit role', () => {
    const options: CanonicalOptions = { hostTags: { 'pxl-nav': 'nav', 'pxl-badge': 'span' } };
    same('<pxl-nav role="navigation"><pxl-badge>1</pxl-badge></pxl-nav>', '<nav><span>1</span></nav>', options);
    differ('<pxl-nav role="menu"></pxl-nav>', '<nav></nav>', options);
  });

  it('unwraps bare fragment hosts and flags one an attribute leaked onto', () => {
    const options: CanonicalOptions = { hostTags: { 'pxl-switch': null } };
    same('<pxl-switch style="display: contents" _nghost-ng-1=""><button>on</button></pxl-switch>', '<button>on</button>', options);
    differ('<pxl-switch style="display: contents" id="leak"><button>on</button></pxl-switch>', '<button>on</button>', options);
    expect(canonicalHtml('<pxl-switch title="x"></pxl-switch>', options)).toContain('#host:pxl-switch');
  });

  it('serialises unwrapped containers as their children and leaves out ignored attributes', () => {
    const options: CanonicalOptions = {
      unwrap: (element) => element.hasAttribute('data-root'),
      ignoreAttribute: (_element, name) => name === 'tone',
    };
    same('<div data-root><b tone="cyan">x</b> y</div>', '<b>x</b> y', options);
  });
});

describe('canonicalDom', () => {
  it('marks the focused element, but never <body>', () => {
    document.body.innerHTML = '<button>a</button><button>b</button>';
    const [, second] = Array.from(document.querySelectorAll('button'));
    expect(canonicalDom(document.body)).not.toContain(':focus');
    second!.focus();
    const out = JSON.parse(canonicalDom(document.body));
    expect(out[0].attributes).toEqual([]);
    expect(out[1].attributes).toEqual([[':focus', '']]);
  });

  it('serialises several roots in order', () => {
    const a = document.createElement('div');
    a.innerHTML = '<i id="k"></i>';
    const b = document.createElement('div');
    b.innerHTML = '<b aria-labelledby="k"></b>';
    expect(JSON.parse(canonicalDom([a, b]))).toEqual([
      { tag: 'i', attributes: [['id', '#id0']], children: [] },
      { tag: 'b', attributes: [['aria-labelledby', '#id0']], children: [] },
    ]);
  });
});

describe('canonicalPage', () => {
  it('adds the inline styles of <html> and <body> to the content', () => {
    document.body.innerHTML = '<p>page</p>';
    const before = canonicalPage(document);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.setProperty('scrollbar-gutter', 'stable');
    const after = JSON.parse(canonicalPage(document));
    expect(after.body).toBe('overflow: hidden');
    expect(after.html).toBe('scrollbar-gutter: stable');
    expect(after.content).toEqual(JSON.parse(canonicalDom(document.body)));
    expect(canonicalPage(document)).not.toBe(before);
  });
});
