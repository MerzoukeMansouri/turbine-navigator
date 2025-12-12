import { parseTurbineUrl } from '../utils/urlParser';
import { storage, settings } from '../utils/storage';

// Listen for tab updates to track visited Turbine URLs
chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  // Only process when the page has finished loading
  if (changeInfo.status === 'complete' && tab.url) {
    const baseUrl = await settings.getBaseUrl();
    const turbineEnv = parseTurbineUrl(tab.url, baseUrl);

    if (turbineEnv) {
      console.log('Turbine environment detected:', turbineEnv);
      storage.addEnvironment(turbineEnv);
    }
  }
});

// Listen for tab activation to track currently active Turbine URLs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);

  if (tab.url) {
    const baseUrl = await settings.getBaseUrl();
    const turbineEnv = parseTurbineUrl(tab.url, baseUrl);

    if (turbineEnv) {
      console.log('Turbine environment activated:', turbineEnv);
      storage.addEnvironment(turbineEnv);
    }
  }
});

console.log('Turbine Navigator background service worker loaded');
