<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# feedback

7 components. Import from `@pxlkit/ui-kit`.

### PixelAlert
- stable · since 1.0.0
- Inline status banner with title, message, tone, optional icon, and action — announces itself to screen readers via role="alert".
- Seven tones (neutral, green, cyan, gold, red, purple, pink) with soft tint + matching border. · Surface-aware: pixel adds a left HP-bar accent stripe and chamfered border; linear stays rounded. · Smart aria-live default — red/gold use "assertive", everything else "polite". Overridable via live prop. · Optional icon and action slots for quick triage (e.g. Retry, Dismiss). · SSR-safe, ref-forwarded, no client state.
- related: PixelToast, PixelAlertDialog, PixelEmptyState

### PixelEmptyState
- stable · since 1.0.0
- Placeholder block for empty collections or no-results states, with optional icon, title, description, and primary action.
- Centered dashed-border container that communicates absence without feeling like an error · Optional icon slot rendered with cyan accent and aria-hidden so it stays decorative · Action slot for a primary recovery CTA (create, refresh, retry) · Pixel + linear surface variants share identical API and inherit the surface from context · SSR-safe and tree-shakable; no client-only hooks beyond surface inheritance
- related: PixelAlert, PixelSkeleton

### PixelProgress
- stable · since 1.0.0
- Determinate or indeterminate progress bar that renders as 10 segmented HP-bar blocks on the pixel surface and a smooth filled track on the linear surface.
- Pixel surface renders an RPG-style 10-segment HP bar; linear surface renders a smooth filled track · Seven tones via the shared toneMap palette · Optional label + auto-rendered percentage, both individually toggleable · Indeterminate mode for unknown-duration work (visual pulse + aria-busy) · Input value is safely clamped to the [0, 100] range
- related: PixelSpinner, PixelSkeleton, PixelSlider

### PixelSkeleton
- stable · since 1.0.0
- Animated loading placeholder that reserves layout space while async content resolves.
- Width/height props accept any CSS length so blocks can mirror the final content footprint. · Pixel and linear surfaces match the rest of the kit — sharp pixel corners or smooth rounded fills. · `rounded` flips between square/avatar shapes (circle on linear, 2px chamfer on pixel). · Ships with `role="status"` and an overridable `ariaLabel` for screen-reader-friendly loading. · Forwards refs and arbitrary div attributes — drop it anywhere a placeholder block is needed.
- related: PixelSpinner, PixelProgress, PixelEmptyState

### PixelSpinner
- stable · since 1.9.0
- Compact loading indicator with surface-aware animation (stepped on pixel, smooth on linear) and tone-driven color.
- Four sizes (xs/sm/md/lg) and seven tones aligned with token palette · Surface-aware: 8-step pixel rotation vs smooth linear sweep · Respects prefers-reduced-motion (freezes animation, keeps shape) · role=status with sr-only label by default; decorative mode for nested use · forwardRef to the host span; SSR-safe and tree-shakable
- related: PixelAlert, PixelToast

### PixelToast
- stable · since 1.0.0
- Single toast notification card with title, message, tone, optional icon/action, loading spinner, and an auto-dismiss countdown bar — usually rendered by PxlKitToastProvider via useToast().
- Seven tones with matching border, text color, and HP-bar accent on pixel surface. · Auto-dismiss with a visual progress bar; hover/focus pauses the countdown. · Smart aria semantics — assertive role=alert for red/gold by default, polite role=status otherwise; overridable per toast. · Optional leading slot for icon, animatedIcon, or built-in loading spinner. · Action slot for inline retry / undo buttons; dismiss button always present.
- related: PxlKitToastProvider, PixelAlert, PixelAlertDialog

### PxlKitToastProvider
- stable · since 1.8.0
- App-root toast provider that hosts the toast queue, viewport portal, and stacked/expanded visual mode — paired with useToast() for imperative push/update/dismiss/promise APIs.
- Six positions (top/bottom × left/right/center) with portal-rendered viewport. · Sonner-style stacked mode: collapsed cards peek behind the front, hover/focus expands the stack. · Configurable max simultaneous toasts; oldest are dropped when the queue exceeds the cap. · Surface-aware (auto / pixel / linear) — pixel surface adds an HP-bar tone accent to each toast. · Single role="region" landmark announces "Notifications"; per-toast aria-live avoids double announcements.
- related: PixelToast, PixelAlert, PixelAlertDialog
