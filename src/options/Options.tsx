import React, { useState, useEffect } from 'react';
import { settings } from '../utils/storage';
import { DEFAULT_BASE_URL } from '../types';

const Options: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await settings.getSettings();
      setBaseUrl(currentSettings.baseUrl);
    } catch (error) {
      setBaseUrl(DEFAULT_BASE_URL);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const normalizedUrl = baseUrl.replace(/\/+$/, '');
      await settings.saveSettings({ baseUrl: normalizedUrl });
      setBaseUrl(normalizedUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      // Silently handle errors
    }
  };

  const handleReset = async () => {
    setBaseUrl(DEFAULT_BASE_URL);
    await settings.saveSettings({ baseUrl: DEFAULT_BASE_URL });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return <div className="options-container">Loading...</div>;
  }

  return (
    <div className="options-container">
      <div className="options-card">
        <div className="options-header">
          <img
            src="/icons/icon48.png"
            alt="Turbine Navigator"
            className="options-logo"
          />
          <h1>Turbine Navigator Settings</h1>
        </div>

        <div className="options-content">
          <div className="form-group">
            <label htmlFor="baseUrl">Turbine Base URL</label>
            <input
              type="url"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://turbine.example.com"
            />
            <small className="help-text">
              The base URL for your Turbine instance (without trailing slash)
            </small>
          </div>

          <div className="button-group">
            <button className="btn-primary" onClick={handleSave}>
              Save Settings
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              Reset to Default
            </button>
          </div>

          {saved && (
            <div className="success-message">
              Settings saved successfully!
            </div>
          )}
        </div>

        <div className="options-footer">
          <small>Default: {DEFAULT_BASE_URL}</small>
        </div>
      </div>
    </div>
  );
};

export default Options;
