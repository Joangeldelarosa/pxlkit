import type { ParityScenario } from '../interact';

// The charts are static images: they have no interaction to replay.

// Embla needs matchMedia, IntersectionObserver and ResizeObserver, which
// jsdom lacks, so the carousels stay on their first slide here: these
// scenarios cover the region, its keyboard handling and its controls'
// focus. Scrolling is covered by each kit's tests, on a mocked Embla.
const region = '[aria-roledescription="carousel"]';
const previous = 'button[aria-label="Previous slide"]';
const next = 'button[aria-label="Next slide"]';
const dot = 'button[aria-label^="Go to slide"]';

const sortBy = (header: string) => `button[aria-label="Sort by ${header}"]`;
const rowCheckbox = 'tbody input[type="checkbox"]';
const headerCheckbox = 'thead input[type="checkbox"]';
const cell = 'tbody td';
const row = 'tbody tr';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelCarousel',
    example: 'Default',
    name: 'is a focusable region whose arrow keys stay on the first slide when nothing scrolls',
    steps: [
      { action: 'focus', target: region },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'keydown', key: 'ArrowLeft' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'blur', target: region },
    ],
  },
  {
    component: 'PixelCarousel',
    example: 'Default',
    name: 'renders the same for a reader who prefers reduced motion',
    reducedMotion: true,
    steps: [
      { action: 'focus', target: region },
      { action: 'keydown', key: 'ArrowRight' },
    ],
  },
  {
    component: 'PixelCarousel',
    example: 'Vertical',
    name: 'takes the up and down arrows when vertical',
    steps: [
      { action: 'focus', target: region },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'keydown', key: 'ArrowRight' },
    ],
  },
  {
    component: 'PixelCarousel',
    example: 'WithDots',
    name: 'focuses a dot when clicked and keeps the current slide marked',
    steps: [
      { action: 'click', target: dot, nth: 1 },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'click', target: dot, nth: 2 },
    ],
  },
  {
    component: 'PixelCarousel',
    example: 'Looping',
    name: 'keeps both arrows enabled when looping, and focuses the one clicked',
    steps: [
      { action: 'click', target: next },
      { action: 'click', target: previous },
      { action: 'keydown', key: 'ArrowLeft' },
    ],
  },
  {
    component: 'PixelCarousel',
    example: 'LinearSurface',
    name: 'ignores clicks on its disabled arrows',
    steps: [
      { action: 'click', target: next },
      { action: 'click', target: previous },
    ],
  },
  {
    component: 'PixelTable',
    example: 'Sortable',
    name: 'flips the sorted column, then sorts another ascending, with aria-sort following',
    steps: [
      { action: 'click', target: sortBy('Name') },
      { action: 'click', target: sortBy('Name') },
      { action: 'click', target: sortBy('Role') },
      { action: 'click', target: sortBy('Role') },
    ],
  },
  {
    component: 'PixelTable',
    example: 'SingleSelection',
    name: 'replaces the selected row, and clears it on a second click',
    steps: [
      { action: 'click', target: rowCheckbox, nth: 1 },
      { action: 'click', target: rowCheckbox, nth: 1 },
      { action: 'click', target: rowCheckbox, nth: 2 },
    ],
  },
  {
    component: 'PixelTable',
    example: 'MultiSelection',
    name: 'selects rows one by one, the header checkbox indeterminate until all are, and all at once from it',
    steps: [
      { action: 'click', target: rowCheckbox, nth: 1 },
      { action: 'click', target: rowCheckbox },
      { action: 'click', target: headerCheckbox },
      { action: 'click', target: headerCheckbox },
      { action: 'click', target: rowCheckbox, nth: 2 },
      { action: 'click', target: rowCheckbox, nth: 2 },
    ],
  },
  {
    component: 'PixelTable',
    example: 'ClickableRows',
    name: 'reports the clicked row',
    steps: [
      { action: 'click', target: cell, nth: 3 },
      { action: 'click', target: cell, nth: 8 },
    ],
  },
  {
    component: 'PixelTable',
    example: 'ClickableRows',
    name: 'reaches a clickable row by focus and activates it with Enter or Space only',
    steps: [
      { action: 'focus', target: row, nth: 1 },
      { action: 'keydown', key: 'Enter' },
      { action: 'focus', target: row, nth: 2 },
      { action: 'keydown', key: 'a' },
      { action: 'keydown', key: ' ' },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'Default',
    name: 'sorts on its own: ascending, descending, then another column',
    steps: [
      { action: 'click', target: sortBy('Status') },
      { action: 'click', target: sortBy('Status') },
      { action: 'click', target: sortBy('Name') },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'Sortable',
    name: 'flips the bound sort, removes it, then sorts another column',
    steps: [
      { action: 'click', target: sortBy('Name') },
      { action: 'click', target: sortBy('Name') },
      { action: 'click', target: sortBy('Role') },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'RowSelection',
    name: 'selects rows, the header checkbox indeterminate until all are, and toggles them all from it',
    steps: [
      { action: 'click', target: rowCheckbox, nth: 2 },
      { action: 'click', target: headerCheckbox },
      { action: 'click', target: headerCheckbox },
      { action: 'click', target: rowCheckbox },
      { action: 'click', target: rowCheckbox },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'RowSelection',
    name: 'keeps the selection by row id while sorting',
    steps: [
      { action: 'click', target: rowCheckbox },
      { action: 'click', target: sortBy('Name') },
      { action: 'click', target: sortBy('Name') },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'Pagination',
    name: 'pages forward to the last page and back, the buttons disabled at the ends',
    steps: [
      { action: 'click', target: 'button[aria-label="Next page"]' },
      { action: 'click', target: 'button[aria-label="Next page"]' },
      { action: 'click', target: 'button[aria-label="Previous page"]' },
      { action: 'click', target: 'button[aria-label="Previous page"]' },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'Pagination',
    name: 'returns to the first page when sorted',
    steps: [
      { action: 'click', target: 'button[aria-label="Next page"]' },
      { action: 'click', target: sortBy('Name') },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'Pagination',
    name: 'changes the page size from the select',
    steps: [
      { action: 'select', target: 'select[aria-label="Rows per page"]', value: '5' },
      { action: 'select', target: 'select[aria-label="Rows per page"]', value: '10' },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'ClickableRows',
    name: 'reports the clicked row',
    steps: [
      { action: 'click', target: cell, nth: 4 },
      { action: 'click', target: cell, nth: 1 },
    ],
  },
  {
    component: 'PixelDataTable',
    example: 'ClickableRows',
    name: 'reaches a clickable row by focus and activates it with Enter or Space only',
    steps: [
      { action: 'focus', target: row, nth: 3 },
      { action: 'keydown', key: ' ' },
      { action: 'focus', target: row },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'Enter' },
    ],
  },
];
