import React, { useState, useEffect } from 'react';
import { componentStorage } from '../utils/componentStorage';
import { Environment, ENVIRONMENTS, VISIBLE_ENVIRONMENTS_KEY, ComponentVersionInfo } from '../types';
import Tooltip from './Tooltip';

interface ComponentVersion {
  name: string;
  versions: Map<Environment, ComponentVersionInfo>;
}

interface NamespaceData {
  namespace: string;
  components: ComponentVersion[];
  environments: Environment[];
}

const ComponentsMatrix: React.FC = () => {
  const [namespaceData, setNamespaceData] = useState<NamespaceData[]>([]);
  const [expandedNamespaces, setExpandedNamespaces] = useState<Set<string>>(new Set());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [visibleEnvs, setVisibleEnvs] = useState<Set<Environment>>(new Set(ENVIRONMENTS));

  const loadData = async () => {
    try {
      const data = await componentStorage.getNamespaceComponents();
      const namespaces: NamespaceData[] = [];

      data.forEach((nsData, namespace) => {
        const components: ComponentVersion[] = [];
        nsData.components.forEach((versions, componentName) => {
          components.push({
            name: componentName,
            versions,
          });
        });

        // Sort components by name
        components.sort((a, b) => a.name.localeCompare(b.name));

        // Get environments in standard order
        const envs = ENVIRONMENTS.filter(env => nsData.environments.has(env));

        namespaces.push({
          namespace,
          components,
          environments: envs,
        });
      });

      // Sort namespaces alphabetically
      namespaces.sort((a, b) => a.namespace.localeCompare(b.namespace));

      setNamespaceData(namespaces);
      setLastUpdate(new Date());
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadVisibleEnvironments();

    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.turbine_component_deployments) {
        loadData();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const toggleNamespace = (namespace: string) => {
    const newExpanded = new Set(expandedNamespaces);
    if (newExpanded.has(namespace)) {
      newExpanded.delete(namespace);
    } else {
      newExpanded.add(namespace);
    }
    setExpandedNamespaces(newExpanded);
  };

  const expandAll = () => {
    const allNamespaces = new Set(namespaceData.map(ns => ns.namespace));
    setExpandedNamespaces(allNamespaces);
  };

  const collapseAll = () => {
    setExpandedNamespaces(new Set());
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const loadVisibleEnvironments = async () => {
    try {
      const result = await chrome.storage.local.get(VISIBLE_ENVIRONMENTS_KEY);
      const storedEnvs = result[VISIBLE_ENVIRONMENTS_KEY] as Environment[] | undefined;
      if (storedEnvs && Array.isArray(storedEnvs)) {
        setVisibleEnvs(new Set(storedEnvs));
      }
    } catch (error) {
      // Silently handle errors
    }
  };

  const saveVisibleEnvironments = async (envs: Set<Environment>) => {
    try {
      await chrome.storage.local.set({
        [VISIBLE_ENVIRONMENTS_KEY]: Array.from(envs),
      });
    } catch (error) {
      // Silently handle errors
    }
  };

  const toggleEnvironment = (env: Environment) => {
    const newVisible = new Set(visibleEnvs);
    if (newVisible.has(env)) {
      // Prevent hiding all environments
      if (newVisible.size > 1) {
        newVisible.delete(env);
      }
    } else {
      newVisible.add(env);
    }
    setVisibleEnvs(newVisible);
    saveVisibleEnvironments(newVisible);
  };

  const showAllEnvironments = () => {
    const allEnvs = new Set(ENVIRONMENTS);
    setVisibleEnvs(allEnvs);
    saveVisibleEnvironments(allEnvs);
  };

  const deleteNamespace = async (namespace: string) => {
    if (confirm(`Delete all component data for "${namespace}"?`)) {
      await componentStorage.deleteNamespace(namespace);
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="matrix-container">
        <div className="matrix-loading">Loading component data...</div>
      </div>
    );
  }

  if (namespaceData.length === 0) {
    return (
      <div className="matrix-container">
        <div className="matrix-header">
          <h1>Component Deployments</h1>
        </div>
        <div className="matrix-empty">
          <p>No component data available</p>
          <small>Visit Turbine deployment pages to see component versions</small>
        </div>
      </div>
    );
  }

  return (
    <div className="matrix-container">
      <div className="matrix-header">
        <div className="matrix-header-left">
          <h1>Component Deployments</h1>
          <span className="matrix-timestamp">Last updated: {formatTimestamp(lastUpdate)}</span>
        </div>
        <div className="env-filter-controls">
          <span className="env-filter-label">Environments:</span>
          <div className="env-toggles">
            {ENVIRONMENTS.map((env) => (
              <button
                key={env}
                className={`env-toggle ${visibleEnvs.has(env) ? 'active' : ''}`}
                onClick={() => toggleEnvironment(env)}
              >
                {env.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="matrix-btn" onClick={showAllEnvironments}>
            Show All
          </button>
        </div>
        <div className="matrix-header-actions">
          <button className="matrix-btn" onClick={expandAll}>
            Expand All
          </button>
          <button className="matrix-btn" onClick={collapseAll}>
            Collapse All
          </button>
        </div>
      </div>

      <div className="matrix-content">
        {namespaceData.map((nsData) => {
          const isExpanded = expandedNamespaces.has(nsData.namespace);

          return (
            <div key={nsData.namespace} className="accordion-item">
              <div className="accordion-header">
                <div
                  className="accordion-title"
                  onClick={() => toggleNamespace(nsData.namespace)}
                >
                  <span className="accordion-icon">{isExpanded ? '▼' : '▶'}</span>
                  <span className="accordion-namespace">{nsData.namespace}</span>
                  <span className="accordion-count">
                    {nsData.components.length} component{nsData.components.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  className="namespace-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNamespace(nsData.namespace);
                  }}
                  title="Delete namespace"
                >
                  ×
                </button>
              </div>

              {isExpanded && (
                <div className="accordion-body">
                  <div className="component-table-wrapper">
                    <table className="component-table">
                      <thead>
                        <tr>
                          <th className="component-name-header">Component</th>
                          {nsData.environments.filter(env => visibleEnvs.has(env)).map((env) => (
                            <th key={env} className="env-header">
                              {env.toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {nsData.components.map((component) => (
                          <tr key={component.name}>
                            <td className="component-name">{component.name}</td>
                            {nsData.environments.filter(env => visibleEnvs.has(env)).map((env) => {
                              const versionInfo = component.versions.get(env);
                              return (
                                <td key={env} className="component-version">
                                  {versionInfo ? (
                                    <Tooltip content={`Extracted: ${formatFullDate(versionInfo.lastUpdated)}`}>
                                      <span className="version-badge">
                                        {versionInfo.version}
                                      </span>
                                    </Tooltip>
                                  ) : (
                                    <span className="version-empty">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComponentsMatrix;
