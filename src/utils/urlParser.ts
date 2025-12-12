import { TurbineEnvironment } from '../types';

/**
 * Parses a Turbine URL and extracts namespace and environment information
 * Example URL: https://turbine.example.com/environments/cdp-service-offer-builder-prep/view/DEPLOYMENTS
 * Pattern: /environments/{namespace}/...
 * @param url - The URL to parse
 * @param baseUrl - The configured Turbine base URL to match against
 */
export function parseTurbineUrl(url: string, baseUrl: string): TurbineEnvironment | null {
  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);

    // Check if it's a matching Turbine URL
    if (urlObj.hostname !== baseUrlObj.hostname) {
      return null;
    }

    // Extract namespace from path
    // Pattern: /environments/{namespace}/...
    const match = urlObj.pathname.match(/\/environments\/([^\/]+)/);
    if (!match) {
      return null;
    }

    const fullNamespace = match[1];

    // Try to extract environment from namespace
    // Common pattern: {service-name}-{env}
    const envMatch = fullNamespace.match(/-(dev|sit|uat1|qa|prep|prod)$/i);
    const environment = envMatch ? envMatch[1].toLowerCase() : 'unknown';

    // Store base namespace without environment suffix
    const namespace = fullNamespace.replace(/-(dev|sit|uat1|qa|prep|prod)$/i, '');

    // Detect qa/uat1 preference based on current environment
    let qaUat1Preference: 'qa' | 'uat1' | 'undetermined' = 'undetermined';
    if (environment === 'qa') {
      qaUat1Preference = 'qa';
    } else if (environment === 'uat1') {
      qaUat1Preference = 'uat1';
    }

    return {
      id: `${namespace}-${environment}-${Date.now()}`,
      namespace,
      environment,
      url,
      lastVisited: Date.now(),
      qaUat1Preference,
    };
  } catch (error) {
    console.error('Failed to parse Turbine URL:', error);
    return null;
  }
}

/**
 * Builds a Turbine URL for a given namespace and optional path
 * @param baseUrl - The configured Turbine base URL
 * @param namespace - The namespace to navigate to
 * @param path - Optional path within the environment
 */
export function buildTurbineUrl(baseUrl: string, namespace: string, path: string = 'view/DEPLOYMENTS'): string {
  return `${baseUrl}/environments/${namespace}/${path}`;
}

/**
 * Extracts the base namespace (without environment suffix)
 */
export function getBaseNamespace(namespace: string): string {
  return namespace.replace(/-(dev|sit|uat1|qa|prep|prod)$/i, '');
}

/**
 * Builds a namespace with environment suffix
 */
export function buildNamespaceWithEnv(baseNamespace: string, env: string): string {
  return `${baseNamespace}-${env}`;
}
