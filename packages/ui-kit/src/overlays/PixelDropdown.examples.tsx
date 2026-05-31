import React, { useState } from 'react';
import { PixelDropdown } from '../overlay';

export function Default() {
  return (
    <PixelDropdown
      label="Actions"
      items={[
        { value: 'edit', label: 'Edit' },
        { value: 'duplicate', label: 'Duplicate' },
        { value: 'archive', label: 'Archive' },
      ]}
      onSelect={() => {}}
    />
  );
}

export function Tones() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <PixelDropdown
        label="Neutral"
        tone="neutral"
        items={[{ value: 'a', label: 'Option A' }]}
      />
      <PixelDropdown
        label="Cyan"
        tone="cyan"
        items={[{ value: 'a', label: 'Option A' }]}
      />
      <PixelDropdown
        label="Green"
        tone="green"
        items={[{ value: 'a', label: 'Option A' }]}
      />
      <PixelDropdown
        label="Red"
        tone="red"
        items={[{ value: 'a', label: 'Option A' }]}
      />
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <PixelDropdown
        label="Pixel"
        surface="pixel"
        items={[
          { value: 'one', label: 'First' },
          { value: 'two', label: 'Second' },
        ]}
      />
      <PixelDropdown
        label="Linear"
        surface="linear"
        items={[
          { value: 'one', label: 'First' },
          { value: 'two', label: 'Second' },
        ]}
      />
    </div>
  );
}

export function Disabled() {
  return (
    <PixelDropdown
      label="Unavailable"
      disabled
      items={[{ value: 'a', label: 'Option A' }]}
    />
  );
}

export function WithIconsAndShortcuts() {
  return (
    <PixelDropdown
      label="File"
      items={[
        { value: 'new', label: 'New', shortcut: 'Ctrl+N' },
        { value: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
        { value: 'save', label: 'Save', shortcut: 'Ctrl+S' },
      ]}
      onSelect={() => {}}
    />
  );
}

export function HeadersAndSeparators() {
  return (
    <PixelDropdown
      label="Account"
      items={[
        { value: 'h1', label: 'Profile', kind: 'header' },
        { value: 'view', label: 'View profile' },
        { value: 'edit', label: 'Edit profile' },
        { value: 'sep1', label: '', kind: 'separator' },
        { value: 'h2', label: 'Danger Zone', kind: 'header' },
        { value: 'delete', label: 'Delete account', tone: 'red' },
      ]}
      onSelect={() => {}}
    />
  );
}

export function CheckboxAndRadio() {
  return (
    <PixelDropdown
      label="View"
      items={[
        { value: 'g1', label: 'Show', kind: 'header' },
        { value: 'grid', label: 'Grid lines', kind: 'checkbox', checked: true },
        { value: 'ruler', label: 'Ruler', kind: 'checkbox', checked: false },
        { value: 'sep', label: '', kind: 'separator' },
        { value: 'g2', label: 'Density', kind: 'header' },
        { value: 'compact', label: 'Compact', kind: 'radio', checked: false },
        { value: 'cozy', label: 'Cozy', kind: 'radio', checked: true },
        { value: 'spacious', label: 'Spacious', kind: 'radio', checked: false },
      ]}
      onSelect={() => {}}
    />
  );
}

export function DisabledItems() {
  return (
    <PixelDropdown
      label="Edit"
      items={[
        { value: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
        { value: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', disabled: true },
        { value: 'sep', label: '', kind: 'separator' },
        { value: 'cut', label: 'Cut' },
        { value: 'copy', label: 'Copy' },
        { value: 'paste', label: 'Paste', disabled: true },
      ]}
      onSelect={() => {}}
    />
  );
}

export function Composition() {
  return (
    <PixelDropdown.Root>
      <PixelDropdown.Trigger>Menu</PixelDropdown.Trigger>
      <PixelDropdown.Content>
        <PixelDropdown.Header>Project</PixelDropdown.Header>
        <PixelDropdown.Item value="rename" onSelect={() => {}}>
          Rename
        </PixelDropdown.Item>
        <PixelDropdown.Item value="share" onSelect={() => {}} shortcut="Ctrl+E">
          Share
        </PixelDropdown.Item>
        <PixelDropdown.Separator />
        <PixelDropdown.Item value="delete" onSelect={() => {}} destructive>
          Delete
        </PixelDropdown.Item>
      </PixelDropdown.Content>
    </PixelDropdown.Root>
  );
}

export function ControlledOpen() {
  const [open, setOpen] = useState(false);
  return (
    <PixelDropdown.Root open={open} onOpenChange={setOpen}>
      <PixelDropdown.Trigger>{open ? 'Close' : 'Open'} menu</PixelDropdown.Trigger>
      <PixelDropdown.Content>
        <PixelDropdown.Item value="one" onSelect={() => {}}>
          One
        </PixelDropdown.Item>
        <PixelDropdown.Item value="two" onSelect={() => {}}>
          Two
        </PixelDropdown.Item>
      </PixelDropdown.Content>
    </PixelDropdown.Root>
  );
}
