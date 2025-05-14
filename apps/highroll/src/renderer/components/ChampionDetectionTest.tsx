import React, { useState, useEffect } from 'react';
import championDetectionService from '../services/champion-detection';
import { Champion } from '../../shared/types';

/**
 * Component for testing champion detection functionality
 */
const ChampionDetectionTest: React.FC = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [detectedChampions, setDetectedChampions] = useState<Champion[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize champion detection service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await championDetectionService.initialize();
      } catch (err) {
        setError(`Failed to initialize champion detection service: ${err}`);
      }
    };

    initializeService();
  }, []);

  // Capture screen and detect champions
  const captureAndDetect = async () => {
    try {
      setIsDetecting(true);
      setError(null);
      
      // Capture the screen
      const captureResult = await window.electron.captureScreen();
      
      if (captureResult.success && captureResult.data) {
        setScreenshot(captureResult.data);
        
        // Detect champions
        const detectionResult = await championDetectionService.detectChampions(captureResult.data);
        
        setDetectedChampions(detectionResult.champions);
        setConfidence(detectionResult.confidence);
        setProcessingTime(detectionResult.processingTime);
      } else {
        setError(captureResult.message || 'Failed to capture screen');
      }
    } catch (err) {
      setError(`Error during detection: ${err}`);
    } finally {
      setIsDetecting(false);
    }
  };

  // Use mock data for testing
  const useMockData = () => {
    try {
      setIsDetecting(true);
      setError(null);
      
      // Get mock detection result
      const mockResult = championDetectionService.getMockDetectionResult();
      
      setDetectedChampions(mockResult.champions);
      setConfidence(mockResult.confidence);
      setProcessingTime(mockResult.processingTime);
      
      // Create a mock screenshot (just a colored rectangle)
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.fillRect(100, 100, 600, 400);
        setScreenshot(canvas.toDataURL());
      }
    } catch (err) {
      setError(`Error using mock data: ${err}`);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="champion-detection-test">
      <h2>Champion Detection Test</h2>
      
      <div className="controls">
        <button 
          onClick={captureAndDetect} 
          disabled={isDetecting}
        >
          {isDetecting ? 'Detecting...' : 'Capture Screen & Detect Champions'}
        </button>
        
        <button 
          onClick={useMockData} 
          disabled={isDetecting}
        >
          Use Mock Data
        </button>
      </div>
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}
      
      {screenshot && (
        <div className="screenshot">
          <h3>Screenshot</h3>
          <img 
            src={screenshot} 
            alt="Screen capture" 
            style={{ maxWidth: '100%', maxHeight: '300px' }} 
          />
        </div>
      )}
      
      <div className="detection-results">
        <h3>Detection Results</h3>
        
        {detectedChampions.length > 0 ? (
          <>
            <p>
              Detected {detectedChampions.length} champions with 
              {confidence > 0 ? ` ${(confidence * 100).toFixed(1)}% confidence` : ' unknown confidence'}
            </p>
            <p>Processing time: {processingTime.toFixed(2)}ms</p>
            
            <h4>Board Champions</h4>
            <div className="champions-grid">
              {detectedChampions
                .filter(champion => champion.position !== undefined)
                .map(champion => (
                  <div key={champion.id} className="champion-card">
                    <h5>{champion.name} ({champion.stars}★)</h5>
                    <p>Cost: {champion.cost}</p>
                    <p>Traits: {champion.traits?.join(', ')}</p>
                    {champion.position && (
                      <p>Position: Row {champion.position.row}, Col {champion.position.col}</p>
                    )}
                  </div>
                ))}
            </div>
            
            <h4>Bench Champions</h4>
            <div className="champions-grid">
              {detectedChampions
                .filter(champion => champion.position === undefined)
                .map(champion => (
                  <div key={champion.id} className="champion-card">
                    <h5>{champion.name} ({champion.stars}★)</h5>
                    <p>Cost: {champion.cost}</p>
                    <p>Traits: {champion.traits?.join(', ')}</p>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <p>No champions detected yet. Capture a screenshot or use mock data.</p>
        )}
      </div>
      
      <style jsx>{`
        .champion-detection-test {
          padding: 20px;
        }
        
        .controls {
          margin-bottom: 20px;
        }
        
        button {
          margin-right: 10px;
          padding: 8px 16px;
          background-color: #4a4a4a;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background-color: #7a7a7a;
          cursor: not-allowed;
        }
        
        .error {
          color: #ff5555;
          margin: 10px 0;
          padding: 10px;
          background-color: rgba(255, 85, 85, 0.1);
          border-radius: 4px;
        }
        
        .screenshot {
          margin: 20px 0;
        }
        
        .champions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .champion-card {
          background-color: #2a2a2a;
          border-radius: 4px;
          padding: 10px;
        }
        
        h5 {
          margin-top: 0;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default ChampionDetectionTest;
