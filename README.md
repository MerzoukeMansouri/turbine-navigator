# Turbine Navigator

A Chrome extension for quick navigation between Turbine environments and namespaces.

## Features

- Automatically tracks visited Turbine environments
- Keyboard shortcut (Ctrl+Shift+T / Cmd+Shift+T) to open popup
- Quick environment switching with badges (dev, int, qa, prep, staging, prod)
- Recent environments list with timestamps
- All data stored locally (no backend required)

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

This will create a `dist` folder with the compiled extension.

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

### Opening the Popup
- Click the extension icon in the toolbar, OR
- Use keyboard shortcut: `Ctrl+Shift+T` (Windows/Linux) or `Cmd+Shift+T` (Mac)

### Navigating Environments
- Click on a namespace name to open it in the current tab
- Click on an environment badge to switch to that environment
- Hold Ctrl/Cmd while clicking to open in a new tab
- Click the × button to remove an environment from history
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

## Adding Icons

Place your icon files in `public/icons/`:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

If you don't have icons yet, you can remove the icons section from `public/manifest.json` temporarily.

## Technologies

- React 18
- TypeScript
- Vite
- Chrome Extension Manifest V3
- Chrome Storage API
