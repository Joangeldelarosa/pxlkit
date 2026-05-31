import React, { useState } from 'react';
import { PixelCommand } from './PixelCommand';

export function Default() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open command palette
      </button>
      <PixelCommand
        open={open}
        onOpenChange={setOpen}
        groups={[
          {
            heading: 'Actions',
            items: [
              {
                id: 'new-file',
                label: 'New file',
                shortcut: 'Ctrl+N',
                onSelect: () => setOpen(false),
              },
              {
                id: 'open-file',
                label: 'Open file…',
                shortcut: 'Ctrl+O',
                onSelect: () => setOpen(false),
              },
              {
                id: 'save',
                label: 'Save',
                shortcut: 'Ctrl+S',
                onSelect: () => setOpen(false),
              },
            ],
          },
          {
            heading: 'Navigation',
            items: [
              {
                id: 'go-home',
                label: 'Go to home',
                keywords: ['dashboard', 'start'],
                onSelect: () => setOpen(false),
              },
              {
                id: 'go-settings',
                label: 'Go to settings',
                keywords: ['preferences', 'config'],
                onSelect: () => setOpen(false),
              },
            ],
          },
        ]}
      />
    </>
  );
}

export function WithCustomShortcut() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open (or press Ctrl+Shift+P)
      </button>
      <PixelCommand
        open={open}
        onOpenChange={setOpen}
        shortcut="mod+shift+p"
        placeholder="Run a command…"
        groups={[
          {
            heading: 'Commands',
            items: [
              {
                id: 'reload',
                label: 'Reload window',
                onSelect: () => setOpen(false),
              },
              {
                id: 'toggle-theme',
                label: 'Toggle theme',
                onSelect: () => setOpen(false),
              },
            ],
          },
        ]}
      />
    </>
  );
}

export function LinearSurface() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open linear palette
      </button>
      <PixelCommand
        open={open}
        onOpenChange={setOpen}
        surface="linear"
        emptyMessage="Nothing matches your search."
        groups={[
          {
            heading: 'Recent',
            items: [
              {
                id: 'doc-1',
                label: 'Project roadmap',
                onSelect: () => setOpen(false),
              },
              {
                id: 'doc-2',
                label: 'Sprint notes',
                onSelect: () => setOpen(false),
              },
            ],
          },
        ]}
      />
    </>
  );
}
