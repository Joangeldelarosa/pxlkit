# Source → pxlkit component map

Hand-curated. Every `Pixel*` named here is checked against the registry by coherence
gate 36, so a renamed or removed component breaks the build rather than quietly
teaching a skill to hallucinate.

**The rule that keeps this honest:** anything with no equivalent is *kept and wrapped
in `PixelBox`*. Never invent a component. Inventing one is the single most common way
a conversion produces code that does not compile.

## Actions

| Source | pxlkit | Notes |
|---|---|---|
| `<button>`, shadcn `Button`, MUI `Button` | `PixelButton` | `variant` maps 1:1 for solid / soft / ghost / outline |
| `<a>` styled as a button, `Button asChild` | `PixelButton asChild` | wraps a single child element, merging className and ref |
| icon-only button | `PixelIconButton` | needs `aria-label` |
| button with a dropdown arrow | `PixelSplitButton` | |
| unstyled/reset button | `PixelBareButton` | keeps behaviour, drops chrome |

## Forms

| Source | pxlkit | Notes |
|---|---|---|
| `<input>`, `TextField`, `Input` | `PixelInput` | `helperText` → `hint` |
| `<textarea>` | `PixelTextarea` | |
| `<select>`, `Select` | `PixelSelect` | takes `Option[]` |
| searchable select, `Autocomplete` | `PixelCombobox` | |
| multi-select | `PixelMultiSelect` | |
| `<input type=checkbox>`, `Checkbox` | `PixelCheckbox` | |
| `<input type=radio>`, `RadioGroup` | `PixelRadioGroup` | |
| `Switch`, `Toggle` | `PixelSwitch` | |
| `<input type=password>` | `PixelPasswordInput` | reveal toggle included |
| `<input type=number>`, spinner | `PixelNumberInput` | |
| `<input type=date>`, date picker | `PixelDatePicker` | range: `PixelDateRangePicker` |
| `<input type=color>` | `PixelColorInput` | |
| `<input type=file>`, dropzone | `PixelFileUpload` | |
| OTP / verification code | `PixelOTPInput` | |
| `<input type=range>`, `Slider` | `PixelSlider` | |
| segmented control, tab-like radio | `PixelSegmented` | |
| toggle button group | `PixelToggleGroup`, `PixelToggle` | |
| input with prefix/suffix add-ons | `PixelInputGroup` | |
| react-hook-form `<form>` | `PixelForm` + `PixelForm.Field` | do not also pass `label`/`error` to the input |

## Layout

| Source | pxlkit | Notes |
|---|---|---|
| `<div>` wrapper with padding/border | `PixelBox` | |
| flex column stack, `Stack` | `PixelStack` | |
| flex row with wrapping | `PixelCluster` | |
| CSS grid | `PixelGrid` | equal heights: `PixelEqualHeightGrid` |
| max-width centred container | `PixelContainer` | the canonical section wrapper |
| two-column split | `PixelTwoColumn` | |
| centring wrapper | `PixelCenter` | |
| `<section>` with heading | `PixelSection` + `PixelSectionHeader` | |
| `<hr>`, `Divider` | `PixelDivider` | |
| feature grid with visual hierarchy | `PixelBento` + `PixelBentoCell` | use when cells differ in weight |
| scrollable region | `PixelScrollArea` | |

## Data display

| Source | pxlkit | Notes |
|---|---|---|
| static `<table>` | `PixelTable` | |
| `DataGrid`, TanStack Table | `PixelDataTable` | reuse existing columns; pagination only if you pass `pagination`; `rowSelection` adds a checkbox column |
| `Chip`, `Tag` | `PixelChip`, `PixelChipGroup` | |
| `Badge` | `PixelBadge`, `PixelBadgeGroup` | corner ribbon: `PixelRibbon` |
| `Avatar`, `AvatarGroup` | `PixelAvatar`, `PixelAvatarGroup` | |
| `<code>` inline | `PixelCodeInline` | |
| keyboard shortcut hint | `PixelKbd` | |
| `<details>` inline disclosure | `PixelCollapsible` | |
| colour swatch | `PixelColorSwatch` | |
| styled `<a>` | `PixelTextLink` | |
| vertical activity feed | `PixelTimeline` | |
| KPI figure | `PixelStatCard`, `PixelStatGroup` | |
| star rating | `PixelStarRating` | |
| image/content slider | `PixelCarousel` | |
| sparkline | `PixelSparkline` | single series |
| bar chart | `PixelBarChart` | single series |
| area/line chart | `PixelAreaChart` | single series |
| **multi-series chart** (recharts, chart.js) | *keep the original library* | the kit's charts are single-series; converting loses data. Wrap it in `PixelBox` so the frame matches and say what you kept |

## Navigation

| Source | pxlkit | Notes |
|---|---|---|
| `Tabs` | `PixelTabs` | sugar `items` prop or compositional subcomponents |
| `Accordion` | `PixelAccordion` | |
| `Breadcrumbs` | `PixelBreadcrumb` | |
| pagination controls | `PixelPagination` | |
| app sidebar | `PixelSidebar` | |
| top menu bar | `PixelMenubar` | |
| mega-menu | `PixelNavigationMenu` | |
| wizard / multi-step progress | `PixelStepper` | |
| sticky marketing nav | sticky-nav recipe | see `recipes.generated.md` |

## Overlays

| Source | pxlkit | Notes |
|---|---|---|
| `Dialog`, `Modal`, `<dialog>` | `PixelModal` | fully controlled: `open`, `onClose`, `title` all required |
| confirm dialog | `PixelAlertDialog` | |
| `Drawer` | `PixelDrawer` | edge panel: `PixelSheet` |
| `DropdownMenu` | `PixelDropdown` | |
| `Tooltip` | `PixelTooltip` | |
| `Popover` | `PixelPopover` | |
| command palette, `cmdk` | `PixelCommand` | |
| portal target | `PixelPortal` | |

## Feedback

| Source | pxlkit | Notes |
|---|---|---|
| `Alert`, callout | `PixelAlert` | |
| `Snackbar`, `toast()` from sonner / react-hot-toast | `useToast()` | needs `PxlKitToastProvider`; map `.success` / `.error` / `.loading`. A loading toast must be resolved by `update` or `promise` |
| `Progress` | `PixelProgress` | |
| `Skeleton` | `PixelSkeleton` | |
| `CircularProgress`, spinner | `PixelSpinner` | |
| empty state illustration | `PixelEmptyState` | |

## Marketing

| Source | pxlkit | Notes |
|---|---|---|
| hand-built hero | `PixelHeroSection` | `variant` per layout |
| hero image/video frame | `PixelHeroMedia` | |
| feature card | `PixelFeatureCard` | |
| pricing card | `PixelPricingCard` | |
| testimonial | `PixelTestimonialCard` | |
| icon in a decorative frame | `PixelIconFrame` | |
| generic card, `Paper` | `PixelCard` | sugar props: `title`, `media`, `badge`, `footer` |

## Motion

| Source | pxlkit | Notes |
|---|---|---|
| framer-motion fade/slide/zoom on scroll | `PixelFadeIn`, `PixelSlideIn`, `PixelZoomIn` | |
| looping float / pulse / bounce | `PixelFloat`, `PixelPulse`, `PixelBounce` | |
| attention shake, rotation | `PixelShake`, `PixelRotate` | |
| glitch / flicker effect | `PixelGlitch`, `PixelFlicker` | signature retro treatment |
| typewriter text | `PixelTypewriter` | |
| mouse or scroll parallax | `PixelMouseParallax`, `PixelParallaxGroup`, `PixelParallaxLayer` | |

## Icons

| Source | pxlkit | Notes |
|---|---|---|
| lucide, heroicons, react-icons, MUI icons | a pack icon rendered by `PxlKitIcon` | search `icon-shapes.generated.json` by tag |
| no equivalent found | offer `/pxlkit:icon` | do not substitute something that means a different thing |

Using pxlkit's shipped icons requires visible attribution — "Icons by Pxlkit",
linking to pxlkit.xyz — under `LICENSE-ASSETS`. An icon the user authors is theirs.

## Things with no equivalent

Keep the original implementation and wrap it in `PixelBox` so the frame, border and
shadow match the rest of the page. Then list what you kept and why. Common cases:
multi-series charts, maps, rich-text editors, video players, payment widgets.
