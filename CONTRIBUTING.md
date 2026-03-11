# Contributing to Pxlkit

Thank you for your interest in contributing to Pxlkit! Whether it's new icons, bug fixes, components, or documentation improvements — all contributions are welcome.

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10

### Setup

```bash
git clone https://github.com/joangeldelarosa/pxlkit.git
cd pxlkit
npm install
npm run dev
```

The web app runs on **http://localhost:3333**.

## Development Workflow

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run `npm run build` to verify everything compiles
5. Run `node validate-icons.js` if you added/modified icons
6. Commit with a descriptive message (see [Commit Convention](#commit-convention))
7. Push to your fork and submit a **Pull Request**

## Icon Contributions

### Creating a New Icon

1. Create a `.ts` file in `packages/<pack>/src/icons/`
2. Define a `PxlKitData` or `AnimatedPxlKitData` export
3. Add the export to the pack's `src/index.ts`
4. Add it to the pack's `icons: [...]` array

### Icon Design Guidelines

- **Grid size**: 16×16 characters (exactly 16 rows, 16 chars each)
- **Transparent pixel**: `.` (dot) — never define it in the palette
- **Palette keys**: Single uppercase letters (A-Z)
- **Tags**: Include 2-5 meaningful tags for searchability
- **File names**: Use `kebab-case` (e.g., `fire-sword.ts`)
- **Author**: Set to `'pxlkit'` for community contributions

### Validation

```bash
node validate-icons.js
```

This checks grid dimensions, palette usage, and detects unused/missing keys.

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add lightning-bolt icon to weather pack
fix: correct palette key in trophy icon
docs: update installation instructions
chore: update tsup to v8.4
```

**Types**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`

## Project Structure

```
packages/
  core/           → Types, React components, SVG utilities
  gamification/   → RPG, achievements, rewards icons
  feedback/       → Alerts, status, notification icons
  social/         → Community, emojis, messaging icons
  weather/        → Climate, moon, temperature icons
  ui/             → Interface controls, navigation icons
  effects/        → Animated VFX, particle icons
apps/
  web/            → Next.js showcase & documentation site
```

## Contributor License

By submitting code, icons, or other material, you agree to the contributor license terms in [LICENSE](./LICENSE) Section 4. In short: you grant the project a perpetual, worldwide license to use your contribution under any license terms, including commercial licenses.

**Contributors who have accepted icons, code, or significant documentation merged into the project receive a free Team license** as a thank-you.

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.

## Questions?

- Open an [issue](https://github.com/joangeldelarosa/pxlkit/issues)
- Email: info@pxlkit.xyz
