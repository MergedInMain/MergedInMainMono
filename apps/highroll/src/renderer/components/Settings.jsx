import React from 'react';

/**
 * Settings component for application configuration
 * @param {Object} props - Component props
 * @param {number} props.overlayOpacity - Current overlay opacity
 * @param {Function} props.updateOverlayOpacity - Function to update overlay opacity
 */
const Settings = ({ overlayOpacity, updateOverlayOpacity }) => {
  return (
    <div>
      <h2>Settings</h2>
      
      <div className="card">
        <h3 className="card-title">Overlay Settings</h3>
        
        <div className="form-control">
          <label htmlFor="opacity">Overlay Transparency: {Math.round(overlayOpacity * 100)}%</label>
          <input
            type="range"
            id="opacity"
            min="0.1"
            max="1"
            step="0.1"
            value={overlayOpacity}
            onChange={(e) => updateOverlayOpacity(parseFloat(e.target.value))}
          />
        </div>
      </div>
      
      <div className="card">
        <h3 className="card-title">Application Settings</h3>
        
        <div className="form-control">
          <label htmlFor="startup">Launch on system startup</label>
          <input type="checkbox" id="startup" />
        </div>
        
        <div className="form-control">
          <label htmlFor="minimize">Minimize to system tray</label>
          <input type="checkbox" id="minimize" defaultChecked />
        </div>
      </div>
      
      <div className="card">
        <h3 className="card-title">Data Settings</h3>
        
        <div className="form-control">
          <label htmlFor="data-source">Primary Data Source</label>
          <select id="data-source" defaultValue="metatft">
            <option value="metatft">Meta TFT</option>
            <option value="tactics">tactics.tools</option>
            <option value="combined">Combined (Recommended)</option>
          </select>
        </div>
        
        <div className="form-control">
          <label htmlFor="refresh-frequency">Data Refresh Frequency</label>
          <select id="refresh-frequency" defaultValue="daily">
            <option value="startup">On Application Startup</option>
            <option value="daily">Once Per Day (Recommended)</option>
            <option value="manual">Manual Refresh Only</option>
          </select>
        </div>
        
        <button className="button">Clear Cache</button>
      </div>
    </div>
  );
};

export default Settings;
