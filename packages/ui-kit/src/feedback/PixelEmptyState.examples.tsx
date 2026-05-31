import React from 'react';
import { PixelEmptyState } from '../feedback';
import { PixelButton } from '../actions';

export function Default() {
  return (
    <PixelEmptyState
      title="No results found"
      description="Try adjusting your filters or search terms to find what you are looking for."
    />
  );
}

const FolderIcon = () => (
  <span
    aria-hidden
    style={{
      width: 32,
      height: 32,
      borderRadius: 4,
      border: '2px solid currentColor',
      display: 'inline-block',
    }}
  />
);

export function WithIcon() {
  return (
    <PixelEmptyState
      icon={<FolderIcon />}
      title="No projects yet"
      description="Create your first project to get started organizing your work."
    />
  );
}

export function WithAction() {
  return (
    <PixelEmptyState
      title="Your inbox is empty"
      description="When you receive new messages, they will appear here."
      action={
        <PixelButton size="sm" tone="cyan" variant="solid">
          Refresh
        </PixelButton>
      }
    />
  );
}

export function WithIconAndAction() {
  return (
    <PixelEmptyState
      icon={<FolderIcon />}
      title="No documents"
      description="Upload a file or create a new document to begin."
      action={
        <PixelButton size="sm" tone="green" variant="solid">
          Create document
        </PixelButton>
      }
    />
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-4">
      <PixelEmptyState
        surface="linear"
        title="Linear surface"
        description="Soft dashed border with rounded corners."
      />
      <PixelEmptyState
        surface="pixel"
        title="Pixel surface"
        description="Chamfered dashed border with retro typography."
      />
    </div>
  );
}
