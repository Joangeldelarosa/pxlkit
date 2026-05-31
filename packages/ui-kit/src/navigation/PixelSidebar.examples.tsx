import React from 'react';
import { PixelSidebar } from './PixelSidebar';

const sections = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', active: true },
      { id: 'projects', label: 'Projects', badge: { label: '4', tone: 'cyan' as const } },
      { id: 'tasks', label: 'Tasks' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings' },
      { id: 'billing', label: 'Billing', badge: { label: 'NEW', tone: 'green' as const } },
    ],
  },
];

export function Default() {
  return (
    <div style={{ height: 320 }}>
      <PixelSidebar sections={sections} header={<span className="text-xs text-retro-text">pxlkit</span>} />
    </div>
  );
}

export function Collapsible() {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div style={{ height: 320 }}>
      <PixelSidebar
        collapsible
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        sections={sections}
        header={<span className="text-xs text-retro-text">pxlkit</span>}
      />
    </div>
  );
}

export function Nested() {
  const nestedSections = [
    {
      title: 'Library',
      items: [
        {
          id: 'components',
          label: 'Components',
          active: true,
          nested: [
            { id: 'buttons', label: 'Buttons' },
            { id: 'forms', label: 'Forms' },
            { id: 'navigation', label: 'Navigation' },
          ],
        },
        { id: 'tokens', label: 'Tokens' },
      ],
    },
  ];
  return (
    <div style={{ height: 320 }}>
      <PixelSidebar sections={nestedSections} />
    </div>
  );
}

export function WithFooter() {
  return (
    <div style={{ height: 320 }}>
      <PixelSidebar
        sections={sections}
        header={<span className="text-xs text-retro-text">pxlkit</span>}
        footer={<span className="text-[10px] text-retro-muted">v2.0.0</span>}
      />
    </div>
  );
}
