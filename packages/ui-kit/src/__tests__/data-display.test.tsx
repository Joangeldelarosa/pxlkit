import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelCard } from '../cards/PixelCard';
import { PixelStatCard } from '../cards/PixelStatCard';
import { PixelTable } from '../data/PixelTable';

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelCard — Ola 2 additive upgrade
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelCard — legacy behavior preserved', () => {
  it('renders title + children inside an <article> by default', () => {
    const { container } = render(
      <PixelCard title="Hello">
        <p>body content</p>
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article!.textContent).toContain('Hello');
    expect(article!.textContent).toContain('body content');
  });

  it('renders footer when provided', () => {
    render(
      <PixelCard title="Card" footer={<span>foot</span>}>
        body
      </PixelCard>,
    );
    const footer = document.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer!.textContent).toBe('foot');
  });
});

describe('PixelCard — tone tint', () => {
  it('applies cyan tone classes when tone="cyan"', () => {
    const { container } = render(
      <PixelCard title="Card" tone="cyan">
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article!.className).toContain('border-retro-cyan');
  });

  it('does not apply tone classes when tone is omitted', () => {
    const { container } = render(<PixelCard title="Card">body</PixelCard>);
    const article = container.querySelector('article');
    expect(article!.className).not.toContain('border-retro-cyan');
  });
});

describe('PixelCard — interactive hover', () => {
  it('adds hover translate class when interactive', () => {
    const { container } = render(
      <PixelCard title="Card" interactive>
        body
      </PixelCard>,
    );
    // Interactive cards render a <div role="button"> — <article> does not
    // permit role="button".
    const card = container.querySelector('[role="button"]');
    expect(card!.className).toContain('hover:-translate-y-[2px]');
    expect(card!.className).toContain('hover:shadow-lg');
  });

  it('omits hover translate when interactive is not set', () => {
    const { container } = render(<PixelCard title="Card">body</PixelCard>);
    const article = container.querySelector('article');
    expect(article!.className).not.toContain('hover:-translate-y-[2px]');
  });
});

describe('PixelCard — media slot', () => {
  it('renders media node when provided', () => {
    render(
      <PixelCard
        title="Card"
        media={<img data-testid="media-img" src="x" alt="" />}
      >
        body
      </PixelCard>,
    );
    expect(screen.getByTestId('media-img')).toBeInTheDocument();
  });

  it('adds overflow-hidden to the root when media is present', () => {
    const { container } = render(
      <PixelCard title="Card" media={<div>m</div>}>
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('overflow-hidden');
  });
});

describe('PixelCard — badge ribbon', () => {
  it('renders a ribbon-like element when badge is provided', () => {
    render(
      <PixelCard title="Card" badge={{ label: 'NEW', tone: 'gold' }}>
        body
      </PixelCard>,
    );
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('places the badge inside an absolutely-positioned wrapper', () => {
    const { container } = render(
      <PixelCard title="Card" badge={{ label: 'HOT' }}>
        body
      </PixelCard>,
    );
    const badgeNode = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'HOT',
    );
    expect(badgeNode).toBeDefined();
    expect(badgeNode!.className).toContain('absolute');
  });
});

describe('PixelCard — description', () => {
  it('renders description as a paragraph', () => {
    const { container } = render(
      <PixelCard title="Card" description="A short blurb of muted copy.">
        body
      </PixelCard>,
    );
    const ps = Array.from(container.querySelectorAll('p'));
    const desc = ps.find((p) => p.textContent === 'A short blurb of muted copy.');
    expect(desc).toBeDefined();
    expect(desc!.className).toContain('text-retro-muted');
  });

  it('applies line-clamp-3 + min-h-[3em] when descriptionLines=3', () => {
    const { container } = render(
      <PixelCard title="Card" description="lorem" descriptionLines={3}>
        body
      </PixelCard>,
    );
    const desc = Array.from(container.querySelectorAll('p')).find(
      (p) => p.textContent === 'lorem',
    );
    expect(desc).toBeDefined();
    expect(desc!.className).toContain('line-clamp-3');
    expect(desc!.className).toContain('min-h-[3em]');
  });

  it('applies line-clamp-2 when descriptionLines=2', () => {
    const { container } = render(
      <PixelCard title="Card" description="x" descriptionLines={2}>
        body
      </PixelCard>,
    );
    const desc = Array.from(container.querySelectorAll('p')).find(
      (p) => p.textContent === 'x',
    );
    expect(desc!.className).toContain('line-clamp-2');
  });
});

describe('PixelCard — href turns root into <a>', () => {
  it('renders an anchor with the given href when href is provided', () => {
    const { container } = render(
      <PixelCard title="Card" href="/somewhere">
        body
      </PixelCard>,
    );
    const a = container.querySelector('a');
    expect(a).not.toBeNull();
    expect(a!.getAttribute('href')).toBe('/somewhere');
    expect(container.querySelector('article')).toBeNull();
  });

  it('keeps tone + interactive classes on the anchor variant', () => {
    const { container } = render(
      <PixelCard title="Card" href="/x" tone="cyan" interactive>
        body
      </PixelCard>,
    );
    const a = container.querySelector('a');
    expect(a!.className).toContain('border-retro-cyan');
    expect(a!.className).toContain('hover:-translate-y-[2px]');
  });
});

describe('PixelCard — padding scale', () => {
  it('applies p-2 when padding="sm"', () => {
    const { container } = render(
      <PixelCard title="Card" padding="sm">
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('p-2');
  });

  it('applies p-6 when padding="lg"', () => {
    const { container } = render(
      <PixelCard title="Card" padding="lg">
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('p-6');
  });

  it('applies p-0 when padding="none"', () => {
    const { container } = render(
      <PixelCard title="Card" padding="none">
        body
      </PixelCard>,
    );
    const article = container.querySelector('article');
    expect(article!.className).toContain('p-0');
  });
});

describe('PixelCard — named slot subcomponents', () => {
  it('renders PixelCard.Header as a <header> element with bottom border', () => {
    const { container } = render(
      <PixelCard.Header data-testid="hdr">
        <span>head</span>
      </PixelCard.Header>,
    );
    const hdr = container.querySelector('header');
    expect(hdr).not.toBeNull();
    expect(hdr!.className).toContain('border-b');
    expect(hdr!.textContent).toContain('head');
  });

  it('renders PixelCard.Body as a flex-1 <div>', () => {
    const { container } = render(
      <PixelCard.Body data-testid="body">
        <span>body</span>
      </PixelCard.Body>,
    );
    const body = container.querySelector('[data-testid="body"]');
    expect(body).not.toBeNull();
    expect((body as HTMLElement).className).toContain('flex-1');
    expect(body!.textContent).toContain('body');
  });

  it('renders PixelCard.Footer as a <footer> with mt-auto + top border', () => {
    const { container } = render(
      <PixelCard.Footer>
        <span>foot</span>
      </PixelCard.Footer>,
    );
    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer!.className).toContain('mt-auto');
    expect(footer!.className).toContain('border-t');
    expect(footer!.textContent).toContain('foot');
  });

  it('exposes Header / Body / Footer as static properties on PixelCard', () => {
    expect(PixelCard.Header).toBeDefined();
    expect(PixelCard.Body).toBeDefined();
    expect(PixelCard.Footer).toBeDefined();
  });

  it('skips the implicit title-header when an explicit PixelCard.Header is in children', () => {
    const { container } = render(
      <PixelCard title="Implicit">
        <PixelCard.Header>
          <span>Explicit Header</span>
        </PixelCard.Header>
        <p>body</p>
      </PixelCard>,
    );
    const headers = container.querySelectorAll('header');
    expect(headers.length).toBe(1);
    expect(headers[0].textContent).toContain('Explicit Header');
    expect(container.textContent).not.toContain('Implicit');
  });
});

describe('PixelCard — interactive without href', () => {
  it('renders role="button" + tabIndex=0 + focus-visible ring when interactive', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelCard title="Card" interactive onClick={onClick}>
        body
      </PixelCard>,
    );
    // Interactive cards render a <div role="button"> — <article> does not
    // permit role="button" (axe: aria-allowed-role).
    expect(container.querySelector('article')).toBeNull();
    const card = container.querySelector('div[role="button"]');
    expect(card).not.toBeNull();
    expect(card!.getAttribute('tabindex')).toBe('0');
    expect(card!.className).toContain('focus-visible:ring-2');
  });

  it('Enter key activates onClick on the interactive non-href card', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelCard title="Card" interactive onClick={onClick}>
        body
      </PixelCard>,
    );
    const card = container.querySelector('div[role="button"]') as HTMLElement;
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });
});

describe('PixelCard — DOM prop pass-through', () => {
  it('forwards className, data-* and aria-* to the root', () => {
    const { container } = render(
      <PixelCard
        title="Card"
        className="custom-cls"
        data-foo="bar"
        aria-label="A card"
      >
        body
      </PixelCard>,
    );
    const article = container.querySelector('article')!;
    expect(article.className).toContain('custom-cls');
    expect(article.getAttribute('data-foo')).toBe('bar');
    expect(article.getAttribute('aria-label')).toBe('A card');
  });

  it('forwards anchor-specific attributes when href is set', () => {
    const { container } = render(
      <PixelCard title="Card" href="/x" target="_blank" rel="noopener">
        body
      </PixelCard>,
    );
    const a = container.querySelector('a')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelStatCard — Ola 2 additive upgrade
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelStatCard — legacy behavior preserved', () => {
  it('renders label + value at default size/position', () => {
    const { container } = render(<PixelStatCard label="Users" value="1,234" />);
    expect(container.textContent).toContain('Users');
    expect(container.textContent).toContain('1,234');
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('p-4');
  });

  it('renders trend when provided', () => {
    render(<PixelStatCard label="Users" value="1,234" trend="+5%" />);
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });
});

describe('PixelStatCard — size prop', () => {
  it('size="sm" applies smaller padding', () => {
    const { container } = render(<PixelStatCard label="L" value="V" size="sm" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('p-3');
  });

  it('size="lg" applies larger padding and font sizes', () => {
    const { container } = render(<PixelStatCard label="L" value="V" size="lg" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('p-6');
    const ps = Array.from(container.querySelectorAll('p'));
    const labelEl = ps.find((p) => p.textContent === 'L');
    const valueEl = ps.find((p) => p.textContent === 'V');
    expect(labelEl!.className).toContain('text-sm');
    expect(valueEl!.className).toMatch(/text-(lg|2xl)/);
  });
});

describe('PixelStatCard — iconPosition prop', () => {
  it('iconPosition="right" renders icon in right cell of a grid', () => {
    const { container, getByTestId } = render(
      <PixelStatCard
        label="L"
        value="V"
        iconPosition="right"
        icon={<span data-testid="ico">i</span>}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('grid');
    expect(root.className).toContain('grid-cols-[1fr_auto]');
    const icon = getByTestId('ico');
    // Icon should be the last cell of the grid
    expect(root.lastElementChild!.contains(icon)).toBe(true);
  });

  it('iconPosition="bottom-left" renders icon at absolute bottom-left', () => {
    const { container, getByTestId } = render(
      <PixelStatCard
        label="L"
        value="V"
        iconPosition="bottom-left"
        icon={<span data-testid="ico">i</span>}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('relative');
    const iconWrapper = getByTestId('ico').parentElement!;
    expect(iconWrapper.className).toContain('absolute');
    expect(iconWrapper.className).toContain('bottom-0');
    expect(iconWrapper.className).toContain('left-0');
  });

  it('iconPosition="left" places icon before content in a flex row', () => {
    const { container, getByTestId } = render(
      <PixelStatCard
        label="L"
        value="V"
        iconPosition="left"
        icon={<span data-testid="ico">i</span>}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('flex');
    const icon = getByTestId('ico');
    expect(root.firstElementChild!.contains(icon)).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelTable — Ola 4a additive upgrade
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelTable — legacy behavior preserved', () => {
  it('renders headers + rows from the legacy columns/data shape', () => {
    const cols = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ];
    const rows = [
      { name: 'Alice', role: 'Admin' },
      { name: 'Bob', role: 'User' },
    ];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const ths = container.querySelectorAll('th');
    expect(ths.length).toBe(2);
    expect(ths[0].textContent).toBe('Name');
    const tds = container.querySelectorAll('tbody td');
    expect(tds.length).toBe(4);
    expect(tds[0].textContent).toBe('Alice');
    expect(tds[3].textContent).toBe('User');
  });

  it('applies striped class on odd rows by default', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }, { n: 'b' }, { n: 'c' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const trs = container.querySelectorAll('tbody tr');
    expect(trs[1].className).toContain('bg-retro-surface/15');
    expect(trs[0].className).not.toContain('bg-retro-surface/15');
  });

  it('forwards legacy column.className to th and td', () => {
    const cols = [{ key: 'n', header: 'N', className: 'legacy-col-cls' }];
    const rows = [{ n: 'a' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const th = container.querySelector('th')!;
    const td = container.querySelector('tbody td')!;
    expect(th.className).toContain('legacy-col-cls');
    expect(td.className).toContain('legacy-col-cls');
  });
});

describe('PixelTable — columns + data drives header + rows', () => {
  it('uses column.render when provided, falling back to row[key]', () => {
    type R = { id: string; name: string };
    const cols = [
      { key: 'name', header: 'Name' },
      { key: 'badge', header: 'Tag', render: (row: R) => <span data-testid={`b-${row.id}`}>★{row.name}</span> },
    ];
    const rows: R[] = [{ id: '1', name: 'Ann' }];
    const { getByTestId, container } = render(<PixelTable<R> columns={cols} data={rows} />);
    expect(getByTestId('b-1').textContent).toBe('★Ann');
    const tds = container.querySelectorAll('tbody td');
    expect(tds[0].textContent).toBe('Ann');
  });

  it('applies align className when column.align is set', () => {
    const cols = [
      { key: 'n', header: 'N', align: 'right' as const },
    ];
    const rows = [{ n: 'a' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const th = container.querySelector('th')!;
    const td = container.querySelector('tbody td')!;
    expect(th.className).toContain('text-right');
    expect(td.className).toContain('text-right');
  });

  it('applies column.width as inline style', () => {
    const cols = [
      { key: 'n', header: 'N', width: 120 },
      { key: 'm', header: 'M', width: '40%' },
    ];
    const rows = [{ n: 'a', m: 'b' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const ths = container.querySelectorAll('th');
    expect((ths[0] as HTMLElement).style.width).toBe('120px');
    expect((ths[1] as HTMLElement).style.width).toBe('40%');
  });
});

describe('PixelTable — sortable header', () => {
  it('renders a sort button when column.sortable is true and onSortChange is set', () => {
    const cols = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'age', header: 'Age' },
    ];
    const rows = [{ name: 'a', age: '1' }];
    const onSort = vi.fn();
    const { container } = render(
      <PixelTable columns={cols} data={rows} onSortChange={onSort} />,
    );
    const buttons = container.querySelectorAll('th button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('aria-label')).toBe('Sort by Name');
  });

  it('fires onSortChange with asc on first click of an unsorted column', () => {
    const cols = [{ key: 'name', header: 'Name', sortable: true }];
    const rows = [{ name: 'a' }];
    const onSort = vi.fn();
    const { container } = render(
      <PixelTable columns={cols} data={rows} onSortChange={onSort} />,
    );
    const button = container.querySelector('th button')!;
    fireEvent.click(button);
    expect(onSort).toHaveBeenCalledWith({ key: 'name', dir: 'asc' });
  });

  it('toggles asc -> desc when clicked again on same column', () => {
    const cols = [{ key: 'name', header: 'Name', sortable: true }];
    const rows = [{ name: 'a' }];
    const onSort = vi.fn();
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        sort={{ key: 'name', dir: 'asc' }}
        onSortChange={onSort}
      />,
    );
    const button = container.querySelector('th button')!;
    fireEvent.click(button);
    expect(onSort).toHaveBeenCalledWith({ key: 'name', dir: 'desc' });
  });

  it('sets aria-sort to ascending/descending/none on sortable columns', () => {
    const cols = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'age', header: 'Age', sortable: true },
      { key: 'tag', header: 'Tag' },
    ];
    const rows = [{ name: 'a', age: '1', tag: 't' }];
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        sort={{ key: 'name', dir: 'desc' }}
        onSortChange={vi.fn()}
      />,
    );
    const ths = container.querySelectorAll('th');
    expect(ths[0].getAttribute('aria-sort')).toBe('descending');
    expect(ths[1].getAttribute('aria-sort')).toBe('none');
    expect(ths[2].getAttribute('aria-sort')).toBeNull();
  });

  it('uncontrolled: renders a sort button when column.sortable is true even without onSortChange', () => {
    const cols = [{ key: 'name', header: 'Name', sortable: true }];
    const rows = [{ name: 'a' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    expect(container.querySelectorAll('th button').length).toBe(1);
  });

  it('uncontrolled: clicking sort header reorders rows by the sorted column', () => {
    const cols = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'age', header: 'Age', sortable: true },
    ];
    const rows = [
      { id: 'a', name: 'Charlie', age: 30 },
      { id: 'b', name: 'Alice', age: 25 },
      { id: 'c', name: 'Bob', age: 28 },
    ];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const nameBtn = container.querySelectorAll('th button')[0] as HTMLButtonElement;
    fireEvent.click(nameBtn);
    const bodyRows = container.querySelectorAll('tbody tr');
    expect(bodyRows[0].textContent).toContain('Alice');
    expect(bodyRows[1].textContent).toContain('Bob');
    expect(bodyRows[2].textContent).toContain('Charlie');
    // aria-sort reflects the internal state
    const nameTh = container.querySelectorAll('th')[0];
    expect(nameTh.getAttribute('aria-sort')).toBe('ascending');
    fireEvent.click(nameBtn);
    expect(nameTh.getAttribute('aria-sort')).toBe('descending');
  });
});

describe('PixelTable — selection', () => {
  it('renders a header checkbox + row checkboxes when selection="multi"', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="multi"
        selectedIds={[]}
        onSelectionChange={vi.fn()}
        getRowId={(r) => r.id}
      />,
    );
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3); // 1 header + 2 rows
    expect(checkboxes[0].getAttribute('aria-label')).toBe('Select all rows');
  });

  it('toggles a row when its checkbox is clicked (multi)', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const onSel = vi.fn();
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="multi"
        selectedIds={[]}
        onSelectionChange={onSel}
        getRowId={(r) => r.id}
      />,
    );
    const rowCheckboxes = Array.from(container.querySelectorAll('tbody input[type="checkbox"]'));
    fireEvent.click(rowCheckboxes[1]);
    expect(onSel).toHaveBeenCalledWith(['r2']);
  });

  it('selecting all via header checkbox emits all row ids', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const onSel = vi.fn();
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="multi"
        selectedIds={[]}
        onSelectionChange={onSel}
        getRowId={(r) => r.id}
      />,
    );
    const headerCb = container.querySelector('thead input[type="checkbox"]')!;
    fireEvent.click(headerCb);
    expect(onSel).toHaveBeenCalledWith(['r1', 'r2']);
  });

  it('replaces the previous selection when selection="single"', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const onSel = vi.fn();
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="single"
        selectedIds={['r1']}
        onSelectionChange={onSel}
        getRowId={(r) => r.id}
      />,
    );
    // single mode: no header checkbox (sr-only span)
    expect(container.querySelector('thead input[type="checkbox"]')).toBeNull();
    const rowCheckboxes = Array.from(container.querySelectorAll('tbody input[type="checkbox"]'));
    fireEvent.click(rowCheckboxes[1]);
    expect(onSel).toHaveBeenCalledWith(['r2']);
  });

  it('marks selected rows with data-selected attr + selected bg class', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="multi"
        selectedIds={['r1']}
        onSelectionChange={vi.fn()}
        getRowId={(r) => r.id}
      />,
    );
    const trs = container.querySelectorAll('tbody tr');
    expect(trs[0].getAttribute('data-selected')).toBe('true');
    expect(trs[0].className).toContain('bg-retro-surface/40');
    expect(trs[1].getAttribute('data-selected')).toBeNull();
  });
});

describe('PixelTable — loading state', () => {
  it('renders skeleton rows when loading is true', () => {
    const cols = [{ key: 'a', header: 'A' }, { key: 'b', header: 'B' }];
    const { container } = render(<PixelTable columns={cols} data={[]} loading />);
    const skels = container.querySelectorAll('[data-skeleton]');
    // 5 skeleton rows * 2 cols
    expect(skels.length).toBe(10);
  });

  it('does not render the empty-state message while loading', () => {
    const cols = [{ key: 'a', header: 'A' }];
    const { container } = render(
      <PixelTable columns={cols} data={[]} loading emptyState={<span>NOPE</span>} />,
    );
    expect(container.textContent).not.toContain('NOPE');
  });
});

describe('PixelTable — empty state', () => {
  it('renders the default empty placeholder when data is empty', () => {
    const cols = [{ key: 'a', header: 'A' }];
    const { container } = render(<PixelTable columns={cols} data={[]} />);
    expect(container.textContent).toContain('No data.');
  });

  it('renders a custom emptyState node when provided', () => {
    const cols = [{ key: 'a', header: 'A' }];
    render(
      <PixelTable columns={cols} data={[]} emptyState={<span data-testid="empty">Nothing here</span>} />,
    );
    expect(screen.getByTestId('empty').textContent).toBe('Nothing here');
  });
});

describe('PixelTable — row click', () => {
  it('fires onRowClick with row + index', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }, { n: 'b' }];
    const onClick = vi.fn();
    const { container } = render(
      <PixelTable columns={cols} data={rows} onRowClick={onClick} />,
    );
    const trs = container.querySelectorAll('tbody tr');
    fireEvent.click(trs[1]);
    expect(onClick).toHaveBeenCalledWith({ n: 'b' }, 1);
    expect(trs[1].className).toContain('cursor-pointer');
  });
});

describe('PixelTable — density', () => {
  it('uses compact padding when density="compact"', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }];
    const { container } = render(
      <PixelTable columns={cols} data={rows} density="compact" />,
    );
    const td = container.querySelector('tbody td')!;
    expect(td.className).toContain('px-3');
    expect(td.className).toContain('py-1');
  });

  it('uses comfortable padding when density="comfortable"', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }];
    const { container } = render(
      <PixelTable columns={cols} data={rows} density="comfortable" />,
    );
    const td = container.querySelector('tbody td')!;
    expect(td.className).toContain('py-4');
  });
});

describe('PixelTable — sticky header / first column', () => {
  it('applies sticky top class to thead when stickyHeader is set', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }];
    const { container } = render(
      <PixelTable columns={cols} data={rows} stickyHeader />,
    );
    const thead = container.querySelector('thead')!;
    expect(thead.className).toContain('sticky');
    expect(thead.className).toContain('top-0');
  });

  it('applies sticky left class to first column when stickyFirstColumn is set', () => {
    const cols = [{ key: 'a', header: 'A' }, { key: 'b', header: 'B' }];
    const rows = [{ a: '1', b: '2' }];
    const { container } = render(
      <PixelTable columns={cols} data={rows} stickyFirstColumn />,
    );
    const ths = container.querySelectorAll('th');
    expect(ths[0].className).toContain('sticky');
    expect(ths[0].className).toContain('left-0');
    expect(ths[1].className).not.toContain('sticky');
  });
});
