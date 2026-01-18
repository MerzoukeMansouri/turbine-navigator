# Turbine Navigator

A Chrome extension for quick navigation between Turbine environments and namespaces.

## Features

- 🔍 **Real-time search** - Filter namespaces instantly as you type
- 🎯 **Smart environment detection** - Automatically detects if a service uses `qa` or `uat1` and shows only relevant badges
- 🚀 **Quick environment switching** - One-click navigation between dev, sit, uat1/qa, prep, and prod
- ⌨️ **Keyboard shortcut** - Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac) to open popup
- 📝 **Automatic tracking** - Tracks visited Turbine environments automatically
- ⏱️ **Recent history** - Shows last visited time for each namespace
- 💾 **Local storage** - All data stored locally (no backend required)

## Development Setup

1. Install dependencies:
```bash
pnpm install
```

2. Build the extension:
```bash
pnpm run build
```

This will:
- Compile TypeScript and React code
- Copy static assets (manifest.json, icons) to the `dist` folder
- Generate a production-ready extension in the `dist` directory

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension is now installed!

## Usage

### Automatic Tracking
- Visit any Turbine environment URL (e.g., `https://turbine.adeo.cloud/environments/cdp-service-offer-builder-prep/view/DEPLOYMENTS`)
- The extension automatically tracks it in your recent environments
- Smart detection: If you visit a `-qa` or `-uat1` environment, the extension remembers which one the service uses

### Opening the Popup
- Click the extension icon in the toolbar, OR
- Use keyboard shortcut: `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)

### Searching
- The search box appears at the top when you have tracked environments
- Start typing to filter namespaces in real-time
- Search is case-insensitive
- Click the × button to clear the search

### Navigating Environments
- Click on a namespace name to open it in the current tab
- Click on an environment badge (dev, sit, qa/uat1, prep, prod) to switch to that environment
- Hold Ctrl/Cmd while clicking a badge to open in a new tab
- Click the × button next to a namespace to remove it from history
- Click "Clear All" to remove all tracked environments

## Development

### Run in development mode:
```bash
pnpm run dev
```

### Build for production:
```bash
pnpm run build
```

## Project Structure

```
turbine-chrome-extension/
├── src/
│   ├── popup/              # React popup UI
│   │   ├── Popup.tsx       # Main popup component
│   │   ├── Popup.css       # Popup styles
│   │   ├── index.html      # HTML entry point
│   │   └── main.tsx        # React entry point
│   ├── background/         # Background service worker
│   │   └── background.ts   # Tracks visited URLs
│   ├── utils/              # Utility functions
│   │   ├── storage.ts      # Chrome storage wrapper
│   │   └── urlParser.ts    # URL parsing logic
│   └── types/              # TypeScript types
│       └── index.ts
├── public/
│   ├── manifest.json       # Extension manifest
│   └── icons/              # Extension icons
└── dist/                   # Build output (generated)
```

## Technologies

- React 18
- TypeScript
- Vite (with vite-plugin-static-copy for assets)
- Chrome Extension Manifest V3
- Chrome Storage API

## Release Process

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and releases.

### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature (triggers minor version bump)
- `fix:` - Bug fix (triggers patch version bump)
- `docs:` - Documentation changes (no release)
- `chore:` - Maintenance tasks (no release)
- `refactor:` - Code refactoring (no release)
- `perf:` - Performance improvements (triggers patch version bump)
- `BREAKING CHANGE:` - Breaking changes (triggers major version bump)

**Examples:**
```
feat: add search filtering by environment type
fix: resolve keyboard shortcut conflict on macOS
docs: update installation instructions
chore: update dependencies
```

### Automated Release

When you push to `main`, GitHub Actions will:
1. Build the extension
2. Analyze commits since the last release
3. Determine the next version number
4. Update `package.json`, `manifest.json`, and `CHANGELOG.md`
5. Create a Git tag and GitHub release
6. Attach a `.zip` file of the extension to the release

## Tips

- **First-time setup**: After installing, visit a few Turbine environments ending in `-qa` or `-uat1` to establish preferences for each service
- **Clear old data**: If you upgraded from an older version, click "Clear All" and revisit your environments to benefit from the smart qa/uat1 detection
- **Keyboard workflow**: Press `Ctrl+K` (or `Cmd+K` on Mac), start typing to search, then use environment badges to switch quickly
