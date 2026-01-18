import { parseTurbineUrl } from '../utils/urlParser';
import { storage, settings } from '../utils/storage';
import { componentStorage } from '../utils/componentStorage';
import { ComponentDeployment } from '../types';

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

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'COMPONENT_DATA') {
    const deployments = message.payload as ComponentDeployment[];
    console.log('[Turbine Navigator] Received component data:', deployments.length, 'components');

    componentStorage.saveComponentDeployments(deployments)
      .then(() => {
        console.log('[Turbine Navigator] Component data saved successfully');
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('[Turbine Navigator] Error saving component data:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }
});

console.log('Turbine Navigator background service worker loaded');
