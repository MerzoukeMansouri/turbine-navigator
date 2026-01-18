import { ComponentDeployment, Environment } from '../types';

let debounceTimer: number | null = null;

function extractComponentData(): ComponentDeployment[] {
  // Check if we're on a deployments page
  if (!window.location.pathname.includes('/environments/') || !window.location.pathname.includes('/view/DEPLOYMENTS')) {
    return [];
  }

  // Extract namespace from URL
  // Pattern: /environments/{namespace}/...
  const match = window.location.pathname.match(/\/environments\/([^\/]+)/);
  if (!match) {
    return [];
  }

  const fullNamespace = match[1];
  // Remove environment suffix to get base namespace
  const namespace = fullNamespace.replace(/-(dev|sit|uat1|qa|prep|prod)$/i, '');

  // Extract environment from namespace
  const envMatch = fullNamespace.match(/-(dev|sit|uat1|qa|prep|prod)$/i);
  const environment = (envMatch ? envMatch[1].toLowerCase() : 'unknown') as Environment;

  // Find all deployment panes
  const deploymentPanes = document.querySelectorAll('turbine-deployment-pane');
  const deployments: ComponentDeployment[] = [];

  deploymentPanes.forEach((pane) => {
    try {
      // Extract component name
      const nameLink = pane.querySelector<HTMLAnchorElement>('.deployment__body--name a[href^="/components/"]');
      if (!nameLink) return;

      const componentName = nameLink.textContent?.trim() || '';
      if (!componentName) return;

      // Extract version - handle both release versions and snapshot/branch versions
      const versionBadge = pane.querySelector<HTMLElement>('.deployment__body--versions .badge-release, .deployment__body--versions .badge-snapshot');
      if (!versionBadge) return;

      const version = versionBadge.textContent?.trim() || '';
      if (!version) return;

      // Extract environment type
      const envTypeBadge = pane.querySelector<HTMLElement>('.deployment__body--env-type .badge__env-type');
      const envType = envTypeBadge?.textContent?.trim() || environment;

      deployments.push({
        componentName,
        version,
        namespace,
        environment,
        envType,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      // Silently handle extraction errors
    }
  });

  return deployments;
}

function sendDataToBackground(deployments: ComponentDeployment[]): void {
  if (deployments.length === 0) return;

  chrome.runtime.sendMessage({
    type: 'COMPONENT_DATA',
    payload: deployments,
  }).catch(() => {
    // Silently handle messaging errors
  });
}

function debouncedExtractAndSend(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    const deployments = extractComponentData();
    sendDataToBackground(deployments);
    debounceTimer = null;
  }, 500); // Wait 500ms after last DOM change
}

// Initial extraction after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(debouncedExtractAndSend, 1000); // Wait 1s for initial DOM to stabilize
  });
} else {
  setTimeout(debouncedExtractAndSend, 1000);
}

// Watch for DOM changes
const observer = new MutationObserver((mutations) => {
  // Check if any mutations affected deployment panes
  const hasRelevantChanges = mutations.some((mutation) => {
    const target = mutation.target as HTMLElement;
    return (
      target.classList?.contains('deployments-wrapper') ||
      target.closest?.('turbine-deployment-pane') ||
      target.querySelector?.('turbine-deployment-pane')
    );
  });

  if (hasRelevantChanges) {
    debouncedExtractAndSend();
  }
});

// Observe the deployments wrapper
const deploymentsWrapper = document.querySelector('.deployments-wrapper');
if (deploymentsWrapper) {
  observer.observe(deploymentsWrapper, {
    childList: true,
    subtree: true,
    attributes: false,
  });
} else {
  // If wrapper not found yet, wait and try again
  setTimeout(() => {
    const wrapper = document.querySelector('.deployments-wrapper');
    if (wrapper) {
      observer.observe(wrapper, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }
  }, 2000);
}
