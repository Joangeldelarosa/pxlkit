/**
 * <pxl-data-table>'s Angular API: two-way bound TanStack state (sorting, row
 * selection, pagination, filtering, column visibility) with signals, unbound
 * state and its change outputs, `(rowClick)`, template and component cells,
 * and the empty-state template.
 */
import { Component, TemplateRef, computed, input, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PixelDataTable, createColumnHelper, flexRenderComponent, type ColumnDef } from '../../public-api';

interface Person {
  id: string;
  name: string;
  age: number;
}

const PEOPLE: Person[] = [
  { id: 'p1', name: 'Ada', age: 36 },
  { id: 'p2', name: 'Linus', age: 54 },
  { id: 'p3', name: 'Grace', age: 85 },
];
const helper = createColumnHelper<Person>();
const COLUMNS = [helper.accessor('name', { header: 'Name' }), helper.accessor('age', { header: 'Age' })] as ColumnDef<
  Person,
  unknown
>[];

const names = (root: HTMLElement) => Array.from(root.querySelectorAll('tbody tr'), (row) => row.querySelector('td')!.textContent!.trim());
const checkboxes = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
const button = (root: HTMLElement, label: string) => root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

describe('PixelDataTable', () => {
  it('follows a two-way bound sorting signal, and updates it', async () => {
    @Component({
      imports: [PixelDataTable],
      template: `<pxl-data-table [data]="people" [columns]="columns" [(sorting)]="sorting" />`,
    })
    class Host {
      readonly people = PEOPLE;
      readonly columns = COLUMNS;
      readonly sorting = signal<{ id: string; desc: boolean }[] | undefined>([]);
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    button(root, 'Sort by Name').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.sorting()).toEqual([{ id: 'name', desc: false }]);
    expect(names(root)).toEqual(['Ada', 'Grace', 'Linus']);
    // TanStack sorts numbers descending first.
    button(root, 'Sort by Age').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.sorting()).toEqual([{ id: 'age', desc: true }]);
    fixture.componentInstance.sorting.set([{ id: 'name', desc: true }]);
    await fixture.whenStable();
    expect(names(root)).toEqual(['Linus', 'Grace', 'Ada']);
    expect(Array.from(root.querySelectorAll('th'), (th) => th.getAttribute('aria-sort'))).toEqual(['descending', 'none']);
  });

  it('sorts on its own when unbound, reporting each sort, and adds no pagination bar on its resets', async () => {
    @Component({
      imports: [PixelDataTable],
      template: `<pxl-data-table [data]="people" [columns]="columns" (sortingChange)="sorts.push($event)" />`,
    })
    class Host {
      readonly people = PEOPLE;
      readonly columns = COLUMNS;
      readonly sorts: unknown[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    button(root, 'Sort by Name').click();
    await fixture.whenStable();
    button(root, 'Sort by Name').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.sorts).toEqual([[{ id: 'name', desc: false }], [{ id: 'name', desc: true }]]);
    expect(names(root)).toEqual(['Linus', 'Grace', 'Ada']);
    expect(root.querySelector('select')).toBeNull();
  });

  it('adds a selection column once rowSelection is bound, and round-trips it', async () => {
    @Component({
      imports: [PixelDataTable],
      template: `<pxl-data-table [data]="people" [columns]="columns" [getRowId]="rowId" [(rowSelection)]="selection" />`,
    })
    class Host {
      readonly people = PEOPLE;
      readonly columns = COLUMNS;
      readonly rowId = (row: Person) => row.id;
      readonly selection = signal<Record<string, boolean> | undefined>({});
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const [header, ada, linus] = checkboxes(root);
    expect(ada!.getAttribute('aria-label')).toBe('Select row p1');
    linus!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selection()).toEqual({ p2: true });
    expect(header!.indeterminate).toBe(true);
    expect(root.querySelector('tr[data-row-id="p2"]')!.getAttribute('data-selected')).toBe('true');
    header!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selection()).toEqual({ p1: true, p2: true, p3: true });
    fixture.componentInstance.selection.set({ p3: true });
    await fixture.whenStable();
    expect(checkboxes(root).map((box) => box.checked)).toEqual([false, false, false, true]);
    // The same elements throughout, so a checkbox keeps its focus as React's does.
    expect(checkboxes(root).slice(0, 3)).toEqual([header, ada, linus]);
    fixture.componentInstance.selection.set(undefined);
    await fixture.whenStable();
    expect(checkboxes(root)).toEqual([]);
  });

  it('adds a pagination bar once pagination is bound, and round-trips the page', async () => {
    @Component({
      imports: [PixelDataTable],
      template: `<pxl-data-table [data]="people" [columns]="columns" [(pagination)]="pagination" />`,
    })
    class Host {
      readonly people = PEOPLE;
      readonly columns = COLUMNS;
      readonly pagination = signal<{ pageIndex: number; pageSize: number } | undefined>({ pageIndex: 0, pageSize: 2 });
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const host = fixture.componentInstance;
    expect(root.querySelectorAll('tbody tr')).toHaveLength(2);
    button(root, 'Next page').click();
    await fixture.whenStable();
    expect(host.pagination()).toEqual({ pageIndex: 1, pageSize: 2 });
    expect(names(root)).toEqual(['Grace']);
    expect(root.querySelector('[aria-live="polite"]')!.textContent).toBe('Page 2 of 2');
    // Sorting returns to the first page, which the binding hears of.
    button(root, 'Sort by Age').click();
    await fixture.whenStable();
    expect(host.pagination()).toEqual({ pageIndex: 0, pageSize: 2 });
    const select = root.querySelector('select')!;
    expect(select.value).toBe('2');
    select.value = '10';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(host.pagination()).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(root.querySelectorAll('tbody tr')).toHaveLength(3);
    host.pagination.set({ pageIndex: 0, pageSize: 1 });
    await fixture.whenStable();
    expect(root.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('filters by a bound filtering record, and reports filters its columns set from a header template', async () => {
    @Component({
      imports: [PixelDataTable],
      template: `
        <pxl-data-table [data]="people" [columns]="columns()" [(filtering)]="filtering" />
        <ng-template #filter let-header>
          <input aria-label="Filter names" (input)="header.column.setFilterValue($any($event.target).value)" />
        </ng-template>
      `,
    })
    class Host {
      private readonly filter = viewChild.required<TemplateRef<unknown>>('filter');
      readonly people = PEOPLE;
      readonly filtering = signal<Record<string, string> | undefined>({ name: 'a' });
      readonly columns = computed(
        () =>
          [
            helper.accessor('name', { header: () => this.filter(), enableSorting: false }),
            helper.accessor('age', { header: 'Age' }),
          ] as ColumnDef<Person, unknown>[],
      );
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(names(root)).toEqual(['Ada', 'Grace']);
    const filter = root.querySelector<HTMLInputElement>('input[aria-label="Filter names"]')!;
    filter.value = 'lin';
    filter.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.filtering()).toEqual({ name: 'lin' });
    expect(names(root)).toEqual(['Linus']);
  });

  it('hides the columns a bound visibility turns off', async () => {
    @Component({
      imports: [PixelDataTable],
      template: `<pxl-data-table [data]="people" [columns]="columns" [(columnVisibility)]="visibility" />`,
    })
    class Host {
      readonly people = PEOPLE;
      readonly columns = COLUMNS;
      readonly visibility = signal<Record<string, boolean> | undefined>({ age: false });
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(Array.from(root.querySelectorAll('th'), (th) => th.textContent!.trim())).toEqual(['Name']);
    expect(root.querySelector('tbody tr')!.querySelectorAll('td')).toHaveLength(1);
    fixture.componentInstance.visibility.set({});
    await fixture.whenStable();
    expect(root.querySelectorAll('th')).toHaveLength(2);
  });

  it('reports clicks on clickable rows with their data', async () => {
    @Component({
      imports: [PixelDataTable],
      template: `<pxl-data-table [data]="people" [columns]="columns" [clickableRows]="clickable()" (rowClick)="clicked.push($event)" />`,
    })
    class Host {
      readonly people = PEOPLE;
      readonly columns = COLUMNS;
      readonly clickable = signal(true);
      readonly clicked: Person[] = [];
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelectorAll<HTMLElement>('tbody tr')[1]!.click();
    expect(fixture.componentInstance.clicked).toEqual([PEOPLE[1]]);
    expect(root.querySelector('tbody tr')!.classList).toContain('cursor-pointer');
    // Reachable and activated from the keyboard too.
    const lastRow = root.querySelectorAll<HTMLElement>('tbody tr')[2]!;
    expect(lastRow.getAttribute('tabindex')).toBe('0');
    lastRow.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    lastRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(fixture.componentInstance.clicked).toEqual([PEOPLE[1], PEOPLE[2]]);
    fixture.componentInstance.clickable.set(false);
    await fixture.whenStable();
    root.querySelector<HTMLElement>('tbody tr')!.click();
    expect(fixture.componentInstance.clicked).toHaveLength(2);
    expect(root.querySelector('tbody tr')!.classList).not.toContain('cursor-pointer');
    expect(root.querySelector('tbody tr')!.hasAttribute('tabindex')).toBe(false);
  });

  it('renders template and component cells, its empty-state template, and up to a page of skeleton rows', async () => {
    @Component({
      selector: 'test-age-cell',
      template: '<b>{{ age() }} years</b>',
    })
    class AgeCell {
      readonly age = input.required<number>();
    }
    @Component({
      imports: [PixelDataTable],
      template: `
        <pxl-data-table
          [data]="people()"
          [columns]="columns()"
          [loading]="loading()"
          [pagination]="pagination()"
          [emptyState]="empty"
        />
        <ng-template #name let-cell><strong>{{ cell.getValue() }}</strong></ng-template>
        <ng-template #empty><em>Nobody yet</em></ng-template>
      `,
    })
    class Host {
      private readonly name = viewChild.required<TemplateRef<unknown>>('name');
      readonly people = signal(PEOPLE);
      readonly loading = signal(false);
      readonly pagination = signal<{ pageIndex: number; pageSize: number } | undefined>(undefined);
      readonly columns = computed(
        () =>
          [
            helper.accessor('name', { header: 'Name', cell: () => this.name() }),
            helper.accessor('age', { header: 'Age', cell: (info) => flexRenderComponent(AgeCell, { inputs: { age: info.getValue() } }) }),
          ] as ColumnDef<Person, unknown>[],
      );
    }
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const host = fixture.componentInstance;
    expect(Array.from(root.querySelectorAll('tbody strong'), (cell) => cell.textContent)).toEqual(['Ada', 'Linus', 'Grace']);
    expect(Array.from(root.querySelectorAll('tbody b'), (cell) => cell.textContent)).toEqual(['36 years', '54 years', '85 years']);
    host.people.set([]);
    await fixture.whenStable();
    expect(root.querySelector('tbody em')!.textContent).toBe('Nobody yet');
    host.loading.set(true);
    host.pagination.set({ pageIndex: 0, pageSize: 2 });
    await fixture.whenStable();
    expect(root.querySelectorAll('tbody tr:not(.sr-only)')).toHaveLength(2);
    expect(root.querySelector('[role="status"]')!.textContent).toBe('Loading data…');
  });
});
