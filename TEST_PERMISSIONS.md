# Testing Chrome Extension with Reduced Permissions

## Changes Made
- Removed `activeTab` permission (not needed)
- Removed `host_permissions: ["*://*/*"]` (overly broad)
- Kept only `storage` and `tabs` permissions

## Test Plan

### 1. Load the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder
4. Check that the extension loads without errors

### 2. Test URL Detection (Background Service)
1. Navigate to a Turbine URL (e.g., https://turbine.adeo.cloud/environments/namespace/env/)
2. Check Chrome DevTools > Application > Service Workers > turbine-navigator
3. Look at the console logs for "Turbine environment detected" messages
4. Verify that the environment is tracked

### 3. Test Popup Functionality
1. Click the extension icon in the toolbar (or use Cmd+B / Ctrl+B)
2. Verify that recent environments are displayed
3. Click on an environment to navigate to it
4. Test both "Open in current tab" and "Open in new tab" options

### 4. Test Tab Switching
1. Open multiple Turbine environments in different tabs
2. Switch between tabs
3. Check that the background service detects the activation (console logs)
4. Verify that recent environments list updates

## Expected Results
- All functionality should work WITHOUT the broad host permissions
- The `tabs` permission alone allows:
  - Reading `tab.url` in background listeners
  - Creating new tabs with `chrome.tabs.create()`
  - Updating tabs with `chrome.tabs.update()`
- Users won't see the scary "Read and change all your data" warning

## If URL Reading Fails
If `tab.url` returns undefined without host permissions, we'll need to add specific host permissions:

```json
"host_permissions": [
  "https://turbine.adeo.cloud/*"
]
```

Or use optional permissions for flexibility:

```json
"optional_host_permissions": [
  "https://*.adeo.cloud/*"
]
```