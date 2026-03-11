export { Pencil } from './icons/pencil';
export { Eraser } from './icons/eraser';
export { PaintBucket } from './icons/paint-bucket';
export { Eyedropper } from './icons/eyedropper';
export { Play } from './icons/play';
export { Pause } from './icons/pause';
export { Undo } from './icons/undo';
export { Redo } from './icons/redo';
export { Close } from './icons/close';
export { Check } from './icons/check';
export { Palette } from './icons/palette';
export { Robot } from './icons/robot';
export { Package } from './icons/package';
export { SparkleSmall } from './icons/sparkle-small';
export { ArrowRight } from './icons/arrow-right';

// New static icons
export { Home } from './icons/home';
export { Search } from './icons/search';
export { Settings } from './icons/settings';
export { Gear } from './icons/gear';
export { Menu } from './icons/menu';
export { DotsMenu } from './icons/dots-menu';
export { Grid } from './icons/grid';
export { List } from './icons/list';
export { Trash } from './icons/trash';
export { Edit } from './icons/edit';
export { Copy } from './icons/copy';
export { ChainLink } from './icons/chain-link';
export { ExternalLink } from './icons/external-link';
export { Download } from './icons/download';
export { Upload } from './icons/upload';
export { History } from './icons/history';
export { Calendar } from './icons/calendar';
export { Clock } from './icons/clock';
export { LockOpen } from './icons/lock-open';
export { Lock } from './icons/lock';
export { CloudSync } from './icons/cloud-sync';

// New animated icons
export { LoadingSpinner } from './icons/loading-spinner';
export { PulsingDot } from './icons/pulsing-dot';
export { BouncingArrow } from './icons/bouncing-arrow';
export { ShakingBell } from './icons/shaking-bell';
export { SpinningGear } from './icons/spinning-gear';

import type { IconPack } from '@pxlkit/core';
import { Pencil } from './icons/pencil';
import { Eraser } from './icons/eraser';
import { PaintBucket } from './icons/paint-bucket';
import { Eyedropper } from './icons/eyedropper';
import { Play } from './icons/play';
import { Pause } from './icons/pause';
import { Undo } from './icons/undo';
import { Redo } from './icons/redo';
import { Close } from './icons/close';
import { Check } from './icons/check';
import { Palette } from './icons/palette';
import { Robot } from './icons/robot';
import { Package } from './icons/package';
import { SparkleSmall } from './icons/sparkle-small';
import { ArrowRight } from './icons/arrow-right';
import { Home } from './icons/home';
import { Search } from './icons/search';
import { Settings } from './icons/settings';
import { Gear } from './icons/gear';
import { Menu } from './icons/menu';
import { DotsMenu } from './icons/dots-menu';
import { Grid } from './icons/grid';
import { List } from './icons/list';
import { Trash } from './icons/trash';
import { Edit } from './icons/edit';
import { Copy } from './icons/copy';
import { ChainLink } from './icons/chain-link';
import { ExternalLink } from './icons/external-link';
import { Download } from './icons/download';
import { Upload } from './icons/upload';
import { History } from './icons/history';
import { Calendar } from './icons/calendar';
import { Clock } from './icons/clock';
import { LockOpen } from './icons/lock-open';
import { Lock } from './icons/lock';
import { CloudSync } from './icons/cloud-sync';
import { LoadingSpinner } from './icons/loading-spinner';
import { PulsingDot } from './icons/pulsing-dot';
import { BouncingArrow } from './icons/bouncing-arrow';
import { ShakingBell } from './icons/shaking-bell';
import { SpinningGear } from './icons/spinning-gear';

/**
 * The UI icon pack.
 * Contains 15 icons for interface controls, editor tools, and actions.
 */
export const UiPack: IconPack = {
  id: 'ui',
  name: 'UI',
  description: 'Icons for interface controls, editor tools, and common actions',
  icons: [
    Pencil, Eraser, PaintBucket, Eyedropper,
    Play, Pause, Undo, Redo,
    Close, Check, Palette, Robot,
    Package, SparkleSmall, ArrowRight,
    // New static
    Home, Search, Settings, Gear, Menu, DotsMenu, Grid, List,
    Trash, Edit, Copy, ChainLink, ExternalLink, Download, Upload,
    History, Calendar, Clock, LockOpen, Lock, CloudSync,
    // New animated
    LoadingSpinner, PulsingDot, BouncingArrow, ShakingBell, SpinningGear,
  ],
  version: '0.1.0',
  author: 'pxlkit',
};
