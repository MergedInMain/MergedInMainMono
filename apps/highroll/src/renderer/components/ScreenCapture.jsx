import React, { useState } from 'react';

/**
 * ScreenCapture component for capturing and displaying screenshots
 */
const ScreenCapture = () => {
  const [screenshot, setScreenshot] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const [showSources, setShowSources] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState({ x: 0, y: 0, width: 800, height: 600 });

  // Capture the primary screen
  const captureScreen = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      
      const result = await window.electron.captureScreen();
      
      if (result.success) {
        setScreenshot(result.data);
      } else {
        setError(result.message || 'Failed to capture screen');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during screen capture');
      console.error('Screen capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Get available screen and window sources
  const getSources = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      
      const result = await window.electron.getSources();
      
      if (result.success && result.sources) {
        setSources(result.sources);
        setShowSources(true);
      } else {
        setError(result.message || 'Failed to get screen sources');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while getting sources');
      console.error('Get sources error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Capture a specific region of the screen
  const captureRegion = async () => {
    try {
      setIsCapturing(true);
      setError(null);
      
      const result = await window.electron.captureRegion(selectedRegion);
      
      if (result.success) {
        setScreenshot(result.data);
      } else {
        setError(result.message || 'Failed to capture region');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during region capture');
      console.error('Region capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle region input changes
  const handleRegionChange = (e) => {
    const { name, value } = e.target;
    setSelectedRegion(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };

  return (
    <div className="screen-capture">
      <h2>Screen Capture</h2>
      
      <div className="card">
        <h3 className="card-title">Capture Controls</h3>
        
        <div className="button-group">
          <button 
            className="button" 
            onClick={captureScreen} 
            disabled={isCapturing}
          >
            {isCapturing ? 'Capturing...' : 'Capture Screen'}
          </button>
          
          <button 
            className="button" 
            onClick={getSources} 
            disabled={isCapturing}
          >
            Show Available Sources
          </button>
        </div>
        
        <div className="form-section">
          <h4>Capture Specific Region</h4>
          <div className="form-row">
            <div className="form-control">
              <label htmlFor="x">X:</label>
              <input 
                type="number" 
                id="x" 
                name="x" 
                value={selectedRegion.x} 
                onChange={handleRegionChange} 
                min="0"
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="y">Y:</label>
              <input 
                type="number" 
                id="y" 
                name="y" 
                value={selectedRegion.y} 
                onChange={handleRegionChange} 
                min="0"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-control">
              <label htmlFor="width">Width:</label>
              <input 
                type="number" 
                id="width" 
                name="width" 
                value={selectedRegion.width} 
                onChange={handleRegionChange} 
                min="1"
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="height">Height:</label>
              <input 
                type="number" 
                id="height" 
                name="height" 
                value={selectedRegion.height} 
                onChange={handleRegionChange} 
                min="1"
              />
            </div>
          </div>
          
          <button 
            className="button" 
            onClick={captureRegion} 
            disabled={isCapturing}
          >
            Capture Region
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
      </div>
      
      {showSources && sources.length > 0 && (
        <div className="card">
          <h3 className="card-title">Available Sources</h3>
          <div className="sources-grid">
            {sources.map(source => (
              <div key={source.id} className="source-item">
                <h4>{source.name}</h4>
                <img 
                  src={source.thumbnail} 
                  alt={source.name} 
                  className="source-thumbnail" 
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {screenshot && (
        <div className="card">
          <h3 className="card-title">Screenshot</h3>
          <div className="screenshot-container">
            <img 
              src={screenshot} 
              alt="Screen Capture" 
              className="screenshot" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenCapture;
