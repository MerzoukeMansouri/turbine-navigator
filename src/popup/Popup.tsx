import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { buildTurbineUrl, buildNamespaceWithEnv } from '../utils/urlParser';
import { TurbineEnvironment, ENVIRONMENTS } from '../types';

const Popup: React.FC = () => {
  const [environments, setEnvironments] = useState<TurbineEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      const envs = await storage.getRecentEnvironments();
      setEnvironments(envs);
    } catch (error) {
      console.error('Failed to load environments:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url: string, newTab: boolean = false) => {
    if (newTab) {
      chrome.tabs.create({ url });
    } else {
      chrome.tabs.update({ url });
    }
    window.close();
  };

  const navigateToEnv = (namespace: string, env: string, newTab: boolean = false) => {
    const fullNamespace = buildNamespaceWithEnv(namespace, env);
    const url = buildTurbineUrl(fullNamespace);
    openUrl(url, newTab);
  };

  const removeEnvironment = async (id: string) => {
    await storage.removeEnvironment(id);
    await loadEnvironments();
  };

  const clearAll = async () => {
    if (confirm('Clear all recent environments?')) {
      await storage.clearAll();
      await loadEnvironments();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getVisibleEnvironments = (preference: 'qa' | 'uat1' | 'undetermined') => {
    return ENVIRONMENTS.filter(envType => {
      // If service uses qa, hide uat1
      if (preference === 'qa' && envType === 'uat1') return false;
      // If service uses uat1, hide qa
      if (preference === 'uat1' && envType === 'qa') return false;
      // Show all if undetermined
      return true;
    });
  };

  const filteredEnvironments = environments.filter(env =>
    env.namespace.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="popup">Loading...</div>;
  }

  return (
    <div className="popup">
      <div className="header">
        <h1>Turbine Navigator</h1>
        {environments.length > 0 && (
          <button className="clear-btn" onClick={clearAll} title="Clear all">
            Clear All
          </button>
        )}
      </div>

      {environments.length > 0 && (
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search namespaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      )}

      {environments.length === 0 ? (
        <div className="empty-state">
          <p>No recent environments</p>
          <small>Visit a Turbine environment to get started</small>
        </div>
      ) : filteredEnvironments.length === 0 ? (
        <div className="empty-state">
          <p>No matches found</p>
          <small>Try a different search term</small>
        </div>
      ) : (
        <div className="environments-list">
          {filteredEnvironments.map((env) => (
            <div key={env.id} className="environment-item">
              <div className="environment-header">
                <div className="namespace-info">
                  <button
                    className="namespace-link"
                    onClick={() => openUrl(env.url)}
                    title={env.namespace}
                  >
                    {env.namespace}
                  </button>
                  <span className="timestamp">{formatTimestamp(env.lastVisited)}</span>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeEnvironment(env.id)}
                  title="Remove"
                >
                  ×
                </button>
              </div>

              <div className="environment-badges">
                {getVisibleEnvironments(env.qaUat1Preference || 'undetermined').map((envType) => (
                  <button
                    key={envType}
                    className={`env-badge ${env.environment === envType ? 'active' : ''}`}
                    onClick={(e) => {
                      navigateToEnv(env.namespace, envType, e.ctrlKey || e.metaKey);
                    }}
                    title={`Open ${envType} environment (Ctrl+Click for new tab)`}
                  >
                    {envType}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="footer">
        <small>Press Ctrl+B (Cmd+B on Mac) to open</small>
      </div>
    </div>
  );
};

export default Popup;
