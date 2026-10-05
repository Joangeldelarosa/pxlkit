import { afterEach, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { FrameworkApi, type FrameworkApiReferences } from '../FrameworkApi';

const API: FrameworkApiReferences = {
  react: {
    import: "import { PixelToggle } from '@pxlkit/ui-kit';",
    components: [
      {
        name: 'PixelToggle',
        props: [
          { name: 'label', type: 'string', required: true, description: 'Text next to the `switch`.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'" },
          { name: 'tone', type: 'string', deprecated: 'Use `color`.' },
        ],
        notes: ['`ref` points to `<button>`.'],
      },
      { name: 'PixelToggle.Icon', notes: ['Also takes the native attributes of `<span>`.'] },
    ],
  },
  vue: {
    import: "import { PixelToggle } from '@pxlkit/ui-kit-vue';",
    components: [
      {
        name: 'PixelToggle',
        props: [{ name: 'checked', type: 'boolean', binding: 'v-model:checked', description: 'Whether it is on.' }],
        events: [{ name: 'update:checked', payload: 'checked: boolean', description: 'The new state.' }],
        slots: [{ name: 'icon', props: '{ checked: boolean }', description: 'Icon before the label.' }],
      },
    ],
  },
  angular: {
    import: "import { PixelToggle } from '@pxlkit/ui-kit-angular';",
    components: [
      {
        name: 'PixelToggle',
        selector: 'button[pxlToggle]',
        props: [{ name: 'disabled', type: 'boolean', default: 'false', accepts: 'unknown', description: 'Native `disabled`.' }],
        events: [{ name: 'checkedChange', payload: 'boolean' }],
        notes: ['A form control: works with `ngModel`.'],
      },
    ],
  },
};

function panel() {
  return screen.getByRole('tabpanel');
}

describe('FrameworkApi', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders React's reference on the server, under the framework tabs", () => {
    const html = renderToString(<FrameworkApi label="PixelToggle API" {...API} />);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="PixelToggle API"');
    expect(html).toContain("import { PixelToggle } from &#x27;@pxlkit/ui-kit&#x27;;");
    expect(html).toContain('<table class="docs-props" aria-label="PixelToggle props">');
    expect(html).toContain('<code>label</code>');
    expect(html).not.toContain('v-model:checked');
    expect(html).not.toContain('button[pxlToggle]');
  });

  it('draws the props table: name, required marker, type, default, description with code spans, deprecation', () => {
    render(<FrameworkApi label="PixelToggle API" {...API} />);
    const table = within(panel()).getByRole('table', { name: 'PixelToggle props' });
    const rows = within(table).getAllByRole('row');
    expect(within(rows[0]!).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'Prop',
      'Type',
      'Default',
      'Description',
    ]);
    const [name, type, fallback, description] = within(rows[1]!).getAllByRole('cell');
    expect(name!.textContent).toBe('label* (required)');
    expect(name!.querySelector('.docs-required')).toHaveAttribute('aria-hidden', 'true');
    expect(type!.textContent).toBe('string');
    expect(fallback!.textContent).toBe('—');
    expect(description!.querySelector('code')?.textContent).toBe('switch');
    expect(within(rows[2]!).getAllByRole('cell')[2]!.textContent).toBe("'md'");
    expect(within(rows[3]!).getAllByRole('cell')[3]!.textContent).toBe('Deprecated. Use color.');
  });

  it('titles each component when there are parts, and says when one has no props of its own', () => {
    render(<FrameworkApi label="PixelToggle API" {...API} />);
    expect(within(panel()).getAllByRole('heading', { level: 4 }).map((h) => h.textContent)).toEqual([
      'PixelToggle',
      'PixelToggle.Icon',
    ]);
    expect(within(panel()).getByText('No props of its own.')).toBeInTheDocument();
    expect(within(panel()).getByText('points to', { exact: false })).toBeInTheDocument();
  });

  it("follows the reader's framework: Vue's bindings, events and slots", () => {
    render(<FrameworkApi label="PixelToggle API" {...API} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Vue' }));
    expect(panel().querySelector('pre code')?.textContent).toBe("import { PixelToggle } from '@pxlkit/ui-kit-vue';");
    const props = within(panel()).getByRole('table', { name: 'PixelToggle props' });
    expect(within(props).getAllByRole('cell')[0]!.textContent).toBe('checkedv-model:checked');
    const events = within(panel()).getByRole('table', { name: 'PixelToggle events' });
    expect(within(events).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
      'update:checked',
      'checked: boolean',
      'The new state.',
    ]);
    const slots = within(panel()).getByRole('table', { name: 'PixelToggle slots' });
    expect(within(slots).getAllByRole('cell')[1]!.textContent).toBe('{ checked: boolean }');
    expect(within(panel()).queryByRole('heading', { level: 4 })).toBeNull();
  });

  it("names Angular's members inputs and outputs, with the selector and what a transform accepts", () => {
    window.localStorage.setItem('pxlkit:framework', 'angular');
    render(<FrameworkApi label="PixelToggle API" {...API} />);
    expect(within(panel()).getByText('button[pxlToggle]')).toBeInTheDocument();
    const inputs = within(panel()).getByRole('table', { name: 'PixelToggle inputs' });
    expect(within(inputs).getAllByRole('columnheader')[0]!.textContent).toBe('Input');
    expect(within(inputs).getAllByRole('cell')[1]!.textContent).toBe('booleanaccepts unknown');
    const outputs = within(panel()).getByRole('table', { name: 'PixelToggle outputs' });
    expect(within(outputs).getAllByRole('columnheader')[0]!.textContent).toBe('Output');
    expect(within(outputs).getAllByRole('cell')[2]!.textContent).toBe('—');
    expect(within(panel()).getByText('ngModel')).toBeInTheDocument();
  });

  it("disables the tab of a kit without the component, and shows React's under it", () => {
    window.localStorage.setItem('pxlkit:framework', 'vue');
    render(<FrameworkApi label="PixelToggle API" react={API.react} angular={API.angular} />);
    expect(screen.getByRole('tab', { name: 'Vue' })).toBeDisabled();
    expect(panel().querySelector('pre code')?.textContent).toBe("import { PixelToggle } from '@pxlkit/ui-kit';");
  });
});
