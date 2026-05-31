import React from 'react';
import { PixelAvatarGroup } from './PixelAvatarGroup';
import { PixelAvatar } from '../data-display';

export function Default() {
  return (
    <PixelAvatarGroup aria-label="3 team members">
      <PixelAvatar name="Joangel De La Rosa" />
      <PixelAvatar name="Ana Lopez" />
      <PixelAvatar name="Carlos Diaz" />
    </PixelAvatarGroup>
  );
}

export function WithOverflow() {
  return (
    <PixelAvatarGroup aria-label="6 team members" max={4}>
      <PixelAvatar name="Joangel De La Rosa" />
      <PixelAvatar name="Ana Lopez" />
      <PixelAvatar name="Carlos Diaz" />
      <PixelAvatar name="Diana Perez" />
      <PixelAvatar name="Eduardo Ruiz" />
      <PixelAvatar name="Fabiola Garcia" />
    </PixelAvatarGroup>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <PixelAvatarGroup aria-label="Extra small group" size="xs">
        <PixelAvatar name="Ana Lopez" size="xs" />
        <PixelAvatar name="Bob Brown" size="xs" />
        <PixelAvatar name="Carol Chen" size="xs" />
      </PixelAvatarGroup>
      <PixelAvatarGroup aria-label="Medium group" size="md">
        <PixelAvatar name="Ana Lopez" size="md" />
        <PixelAvatar name="Bob Brown" size="md" />
        <PixelAvatar name="Carol Chen" size="md" />
      </PixelAvatarGroup>
      <PixelAvatarGroup aria-label="Extra large group" size="xl">
        <PixelAvatar name="Ana Lopez" size="xl" />
        <PixelAvatar name="Bob Brown" size="xl" />
        <PixelAvatar name="Carol Chen" size="xl" />
      </PixelAvatarGroup>
    </div>
  );
}

export function Tones() {
  return (
    <div className="flex flex-col gap-3">
      <PixelAvatarGroup aria-label="Cyan team" tone="cyan" max={3}>
        <PixelAvatar name="Ana Lopez" tone="cyan" />
        <PixelAvatar name="Bob Brown" tone="cyan" />
        <PixelAvatar name="Carol Chen" tone="cyan" />
        <PixelAvatar name="Dave Diaz" tone="cyan" />
      </PixelAvatarGroup>
      <PixelAvatarGroup aria-label="Gold team" tone="gold" max={3}>
        <PixelAvatar name="Ana Lopez" tone="gold" />
        <PixelAvatar name="Bob Brown" tone="gold" />
        <PixelAvatar name="Carol Chen" tone="gold" />
        <PixelAvatar name="Dave Diaz" tone="gold" />
      </PixelAvatarGroup>
      <PixelAvatarGroup aria-label="Purple team" tone="purple" max={3}>
        <PixelAvatar name="Ana Lopez" tone="purple" />
        <PixelAvatar name="Bob Brown" tone="purple" />
        <PixelAvatar name="Carol Chen" tone="purple" />
        <PixelAvatar name="Dave Diaz" tone="purple" />
      </PixelAvatarGroup>
    </div>
  );
}

export function Surfaces() {
  return (
    <div className="flex flex-col gap-3">
      <PixelAvatarGroup aria-label="Pixel surface group" surface="pixel">
        <PixelAvatar name="Ana Lopez" surface="pixel" />
        <PixelAvatar name="Bob Brown" surface="pixel" />
        <PixelAvatar name="Carol Chen" surface="pixel" />
      </PixelAvatarGroup>
      <PixelAvatarGroup aria-label="Linear surface group" surface="linear">
        <PixelAvatar name="Ana Lopez" surface="linear" />
        <PixelAvatar name="Bob Brown" surface="linear" />
        <PixelAvatar name="Carol Chen" surface="linear" />
      </PixelAvatarGroup>
    </div>
  );
}
