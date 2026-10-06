import { Component } from '@angular/core';
import { PixelAvatar, PixelAvatarGroup, PixelAvatarGroupItem } from '@pxlkit/ui-kit-angular';

@Component({
  imports: [PixelAvatar, PixelAvatarGroup, PixelAvatarGroupItem],
  template: `
    <pxl-avatar-group aria-label="3 team members">
      <pxl-avatar *pxlAvatarGroupItem name="Joangel De La Rosa" />
      <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" />
      <pxl-avatar *pxlAvatarGroupItem name="Carlos Diaz" />
    </pxl-avatar-group>
  `,
})
export class Default {}

@Component({
  imports: [PixelAvatar, PixelAvatarGroup, PixelAvatarGroupItem],
  template: `
    <pxl-avatar-group aria-label="6 team members" [max]="4">
      <pxl-avatar *pxlAvatarGroupItem name="Joangel De La Rosa" />
      <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" />
      <pxl-avatar *pxlAvatarGroupItem name="Carlos Diaz" />
      <pxl-avatar *pxlAvatarGroupItem name="Diana Perez" />
      <pxl-avatar *pxlAvatarGroupItem name="Eduardo Ruiz" />
      <pxl-avatar *pxlAvatarGroupItem name="Fabiola Garcia" />
    </pxl-avatar-group>
  `,
})
export class WithOverflow {}

@Component({
  imports: [PixelAvatar, PixelAvatarGroup, PixelAvatarGroupItem],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-avatar-group aria-label="Extra small group" size="xs">
        <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" size="xs" />
        <pxl-avatar *pxlAvatarGroupItem name="Bob Brown" size="xs" />
        <pxl-avatar *pxlAvatarGroupItem name="Carol Chen" size="xs" />
      </pxl-avatar-group>
      <pxl-avatar-group aria-label="Medium group" size="md">
        <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" size="md" />
        <pxl-avatar *pxlAvatarGroupItem name="Bob Brown" size="md" />
        <pxl-avatar *pxlAvatarGroupItem name="Carol Chen" size="md" />
      </pxl-avatar-group>
      <pxl-avatar-group aria-label="Extra large group" size="xl">
        <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" size="xl" />
        <pxl-avatar *pxlAvatarGroupItem name="Bob Brown" size="xl" />
        <pxl-avatar *pxlAvatarGroupItem name="Carol Chen" size="xl" />
      </pxl-avatar-group>
    </div>
  `,
})
export class Sizes {}

@Component({
  imports: [PixelAvatar, PixelAvatarGroup, PixelAvatarGroupItem],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-avatar-group aria-label="Cyan team" tone="cyan" [max]="3">
        <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" tone="cyan" />
        <pxl-avatar *pxlAvatarGroupItem name="Bob Brown" tone="cyan" />
        <pxl-avatar *pxlAvatarGroupItem name="Carol Chen" tone="cyan" />
        <pxl-avatar *pxlAvatarGroupItem name="Dave Diaz" tone="cyan" />
      </pxl-avatar-group>
      <pxl-avatar-group aria-label="Gold team" tone="gold" [max]="3">
        <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" tone="gold" />
        <pxl-avatar *pxlAvatarGroupItem name="Bob Brown" tone="gold" />
        <pxl-avatar *pxlAvatarGroupItem name="Carol Chen" tone="gold" />
        <pxl-avatar *pxlAvatarGroupItem name="Dave Diaz" tone="gold" />
      </pxl-avatar-group>
      <pxl-avatar-group aria-label="Purple team" tone="purple" [max]="3">
        <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" tone="purple" />
        <pxl-avatar *pxlAvatarGroupItem name="Bob Brown" tone="purple" />
        <pxl-avatar *pxlAvatarGroupItem name="Carol Chen" tone="purple" />
        <pxl-avatar *pxlAvatarGroupItem name="Dave Diaz" tone="purple" />
      </pxl-avatar-group>
    </div>
  `,
})
export class Tones {}

@Component({
  imports: [PixelAvatar, PixelAvatarGroup, PixelAvatarGroupItem],
  template: `
    <div class="flex flex-col gap-3">
      <pxl-avatar-group aria-label="Pixel surface group" surface="pixel">
        <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" surface="pixel" />
        <pxl-avatar *pxlAvatarGroupItem name="Bob Brown" surface="pixel" />
        <pxl-avatar *pxlAvatarGroupItem name="Carol Chen" surface="pixel" />
      </pxl-avatar-group>
      <pxl-avatar-group aria-label="Linear surface group" surface="linear">
        <pxl-avatar *pxlAvatarGroupItem name="Ana Lopez" surface="linear" />
        <pxl-avatar *pxlAvatarGroupItem name="Bob Brown" surface="linear" />
        <pxl-avatar *pxlAvatarGroupItem name="Carol Chen" surface="linear" />
      </pxl-avatar-group>
    </div>
  `,
})
export class Surfaces {}
