import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { FrameworkCode } from '../FrameworkCode';

const REACT = '<PixelButton>Save</PixelButton>';
const VUE = '<template><PixelButton>Save</PixelButton></template>';
const ANGULAR = '<button pxlButton>Save</button>';

/** The code the panel shows (not its copy button). */
function panelText(container: HTMLElement): string {
  return within(container).getByRole('tabpanel').querySelector('code')?.textContent ?? '';
}

describe('FrameworkCode', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('shows React first, as tabs whose panel the selected tab labels', () => {
    const { container } = render(<FrameworkCode react={REACT} vue={VUE} angular={ANGULAR} label="Button code" />);
    const tabs = within(screen.getByRole('tablist', { name: 'Button code' })).getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['React', 'Vue', 'Angular']);
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
    const panel = screen.getByRole('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0]!.id);
    expect(panelText(container)).toContain('PixelButton');
    expect(panelText(container)).not.toContain('template');
  });

  it('switches on click, and every block on the page follows the reader’s pick', () => {
    const { container } = render(
      <>
        <div data-testid="first">
          <FrameworkCode react={REACT} vue={VUE} angular={ANGULAR} />
        </div>
        <div data-testid="second">
          <FrameworkCode react="second react" vue="second vue" />
        </div>
      </>,
    );
    const first = screen.getByTestId('first');
    fireEvent.click(within(first).getByRole('tab', { name: 'Vue' }));
    expect(panelText(first)).toBe(VUE);
    expect(panelText(screen.getByTestId('second'))).toBe('second vue');
    expect(window.localStorage.getItem('pxlkit:framework')).toBe('vue');
    expect(container.querySelectorAll('[role="tab"][aria-selected="true"]')).toHaveLength(2);
  });

  it('disables the tab of a kit without the code, and falls back to React under it', () => {
    window.localStorage.setItem('pxlkit:framework', 'angular');
    const { container } = render(<FrameworkCode react={REACT} vue={VUE} />);
    const angular = screen.getByRole('tab', { name: 'Angular' }) as HTMLButtonElement;
    expect(angular.disabled).toBe(true);
    expect(angular.title).toBe('Not in the Angular kit yet');
    expect(screen.getByRole('tab', { name: 'React' }).getAttribute('aria-selected')).toBe('true');
    expect(panelText(container)).toBe(REACT);
    // The reader's pick stands for the blocks that have it.
    expect(window.localStorage.getItem('pxlkit:framework')).toBe('angular');
  });

  it('moves between the tabs it can show with the arrow keys, Home and End', () => {
    const { container } = render(<FrameworkCode react={REACT} angular={ANGULAR} />);
    const react = screen.getByRole('tab', { name: 'React' });
    react.focus();
    fireEvent.keyDown(react, { key: 'ArrowRight' });
    const angular = screen.getByRole('tab', { name: 'Angular' });
    expect(document.activeElement).toBe(angular);
    expect(panelText(container)).toBe(ANGULAR);
    fireEvent.keyDown(angular, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(react);
    fireEvent.keyDown(react, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(angular);
    fireEvent.keyDown(angular, { key: 'Home' });
    expect(document.activeElement).toBe(react);
    fireEvent.keyDown(react, { key: 'End' });
    expect(document.activeElement).toBe(angular);
    expect(panelText(container)).toBe(ANGULAR);
  });

  it('draws the selected code with a render function when given one', () => {
    window.localStorage.setItem('pxlkit:framework', 'vue');
    render(
      <FrameworkCode react={REACT} vue={VUE}>
        {(code, framework) => <pre data-testid="drawn">{`${framework}: ${code}`}</pre>}
      </FrameworkCode>,
    );
    expect(screen.getByTestId('drawn').textContent).toBe(`vue: ${VUE}`);
  });

  it('draws the plain reference code block in the docs variant', () => {
    const { container } = render(<FrameworkCode variant="docs" react={REACT} vue={VUE} />);
    const code = container.querySelector('pre.docs-code > code');
    expect(code?.textContent).toBe(REACT);
  });
});
