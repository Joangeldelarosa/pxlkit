import type { ParityScenario } from '../interact';

const spinbutton = '[role="spinbutton"]';
const checkbox = '[role="checkbox"]';
const radio = '[role="radio"]';
const combobox = '[role="combobox"]';
const option = '[role="option"]';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelBareInput',
    example: 'Controlled',
    name: 'reports every edit to its controller',
    steps: [
      { action: 'focus', target: 'input' },
      { action: 'input', target: 'input', value: 'retro' },
      { action: 'input', target: 'input', value: '' },
    ],
  },
  {
    component: 'PixelBareInput',
    example: 'Uncontrolled',
    name: 'keeps its own edits while uncontrolled',
    steps: [
      { action: 'input', target: 'input', value: 'hello pixels' },
      { action: 'blur', target: 'input' },
    ],
  },
  {
    component: 'PixelBareTextarea',
    example: 'Controlled',
    name: 'reports every edit to its controller',
    steps: [
      { action: 'focus', target: 'textarea' },
      { action: 'input', target: 'textarea', value: 'Line one\nLine two' },
      { action: 'input', target: 'textarea', value: '' },
    ],
  },
  {
    component: 'PixelBareTextarea',
    example: 'Uncontrolled',
    name: 'keeps its own edits while uncontrolled',
    steps: [{ action: 'input', target: 'textarea', value: 'Rewritten draft' }],
  },
  {
    component: 'PixelInput',
    example: 'Controlled',
    name: 'reports every edit to its controller',
    steps: [
      { action: 'click', target: 'label' },
      { action: 'focus', target: 'input' },
      { action: 'input', target: 'input', value: 'hero@' },
      { action: 'input', target: 'input', value: '' },
    ],
  },
  {
    component: 'PixelInput',
    example: 'Uncontrolled',
    name: 'keeps its own edits while uncontrolled',
    steps: [
      { action: 'input', target: 'input', value: 'Pixel Villain' },
      { action: 'blur', target: 'input' },
    ],
  },
  {
    component: 'PixelInput',
    example: 'Clearable',
    name: 'clears from the clear button, which hides while empty and returns on typing',
    steps: [
      { action: 'focus', target: 'input' },
      { action: 'click', target: '[aria-label="Clear input"]' },
      { action: 'input', target: 'input', value: 'again' },
    ],
  },
  {
    component: 'PixelInput',
    example: 'WithCharCount',
    name: 'counts characters as you type and turns red past the limit',
    steps: [
      { action: 'input', target: 'input', value: 'Retro pixel artist' },
      { action: 'input', target: 'input', value: 'x'.repeat(81) },
      { action: 'input', target: 'input', value: '' },
    ],
  },
  {
    component: 'PixelInputGroup',
    example: 'PhoneWithCountryCode',
    name: 'keeps the joined controls focusable and editable',
    steps: [
      { action: 'focus', target: 'input', nth: 1 },
      { action: 'input', target: 'input', nth: 1, value: '412 555 0199' },
      { action: 'focus', target: 'input' },
    ],
  },
  {
    component: 'PixelPasswordInput',
    example: 'Default',
    name: 'shows and hides the password from the toggle, which mirrors its state',
    steps: [
      { action: 'focus', target: 'input' },
      { action: 'input', target: 'input', value: 'hunter2' },
      { action: 'click', target: 'button' },
      { action: 'click', target: 'button' },
    ],
  },
  {
    component: 'PixelPasswordInput',
    example: 'CustomToggleLabels',
    name: 'labels the toggle with the custom text in both states',
    steps: [{ action: 'click', target: 'button' }],
  },
  {
    component: 'PixelPasswordInput',
    example: 'Controlled',
    name: 'reports every edit to its controller',
    steps: [
      { action: 'input', target: 'input', value: 'secret' },
      { action: 'input', target: 'input', value: 'secret!' },
    ],
  },
  {
    component: 'PixelPasswordInput',
    example: 'Disabled',
    name: 'keeps the password hidden while disabled',
    steps: [{ action: 'click', target: 'button' }],
  },
  {
    component: 'PixelTextarea',
    example: 'Controlled',
    name: 'reports every edit to its controller',
    steps: [
      { action: 'focus', target: 'textarea' },
      { action: 'input', target: 'textarea', value: 'Hello\nretro world' },
      { action: 'input', target: 'textarea', value: '' },
    ],
  },
  {
    component: 'PixelTextarea',
    example: 'Uncontrolled',
    name: 'keeps its own edits while uncontrolled',
    steps: [{ action: 'input', target: 'textarea', value: 'Backend engineer now.' }],
  },
  {
    component: 'PixelTextarea',
    example: 'Autosize',
    name: 'refits its height as lines are added and removed',
    steps: [
      { action: 'input', target: 'textarea', value: 'one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten' },
      { action: 'input', target: 'textarea', value: 'one' },
    ],
  },
  {
    component: 'PixelTextarea',
    example: 'WithCharCount',
    name: 'counts characters as you type and turns red past the limit',
    steps: [
      { action: 'input', target: 'textarea', value: 'Pixel artist and synth tinkerer.' },
      { action: 'input', target: 'textarea', value: 'y'.repeat(141) },
    ],
  },
  {
    component: 'PixelNumberInput',
    example: 'Default',
    name: 'steps up and down from the stepper buttons',
    steps: [
      { action: 'click', target: '[aria-label="Increment"]' },
      { action: 'click', target: '[aria-label="Increment"]' },
      { action: 'click', target: '[aria-label="Decrement"]' },
    ],
  },
  {
    component: 'PixelNumberInput',
    example: 'Default',
    name: 'steps with ArrowUp and ArrowDown and shows each step while focused',
    steps: [
      { action: 'focus', target: spinbutton },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'blur', target: spinbutton },
    ],
  },
  {
    component: 'PixelNumberInput',
    example: 'Default',
    name: 'clamps a typed value on blur, then disables the stepper at the bound',
    steps: [
      { action: 'focus', target: spinbutton },
      { action: 'input', target: spinbutton, value: '150' },
      { action: 'blur', target: spinbutton },
      { action: 'click', target: '[aria-label="Increment"]' },
    ],
  },
  {
    component: 'PixelNumberInput',
    example: 'Default',
    name: 'keeps partial input while typing and restores the value on blur',
    steps: [
      { action: 'focus', target: spinbutton },
      { action: 'input', target: spinbutton, value: '-' },
      { action: 'input', target: spinbutton, value: '' },
      { action: 'blur', target: spinbutton },
    ],
  },
  {
    component: 'PixelNumberInput',
    example: 'WithPrefixSuffix',
    name: 'rounds to its precision on blur and steps by its step',
    steps: [
      { action: 'focus', target: spinbutton },
      { action: 'input', target: spinbutton, value: '3.14159' },
      { action: 'blur', target: spinbutton },
      { action: 'focus', target: spinbutton },
      { action: 'keydown', key: 'ArrowDown' },
    ],
  },
  {
    component: 'PixelNumberInput',
    example: 'ThousandsSeparator',
    name: 'reads typed separators and groups the digits again on blur',
    steps: [
      { action: 'focus', target: spinbutton },
      { action: 'input', target: spinbutton, value: '2,500,000' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'blur', target: spinbutton },
    ],
  },
  {
    component: 'PixelNumberInput',
    example: 'HideControls',
    name: 'steps from the keyboard without steppers and clamps to its maximum',
    steps: [
      { action: 'focus', target: spinbutton },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'input', target: spinbutton, value: '130' },
      { action: 'blur', target: spinbutton },
    ],
  },
  {
    component: 'PixelNumberInput',
    example: 'WithError',
    name: 'ignores the disabled stepper past the bound and clamps when stepping back',
    steps: [
      { action: 'click', target: '[aria-label="Increment"]' },
      { action: 'click', target: '[aria-label="Decrement"]' },
    ],
  },
  {
    component: 'PixelCheckbox',
    example: 'Default',
    name: 'toggles on click and keeps focus on the checkbox',
    steps: [
      { action: 'click', target: checkbox },
      { action: 'click', target: checkbox },
    ],
  },
  {
    component: 'PixelCheckbox',
    example: 'WithFormName',
    name: 'submits its value only while checked',
    steps: [
      { action: 'click', target: checkbox },
      { action: 'click', target: checkbox },
    ],
  },
  {
    component: 'PixelCheckbox',
    example: 'Disabled',
    name: 'ignores clicks while disabled',
    steps: [
      { action: 'click', target: checkbox },
      { action: 'click', target: checkbox, nth: 1 },
    ],
  },
  {
    component: 'PixelCheckbox',
    example: 'Group',
    name: 'toggles each checkbox of a group on its own',
    steps: [
      { action: 'click', target: checkbox, nth: 1 },
      { action: 'click', target: checkbox },
    ],
  },
  {
    component: 'PixelRadioGroup',
    example: 'Default',
    name: 'selects the clicked radio and keeps focus on it',
    steps: [
      { action: 'click', target: radio, nth: 1 },
      { action: 'click', target: radio, nth: 2 },
      { action: 'click', target: radio, nth: 2 },
    ],
  },
  {
    component: 'PixelRadioGroup',
    example: 'Controlled',
    name: 'reports the selection to its controller',
    steps: [{ action: 'click', target: radio, nth: 2 }],
  },
  {
    component: 'PixelRadioGroup',
    example: 'Tones',
    name: 'moves every group bound to the same value',
    steps: [{ action: 'click', target: radio, nth: 3 }],
  },
  {
    component: 'PixelRadioGroup',
    example: 'Disabled',
    name: 'ignores clicks while disabled',
    steps: [{ action: 'click', target: radio }],
  },
  {
    component: 'PixelRadioGroup',
    example: 'WithFormName',
    name: 'submits the selected value',
    steps: [{ action: 'click', target: radio }],
  },
  {
    component: 'PixelToggle',
    example: 'Default',
    name: 'presses and releases on click, mirroring its state',
    steps: [
      { action: 'click', target: 'button' },
      { action: 'click', target: 'button' },
    ],
  },
  {
    component: 'PixelToggle',
    example: 'Pressed',
    name: 'releases a pressed toggle',
    steps: [{ action: 'click', target: 'button' }],
  },
  {
    component: 'PixelToggle',
    example: 'Surfaces',
    name: 'toggles each surface on its own',
    steps: [{ action: 'click', target: 'button', nth: 1 }],
  },
  {
    component: 'PixelToggle',
    example: 'Disabled',
    name: 'ignores clicks while disabled',
    steps: [
      { action: 'click', target: 'button' },
      { action: 'click', target: 'button', nth: 1 },
    ],
  },
  {
    component: 'PixelSegmented',
    example: 'Default',
    name: 'selects the clicked segment and keeps focus on it',
    steps: [
      { action: 'click', target: 'button', nth: 1 },
      { action: 'click', target: 'button', nth: 2 },
    ],
  },
  {
    component: 'PixelSegmented',
    example: 'Controlled',
    name: 'reports the selection to its controller',
    steps: [{ action: 'click', target: 'button', nth: 2 }],
  },
  {
    component: 'PixelSegmented',
    example: 'Disabled',
    name: 'ignores clicks while disabled',
    steps: [{ action: 'click', target: 'button', nth: 1 }],
  },
  {
    component: 'PixelSegmented',
    example: 'WithFormName',
    name: 'submits the selected value',
    steps: [{ action: 'click', target: 'button', nth: 1 }],
  },
  {
    component: 'PixelSelect',
    example: 'Default',
    name: 'opens from the trigger, highlights on hover and selects on click',
    steps: [
      { action: 'click', target: combobox },
      { action: 'hover', target: option, nth: 2 },
      { action: 'click', target: option, nth: 2 },
      { action: 'click', target: combobox },
    ],
  },
  {
    component: 'PixelSelect',
    example: 'Default',
    name: 'moves the highlight with the arrows, Home and End, and selects with Enter',
    steps: [
      { action: 'focus', target: combobox },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'keydown', key: 'End' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'Home' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'keydown', key: 'Enter' },
    ],
  },
  {
    component: 'PixelSelect',
    example: 'Default',
    name: 'opens with Space and closes on Escape or Tab without selecting',
    steps: [
      { action: 'focus', target: combobox },
      { action: 'keydown', key: ' ' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'Escape' },
      { action: 'keydown', key: 'End' },
      { action: 'keydown', key: 'Tab' },
    ],
  },
  {
    component: 'PixelSelect',
    example: 'Uncontrolled',
    name: 'closes on a press outside',
    steps: [
      { action: 'click', target: combobox },
      { action: 'pointerdown', target: 'body' },
    ],
  },
  {
    component: 'PixelSelect',
    example: 'Controlled',
    name: 'reports the selection to its controller',
    steps: [
      { action: 'click', target: combobox },
      { action: 'click', target: option, nth: 3 },
    ],
  },
  {
    component: 'PixelSelect',
    example: 'Disabled',
    name: 'stays closed while disabled',
    steps: [{ action: 'click', target: combobox }],
  },
  {
    component: 'PixelSelect',
    example: 'WithFormName',
    name: 'submits the selected value',
    steps: [
      { action: 'focus', target: combobox },
      { action: 'keydown', key: 'Home' },
      { action: 'keydown', key: 'Enter' },
    ],
  },
];
