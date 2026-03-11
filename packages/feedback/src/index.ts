import type { IconPack } from '@pxlkit/core';

export {
  CheckCircle,
  XCircle,
  InfoCircle,
  WarningTriangle,
  ErrorOctagon,
  Bell,
  NotificationDot,
  MessageSquare,
  ChatDots,
  Mail,
  Send,
  Link,
  Unlink,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Megaphone,
  FeedbackIcons,
} from './icons';

// Animated icons
export { LoadingCircle } from './icons/loading-circle';
export { Hourglass } from './icons/hourglass';
export { TypingDots } from './icons/typing-dots';

// New static icons
export { DoubleCheck } from './icons/double-check';
export { Badge } from './icons/badge';
export { Ribbon } from './icons/ribbon';
export { FeedbackTarget } from './icons/feedback-target';
export { TargetHit } from './icons/target-hit';
export { Bug } from './icons/bug';
export { BugFixed } from './icons/bug-fixed';
export { Caution } from './icons/caution';
export { ShieldCross } from './icons/shield-cross';
export { ShieldExclamation } from './icons/shield-exclamation';

import {
  CheckCircle,
  XCircle,
  InfoCircle,
  WarningTriangle,
  ErrorOctagon,
  Bell,
  NotificationDot,
  MessageSquare,
  ChatDots,
  Mail,
  Send,
  Link,
  Unlink,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Megaphone,
} from './icons';

import { LoadingCircle } from './icons/loading-circle';
import { Hourglass } from './icons/hourglass';
import { TypingDots } from './icons/typing-dots';
import { DoubleCheck } from './icons/double-check';
import { Badge } from './icons/badge';
import { Ribbon } from './icons/ribbon';
import { FeedbackTarget } from './icons/feedback-target';
import { TargetHit } from './icons/target-hit';
import { Bug } from './icons/bug';
import { BugFixed } from './icons/bug-fixed';
import { Caution } from './icons/caution';
import { ShieldCross } from './icons/shield-cross';
import { ShieldExclamation } from './icons/shield-exclamation';

export const FeedbackPack: IconPack = {
  id: 'feedback',
  name: 'Feedback',
  description: 'Icons for notifications, alerts, status messages, and toasts',
  icons: [
    CheckCircle,
    XCircle,
    InfoCircle,
    WarningTriangle,
    ErrorOctagon,
    Bell,
    NotificationDot,
    MessageSquare,
    ChatDots,
    Mail,
    Send,
    ShieldCheck,
    ShieldAlert,
    Sparkles,
    Megaphone,
    // Animated
    LoadingCircle, Hourglass, TypingDots,
    // New static
    DoubleCheck, Badge, Ribbon, FeedbackTarget, TargetHit,
    Bug, BugFixed, Caution, ShieldCross, ShieldExclamation,
  ],
  version: '0.1.0',
  author: 'pxlkit',
};
