/**
 * PixelTable's Vue API: `v-model:sort` and `v-model:selected-ids` round
 * trips, one-way and uncontrolled state, the `row-click` event, render
 * functions, the empty-state slot and row ids.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelTable, type PixelTableColumn, type PixelTableSortState } from '../../index';

type Person = { id: string; name: string; age: number };

const people: Person[] = [
  { id: 'c', name: 'Carol', age: 41 },
  { id: 'a', name: 'Alice', age: 25 },
  { id: 'b', name: 'Bob', age: 33 },
];
const columns: PixelTableColumn<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true, align: 'right', width: 80 },
];
// A checkbox fires `change` only in the document, as browsers do.
const attachTo = document.body;

enableAutoUnmount(afterEach);

const names = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('tbody tr').map((row) => row.find('td').text());
const checkboxes = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll<HTMLInputElement>('input[type="checkbox"]').map((input) => input.element);

describe('PixelTable', () => {
  it('updates a v-model:sort binding, and follows it', async () => {
    const sort = ref<PixelTableSortState | undefined>({ key: 'age', dir: 'asc' });
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelTable<Person>, {
            columns,
            data: people,
            sort: sort.value,
            'onUpdate:sort': (next: PixelTableSortState) => (sort.value = next),
          }),
      }),
    );
    expect(names(wrapper)).toEqual(['Alice', 'Bob', 'Carol']);
    await wrapper.get('button[aria-label="Sort by Age"]').trigger('click');
    expect(sort.value).toEqual({ key: 'age', dir: 'desc' });
    expect(names(wrapper)).toEqual(['Carol', 'Bob', 'Alice']);
    sort.value = { key: 'name', dir: 'asc' };
    await wrapper.vm.$nextTick();
    expect(names(wrapper)).toEqual(['Alice', 'Bob', 'Carol']);
    expect(wrapper.findAll('th').map((th) => th.attributes('aria-sort'))).toEqual(['ascending', 'none']);
  });

  it('stays as its parent says while controlled one-way, and sorts itself when uncontrolled', async () => {
    const controlled = mount(PixelTable<Person>, { props: { columns, data: people, sort: { key: 'name', dir: 'asc' } } });
    await controlled.get('button[aria-label="Sort by Name"]').trigger('click');
    expect(controlled.emitted('update:sort')).toEqual([[{ key: 'name', dir: 'desc' }]]);
    expect(names(controlled)).toEqual(['Alice', 'Bob', 'Carol']);

    const uncontrolled = mount(PixelTable<Person>, { props: { columns, data: people } });
    expect(names(uncontrolled)).toEqual(['Carol', 'Alice', 'Bob']);
    await uncontrolled.get('button[aria-label="Sort by Name"]').trigger('click');
    expect(names(uncontrolled)).toEqual(['Alice', 'Bob', 'Carol']);
    expect(uncontrolled.emitted('update:sort')).toEqual([[{ key: 'name', dir: 'asc' }]]);
  });

  it('updates a v-model:selected-ids binding, with an indeterminate header in between, and follows it', async () => {
    const selected = ref<string[]>([]);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelTable<Person>, {
            columns,
            data: people,
            selection: 'multi',
            selectedIds: selected.value,
            'onUpdate:selectedIds': (next: string[]) => (selected.value = next),
          }),
      }),
      { attachTo },
    );
    const [header, carol] = checkboxes(wrapper);
    carol!.click();
    await wrapper.vm.$nextTick();
    expect(selected.value).toEqual(['c']);
    expect(header!.indeterminate).toBe(true);
    // A property only: React never writes it as an attribute.
    expect(header!.hasAttribute('indeterminate')).toBe(false);
    expect(wrapper.get('tr[data-row-id="c"]').attributes('data-selected')).toBe('true');
    header!.click();
    await wrapper.vm.$nextTick();
    expect(selected.value).toEqual(['c', 'a', 'b']);
    expect(header!.indeterminate).toBe(false);
    selected.value = ['b'];
    await wrapper.vm.$nextTick();
    expect(checkboxes(wrapper).map((input) => input.checked)).toEqual([false, false, false, true]);
  });

  it('keeps a single selection of its own while uncontrolled, and leaves the row click to the row', async () => {
    const clicks: Array<[string, number]> = [];
    const wrapper = mount(PixelTable<Person>, {
      props: { columns, data: people, selection: 'single', onRowClick: (row: Person, index: number) => clicks.push([row.name, index]) },
      attachTo,
    });
    expect(wrapper.find('thead input').exists()).toBe(false);
    expect(wrapper.get('thead .sr-only').text()).toBe('Select');
    await wrapper.findAll('tbody input')[1]!.trigger('click');
    await wrapper.findAll('tbody input')[2]!.trigger('click');
    expect(wrapper.emitted('update:selectedIds')).toEqual([[['a']], [['b']]]);
    expect(checkboxes(wrapper).map((input) => input.checked)).toEqual([false, false, true]);
    expect(clicks).toEqual([]);
    await wrapper.findAll('tbody td')[4]!.trigger('click');
    expect(clicks).toEqual([['Alice', 1]]);
    expect(wrapper.get('tbody tr').classes()).toContain('cursor-pointer');
    expect(mount(PixelTable<Person>, { props: { columns, data: people } }).get('tbody tr').classes()).not.toContain('cursor-pointer');
  });

  it('lets a clickable row be reached and activated from the keyboard, leaving its controls their keys', async () => {
    const clicks: Array<[string, number]> = [];
    const wrapper = mount(PixelTable<Person>, {
      props: { columns, data: people, selection: 'multi', onRowClick: (row: Person, index: number) => clicks.push([row.name, index]) },
      attachTo,
    });
    const row = wrapper.findAll('tbody tr')[1]!;
    expect(row.attributes('tabindex')).toBe('0');
    await row.trigger('keydown', { key: 'Enter' });
    await row.trigger('keydown', { key: 'x' });
    await row.get('input').trigger('keydown', { key: ' ' });
    expect(clicks).toEqual([['Alice', 1]]);
    expect(mount(PixelTable<Person>, { props: { columns, data: people } }).get('tbody tr').attributes('tabindex')).toBeUndefined();
  });

  it('renders cells and headers from render functions, sizes columns and identifies rows', () => {
    const wrapper = mount(PixelTable<Person>, {
      props: {
        data: people,
        getRowId: (row: Person) => `person-${row.id}`,
        columns: [
          { key: 'name', header: () => h('em', 'Who') },
          { key: 'age', header: 'Age', width: '30%', render: (row: Person, index: number) => h('b', `${row.age} (#${index})`) },
        ],
      },
    });
    expect(wrapper.get('th em').text()).toBe('Who');
    expect(wrapper.findAll('tbody b').map((b) => b.text())).toEqual(['41 (#0)', '25 (#1)', '33 (#2)']);
    expect(wrapper.findAll('th')[1]!.attributes('style')).toBe('width: 30%;');
    expect(wrapper.findAll('tbody tr').map((row) => row.attributes('data-row-id'))).toEqual([
      'person-c',
      'person-a',
      'person-b',
    ]);
  });

  it('shows its empty-state slot without data, and skeletons instead while loading', async () => {
    const wrapper = mount(PixelTable<Person>, {
      props: { columns, data: [] },
      slots: { 'empty-state': () => h('strong', 'Nobody yet') },
    });
    expect(wrapper.get('tbody td').attributes('colspan')).toBe('2');
    expect(wrapper.get('tbody strong').text()).toBe('Nobody yet');
    await wrapper.setProps({ loading: true });
    expect(wrapper.find('strong').exists()).toBe(false);
    expect(wrapper.get('tbody').attributes('aria-busy')).toBe('true');
    expect(wrapper.get('[role="status"]').text()).toBe('Loading data…');
    expect(wrapper.findAll('[data-skeleton]')).toHaveLength(10);
  });
});
