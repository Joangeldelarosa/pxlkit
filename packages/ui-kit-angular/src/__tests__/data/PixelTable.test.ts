/**
 * <pxl-table>'s Angular API: `[(sort)]` and `[(selectedIds)]` with signals,
 * uncontrolled state and its change outputs, `(rowClick)`, cell and header
 * templates, the empty-state template and row ids.
 */
import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  PixelTable,
  type PixelTableCellContext,
  type PixelTableColumn,
  type PixelTableRowClick,
  type PixelTableSortState,
} from '../../public-api';

interface Person {
  id: string;
  name: string;
  age: number;
}

const PEOPLE: Person[] = [
  { id: 'c', name: 'Carol', age: 41 },
  { id: 'a', name: 'Alice', age: 25 },
  { id: 'b', name: 'Bob', age: 33 },
];
const COLUMNS: PixelTableColumn<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true, align: 'right', width: 80 },
];

const names = (root: HTMLElement) => Array.from(root.querySelectorAll('tbody tr'), (row) => row.querySelector('td')!.textContent!.trim());
const checkboxes = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
const sortButton = (root: HTMLElement, header: string) =>
  root.querySelector<HTMLButtonElement>(`button[aria-label="Sort by ${header}"]`)!;

describe('PixelTable', () => {
  it('follows a two-way bound sort signal, and updates it', async () => {
    @Component({
      imports: [PixelTable],
      template: `<pxl-table [columns]="columns" [data]="people" [(sort)]="sort" />`,
    })
    class Host {
      readonly columns = COLUMNS;
      readonly people = PEOPLE;
      readonly sort = signal<PixelTableSortState | undefined>({ key: 'age', dir: 'asc' });
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(names(root)).toEqual(['Alice', 'Bob', 'Carol']);
    sortButton(root, 'Age').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.sort()).toEqual({ key: 'age', dir: 'desc' });
    expect(names(root)).toEqual(['Carol', 'Bob', 'Alice']);
    fixture.componentInstance.sort.set({ key: 'name', dir: 'asc' });
    await fixture.whenStable();
    expect(names(root)).toEqual(['Alice', 'Bob', 'Carol']);
    expect(Array.from(root.querySelectorAll('th'), (th) => th.getAttribute('aria-sort'))).toEqual(['ascending', 'none']);
  });

  it('sorts on its own when unbound, reporting each sort', async () => {
    @Component({
      imports: [PixelTable],
      template: `<pxl-table [columns]="columns" [data]="people" (sortChange)="sorts.push($event)" />`,
    })
    class Host {
      readonly columns = COLUMNS;
      readonly people = PEOPLE;
      readonly sorts: Array<PixelTableSortState | undefined> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(names(root)).toEqual(['Carol', 'Alice', 'Bob']);
    sortButton(root, 'Name').click();
    await fixture.whenStable();
    expect(names(root)).toEqual(['Alice', 'Bob', 'Carol']);
    expect(fixture.componentInstance.sorts).toEqual([{ key: 'name', dir: 'asc' }]);
  });

  it('follows a two-way bound selection signal, with an indeterminate header in between, and updates it', async () => {
    @Component({
      imports: [PixelTable],
      template: `<pxl-table [columns]="columns" [data]="people" selection="multi" [(selectedIds)]="selected" />`,
    })
    class Host {
      readonly columns = COLUMNS;
      readonly people = PEOPLE;
      readonly selected = signal<string[]>([]);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const [header, carol] = checkboxes(root);
    carol!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toEqual(['c']);
    expect(header!.indeterminate).toBe(true);
    expect(header!.hasAttribute('indeterminate')).toBe(false);
    expect(root.querySelector('tr[data-row-id="c"]')!.getAttribute('data-selected')).toBe('true');
    header!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toEqual(['c', 'a', 'b']);
    expect(header!.indeterminate).toBe(false);
    fixture.componentInstance.selected.set(['b']);
    await fixture.whenStable();
    expect(checkboxes(root).map((input) => input.checked)).toEqual([false, false, false, true]);
  });

  it('keeps a single selection of its own, and reports clicks on clickable rows only', async () => {
    @Component({
      imports: [PixelTable],
      template: `
        <pxl-table
          [columns]="columns"
          [data]="people"
          selection="single"
          [clickableRows]="clickable()"
          (selectedIdsChange)="selections.push($event)"
          (rowClick)="clicks.push($event)"
        />
      `,
    })
    class Host {
      readonly columns = COLUMNS;
      readonly people = PEOPLE;
      readonly clickable = signal(true);
      readonly selections: Array<string[] | undefined> = [];
      readonly clicks: Array<PixelTableRowClick<Person>> = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('thead input')).toBeNull();
    expect(root.querySelector('thead .sr-only')!.textContent).toBe('Select');
    root.querySelectorAll<HTMLInputElement>('tbody input')[1]!.click();
    await fixture.whenStable();
    root.querySelectorAll<HTMLInputElement>('tbody input')[2]!.click();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    expect(host.selections).toEqual([['a'], ['b']]);
    expect(checkboxes(root).map((input) => input.checked)).toEqual([false, false, true]);
    expect(host.clicks).toEqual([]);
    root.querySelectorAll<HTMLElement>('tbody td')[4]!.click();
    expect(host.clicks).toEqual([{ row: PEOPLE[1], index: 1 }]);
    expect(root.querySelector('tbody tr')!.classList).toContain('cursor-pointer');
    // Reachable and activated from the keyboard too, leaving a control inside it its keys.
    const lastRow = root.querySelectorAll<HTMLElement>('tbody tr')[2]!;
    expect(lastRow.getAttribute('tabindex')).toBe('0');
    lastRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    lastRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true }));
    lastRow.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    expect(host.clicks).toEqual([
      { row: PEOPLE[1], index: 1 },
      { row: PEOPLE[2], index: 2 },
    ]);
    host.clickable.set(false);
    await fixture.whenStable();
    root.querySelectorAll<HTMLElement>('tbody td')[1]!.click();
    expect(host.clicks).toHaveLength(2);
    expect(root.querySelector('tbody tr')!.classList).not.toContain('cursor-pointer');
    expect(root.querySelector('tbody tr')!.hasAttribute('tabindex')).toBe(false);
  });

  it('renders cell and header templates, sizes columns and identifies rows', async () => {
    @Component({
      imports: [PixelTable],
      template: `
        <pxl-table [columns]="columns()" [data]="people" [getRowId]="rowId" />
        <ng-template #who><em>Who</em></ng-template>
        <ng-template #age let-person let-index="index"><b>{{ person.age }} (#{{ index }})</b></ng-template>
      `,
    })
    class Host {
      private readonly who = viewChild.required<TemplateRef<unknown>>('who');
      private readonly age = viewChild.required<TemplateRef<PixelTableCellContext<Person>>>('age');
      readonly people = PEOPLE;
      readonly rowId = (row: Person) => `person-${row.id}`;
      readonly columns = computed<PixelTableColumn<Person>[]>(() => [
        { key: 'name', header: this.who() },
        { key: 'age', header: 'Age', width: '30%', render: () => this.age() },
        { key: 'id', header: 'Id', render: (row) => row.id.toUpperCase() },
      ]);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('th em')!.textContent).toBe('Who');
    expect(Array.from(root.querySelectorAll('tbody b'), (b) => b.textContent)).toEqual(['41 (#0)', '25 (#1)', '33 (#2)']);
    expect(Array.from(root.querySelectorAll('tbody tr'), (row) => row.lastElementChild!.textContent!.trim())).toEqual([
      'C',
      'A',
      'B',
    ]);
    expect(root.querySelectorAll('th')[1]!.getAttribute('style')).toBe('width: 30%;');
    expect(Array.from(root.querySelectorAll('tbody tr'), (row) => row.getAttribute('data-row-id'))).toEqual([
      'person-c',
      'person-a',
      'person-b',
    ]);
  });

  it('shows its empty-state template without data, and skeletons instead while loading', async () => {
    @Component({
      imports: [PixelTable],
      template: `
        <pxl-table [columns]="columns" [data]="[]" [loading]="loading()" [emptyState]="empty" />
        <ng-template #empty><strong>Nobody yet</strong></ng-template>
      `,
    })
    class Host {
      readonly columns = COLUMNS;
      readonly loading = signal(false);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('tbody td')!.getAttribute('colspan')).toBe('2');
    expect(root.querySelector('tbody strong')!.textContent).toBe('Nobody yet');
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(root.querySelector('strong')).toBeNull();
    expect(root.querySelector('tbody')!.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelector('[role="status"]')!.textContent).toBe('Loading data…');
    expect(root.querySelectorAll('[data-skeleton]')).toHaveLength(10);
  });
});
