/**
 * PixelDataTable's Vue API: the `v-model:*` round trips of its TanStack
 * state (sorting, row selection, pagination, filtering, column visibility),
 * uncontrolled state, the `row-click` event, render-function columns and the
 * empty-state slot.
 */
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelDataTable, createColumnHelper, type ColumnDef } from '../../index';

type Person = { id: string; name: string; age: number };

const people: Person[] = [
  { id: 'p1', name: 'Ada', age: 36 },
  { id: 'p2', name: 'Linus', age: 54 },
  { id: 'p3', name: 'Grace', age: 85 },
];
const helper = createColumnHelper<Person>();
const columns = [helper.accessor('name', { header: 'Name' }), helper.accessor('age', { header: 'Age' })] as ColumnDef<
  Person,
  unknown
>[];

// A checkbox fires `change` only in the document, as browsers do.
const attachTo = document.body;

enableAutoUnmount(afterEach);

const names = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('tbody tr').map((row) => row.find('td').text());
const checkboxes = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll<HTMLInputElement>('input[type="checkbox"]').map((input) => input.element);

const PersonTable = PixelDataTable<Person>;

/** A parent rendering the table with `props()`, which bind its state two-way. */
function bound(props: () => Partial<Parameters<typeof PersonTable>[0]>) {
  return mount(defineComponent({ render: () => h(PersonTable, { data: people, columns, ...props() }) }), { attachTo });
}

describe('PixelDataTable', () => {
  it('updates a v-model:sorting binding, and follows it', async () => {
    const sorting = ref<{ id: string; desc: boolean }[]>([]);
    const wrapper = bound(() => ({ sorting: sorting.value, 'onUpdate:sorting': (next) => (sorting.value = next) }));
    await wrapper.get('button[aria-label="Sort by Name"]').trigger('click');
    expect(sorting.value).toEqual([{ id: 'name', desc: false }]);
    expect(names(wrapper)).toEqual(['Ada', 'Grace', 'Linus']);
    // TanStack sorts numbers descending first.
    await wrapper.get('button[aria-label="Sort by Age"]').trigger('click');
    expect(sorting.value).toEqual([{ id: 'age', desc: true }]);
    sorting.value = [{ id: 'name', desc: true }];
    await wrapper.vm.$nextTick();
    expect(names(wrapper)).toEqual(['Linus', 'Grace', 'Ada']);
    expect(wrapper.findAll('th').map((th) => th.attributes('aria-sort'))).toEqual(['descending', 'none']);
  });

  it('sorts on its own while uncontrolled, reporting each sort', async () => {
    const wrapper = mount(PersonTable, { props: { data: people, columns }, attachTo });
    await wrapper.get('button[aria-label="Sort by Name"]').trigger('click');
    await wrapper.get('button[aria-label="Sort by Name"]').trigger('click');
    expect(wrapper.emitted('update:sorting')).toEqual([[[{ id: 'name', desc: false }]], [[{ id: 'name', desc: true }]]]);
    expect(names(wrapper)).toEqual(['Linus', 'Grace', 'Ada']);
  });

  it('adds a selection column once v-model:row-selection is bound, and round-trips it', async () => {
    expect(mount(PersonTable, { props: { data: people, columns } }).find('input').exists()).toBe(false);
    const selection = ref<Record<string, boolean>>({});
    const wrapper = bound(() => ({
      getRowId: (row) => row.id,
      rowSelection: selection.value,
      'onUpdate:rowSelection': (next) => (selection.value = next),
    }));
    const [header, ada, linus] = checkboxes(wrapper);
    expect(ada!.getAttribute('aria-label')).toBe('Select row p1');
    linus!.click();
    await wrapper.vm.$nextTick();
    expect(selection.value).toEqual({ p2: true });
    expect(header!.indeterminate).toBe(true);
    expect(header!.hasAttribute('indeterminate')).toBe(false);
    expect(wrapper.get('tr[data-row-id="p2"]').attributes('data-selected')).toBe('true');
    header!.click();
    await wrapper.vm.$nextTick();
    expect(selection.value).toEqual({ p1: true, p2: true, p3: true });
    selection.value = { p3: true };
    await wrapper.vm.$nextTick();
    expect(checkboxes(wrapper).map((input) => input.checked)).toEqual([false, false, false, true]);
    // The same elements throughout, so a checkbox keeps its focus as React's does.
    expect(checkboxes(wrapper)).toEqual([header, ada, linus, expect.anything()]);
  });

  it('adds a pagination bar once v-model:pagination is bound, and round-trips the page', async () => {
    expect(mount(PersonTable, { props: { data: people, columns } }).find('select').exists()).toBe(false);
    const pagination = ref({ pageIndex: 0, pageSize: 2 });
    const wrapper = bound(() => ({ pagination: pagination.value, 'onUpdate:pagination': (next) => (pagination.value = next) }));
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    await wrapper.get('button[aria-label="Next page"]').trigger('click');
    expect(pagination.value).toEqual({ pageIndex: 1, pageSize: 2 });
    expect(names(wrapper)).toEqual(['Grace']);
    expect(wrapper.get('[aria-live="polite"]').text()).toBe('Page 2 of 2');
    // Sorting returns to the first page, which the binding hears of.
    await wrapper.get('button[aria-label="Sort by Age"]').trigger('click');
    await flushPromises();
    expect(pagination.value).toEqual({ pageIndex: 0, pageSize: 2 });
    const select = wrapper.get<HTMLSelectElement>('select');
    expect(select.element.value).toBe('2');
    await select.setValue('10');
    expect(pagination.value).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
    pagination.value = { pageIndex: 0, pageSize: 1 };
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
  });

  it('filters by a bound filtering record, and reports filters its columns set', async () => {
    const filtering = ref<Record<string, string>>({ name: 'a' });
    const filterable = [
      helper.accessor('name', {
        header: ({ column }) =>
          h('input', {
            'aria-label': 'Filter names',
            onInput: (event: Event) => column.setFilterValue((event.target as HTMLInputElement).value),
          }),
      }),
      helper.accessor('age', { header: 'Age' }),
    ] as ColumnDef<Person, unknown>[];
    const wrapper = bound(() => ({
      columns: filterable,
      filtering: filtering.value,
      'onUpdate:filtering': (next) => (filtering.value = next),
    }));
    expect(names(wrapper)).toEqual(['Ada', 'Grace']);
    await wrapper.get('input[aria-label="Filter names"]').setValue('lin');
    expect(filtering.value).toEqual({ name: 'lin' });
    expect(names(wrapper)).toEqual(['Linus']);
  });

  it('hides the columns a bound visibility turns off', async () => {
    const visibility = ref<Record<string, boolean>>({ age: false });
    const wrapper = bound(() => ({
      columnVisibility: visibility.value,
      'onUpdate:columnVisibility': (next) => (visibility.value = next),
    }));
    expect(wrapper.findAll('th').map((th) => th.text())).toEqual(['Name']);
    expect(wrapper.get('tbody tr').findAll('td')).toHaveLength(1);
    visibility.value = {};
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('th')).toHaveLength(2);
  });

  it('reports a clicked row with its data, and points only when listened to', async () => {
    const clicked: Person[] = [];
    const wrapper = mount(PersonTable, { props: { data: people, columns, onRowClick: (row: Person) => clicked.push(row) } });
    await wrapper.findAll('tbody tr')[1]!.trigger('click');
    expect(clicked).toEqual([people[1]]);
    expect(wrapper.get('tbody tr').classes()).toContain('cursor-pointer');
    expect(mount(PersonTable, { props: { data: people, columns } }).get('tbody tr').classes()).not.toContain('cursor-pointer');
  });

  it('lets a clickable row be reached and activated from the keyboard', async () => {
    const clicked: Person[] = [];
    const wrapper = mount(PersonTable, { props: { data: people, columns, onRowClick: (row: Person) => clicked.push(row) } });
    const row = wrapper.findAll('tbody tr')[2]!;
    expect(row.attributes('tabindex')).toBe('0');
    await row.trigger('keydown', { key: ' ' });
    await row.trigger('keydown', { key: 'Tab' });
    expect(clicked).toEqual([people[2]]);
  });

  it('renders cells from render functions, its empty-state slot, and up to a page of skeleton rows', async () => {
    const custom = [
      helper.accessor('name', { header: 'Name', cell: (info) => h('strong', info.getValue()) }),
    ] as ColumnDef<Person, unknown>[];
    const wrapper = mount(PersonTable, {
      props: { data: people, columns: custom },
      slots: { 'empty-state': () => h('em', 'Nobody yet') },
    });
    expect(wrapper.findAll('tbody strong').map((cell) => cell.text())).toEqual(['Ada', 'Linus', 'Grace']);
    await wrapper.setProps({ data: [] });
    expect(wrapper.get('tbody em').text()).toBe('Nobody yet');
    await wrapper.setProps({ loading: true, pagination: { pageIndex: 0, pageSize: 2 } });
    expect(wrapper.findAll('tbody tr:not(.sr-only)')).toHaveLength(2);
    expect(wrapper.get('[role="status"]').text()).toBe('Loading data…');
  });
});
