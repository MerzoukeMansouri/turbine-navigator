# Turbine Navigator

A Chrome extension for quick navigation between Turbine environments and namespaces.

## Features

- 🔍 **Real-time search** - Filter namespaces instantly as you type
- 🎯 **Smart environment detection** - Automatically detects if a service uses `qa` or `uat1` and shows only relevant badges
- 🚀 **Quick environment switching** - One-click navigation between dev, sit, uat1/qa, prep, and prod
- ⌨️ **Keyboard shortcut** - Press `Ctrl+M` (Windows/Linux) or `Cmd+M` (Mac) to open popup
- 📝 **Automatic tracking** - Tracks visited Turbine environments automatically
- ⏱️ **Recent history** - Shows last visited time for each namespace
- 💾 **Local storage** - All data stored locally (no backend required)

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
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
- Use keyboard shortcut: `Ctrl+B` (Windows/Linux) or `Cmd+B` (Mac)

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
npm run dev
```

### Build for production:
```bash
npm run build
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

## Tips

- **First-time setup**: After installing, visit a few Turbine environments ending in `-qa` or `-uat1` to establish preferences for each service
- **Clear old data**: If you upgraded from an older version, click "Clear All" and revisit your environments to benefit from the smart qa/uat1 detection
- **Keyboard workflow**: Press `Ctrl+M`, start typing to search, then use environment badges to switch quickly
