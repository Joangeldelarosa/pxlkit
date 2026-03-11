import type { IconPack } from '@pxlkit/core';

export {
  Heart,
  HeartBroken,
  ThumbsUp,
  ThumbsDown,
  User,
  UserGroup,
  Share,
  Bookmark,
  Camera,
  Eye,
  EyeOff,
  AtSign,
  Hashtag,
  Globe,
  Pin,
  SocialStar,
  SocialFire,
  Verified,
  Comment,
  Repost,
  Notification,
  SocialIcons,
} from './icons';

// Backward-compat aliases for previous social generic names.
export { SocialStar as Star, SocialFire as Fire } from './icons';

// Animated icons
export { PulseHeart } from './icons/pulse-heart';
export { BlinkingEye } from './icons/blinking-eye';
export { WavingFlag } from './icons/waving-flag';

// New static icons
export { Message } from './icons/message';
export { ChatBubble } from './icons/chat-bubble';
export { Community } from './icons/community';
export { Friends } from './icons/friends';
export { AddUser } from './icons/add-user';
export { RemoveUser } from './icons/remove-user';
export { BlockUser } from './icons/block-user';
export { Smile } from './icons/smile';
export { Sad } from './icons/sad';
export { Angry } from './icons/angry';
export { Laugh } from './icons/laugh';
export { Wink } from './icons/wink';
export { Surprise } from './icons/surprise';
export { StarFace } from './icons/star-face';

// New animated icons
export { WinkingFace } from './icons/winking-face';
export { LaughingFace } from './icons/laughing-face';
export { FloatingHearts } from './icons/floating-hearts';
export { BouncingMessage } from './icons/bouncing-message';
export { RingingPhone } from './icons/ringing-phone';

import {
  Heart,
  HeartBroken,
  ThumbsUp,
  ThumbsDown,
  User,
  UserGroup,
  Share,
  Bookmark,
  Camera,
  Eye,
  EyeOff,
  AtSign,
  Hashtag,
  Globe,
  Pin,
  SocialStar,
  SocialFire,
  Verified,
  Comment,
  Repost,
  Notification,
} from './icons';

import { PulseHeart } from './icons/pulse-heart';
import { BlinkingEye } from './icons/blinking-eye';
import { WavingFlag } from './icons/waving-flag';
import { Message } from './icons/message';
import { ChatBubble } from './icons/chat-bubble';
import { Community } from './icons/community';
import { Friends } from './icons/friends';
import { AddUser } from './icons/add-user';
import { RemoveUser } from './icons/remove-user';
import { BlockUser } from './icons/block-user';
import { Smile } from './icons/smile';
import { Sad } from './icons/sad';
import { Angry } from './icons/angry';
import { Laugh } from './icons/laugh';
import { Wink } from './icons/wink';
import { Surprise } from './icons/surprise';
import { StarFace } from './icons/star-face';
import { WinkingFace } from './icons/winking-face';
import { LaughingFace } from './icons/laughing-face';
import { FloatingHearts } from './icons/floating-hearts';
import { BouncingMessage } from './icons/bouncing-message';
import { RingingPhone } from './icons/ringing-phone';

export const SocialPack: IconPack = {
  id: 'social',
  name: 'Social',
  description: 'Icons for social media, community, and user interaction',
  icons: [
    Heart,
    HeartBroken,
    ThumbsUp,
    ThumbsDown,
    User,
    UserGroup,
    Share,
    Bookmark,
    Camera,
    Eye,
    EyeOff,
    AtSign,
    Hashtag,
    Globe,
    Pin,
    SocialStar,
    SocialFire,
    Verified,
    Comment,
    Repost,
    Notification,
    // Animated
    PulseHeart, BlinkingEye, WavingFlag,
    // New static
    Message, ChatBubble, Community, Friends, AddUser, RemoveUser, BlockUser,
    Smile, Sad, Angry, Laugh, Wink, Surprise, StarFace,
    // New animated
    WinkingFace, LaughingFace, FloatingHearts, BouncingMessage, RingingPhone,
  ],
  version: '0.1.0',
  author: 'pxlkit',
};
