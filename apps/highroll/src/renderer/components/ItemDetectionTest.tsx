import React, { useState, useEffect } from 'react';
import itemDetectionService from '../services/item-detection';
import championDetectionService from '../services/champion-detection';
import { Item, Champion } from '../../shared/types';

/**
 * Component for testing item detection functionality
 */
const ItemDetectionTest: React.FC = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<Item[]>([]);
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);
  const [championItems, setChampionItems] = useState<Map<string, Item[]>>(new Map());
  const [champions, setChampions] = useState<Champion[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await Promise.all([
          itemDetectionService.initialize(),
          championDetectionService.initialize()
        ]);
      } catch (err) {
        setError(`Failed to initialize detection services: ${err}`);
      }
    };

    initializeServices();
  }, []);

  // Capture screen and detect items
  const captureAndDetect = async () => {
    try {
      setIsDetecting(true);
      setError(null);
      
      // Capture the screen
      const captureResult = await window.electron.captureScreen();
      
      if (captureResult.success && captureResult.data) {
        setScreenshot(captureResult.data);
        
        // First detect champions
        const championResult = await championDetectionService.detectChampions(captureResult.data);
        setChampions(championResult.champions);
        
        // Then detect items
        const itemResult = await itemDetectionService.detectItems(
          captureResult.data,
          championResult.champions
        );
        
        setDetectedItems(itemResult.items);
        setInventoryItems(itemResult.inventoryItems);
        setChampionItems(itemResult.championItems);
        setConfidence(itemResult.confidence);
        setProcessingTime(itemResult.processingTime);
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
      
      // Get mock champion detection result
      const mockChampionResult = championDetectionService.getMockDetectionResult();
      setChampions(mockChampionResult.champions);
      
      // Get mock item detection result
      const mockItemResult = itemDetectionService.getMockDetectionResult();
      
      setDetectedItems(mockItemResult.items);
      setInventoryItems(mockItemResult.inventoryItems);
      setChampionItems(mockItemResult.championItems);
      setConfidence(mockItemResult.confidence);
      setProcessingTime(mockItemResult.processingTime);
      
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
    <div className="item-detection-test">
      <h2>Item Detection Test</h2>
      
      <div className="controls">
        <button 
          onClick={captureAndDetect} 
          disabled={isDetecting}
        >
          {isDetecting ? 'Detecting...' : 'Capture Screen & Detect Items'}
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
        
        {detectedItems.length > 0 ? (
          <>
            <p>
              Detected {detectedItems.length} items with 
              {confidence > 0 ? ` ${(confidence * 100).toFixed(1)}% confidence` : ' unknown confidence'}
            </p>
            <p>Processing time: {processingTime.toFixed(2)}ms</p>
            
            <h4>Inventory Items</h4>
            <div className="items-grid">
              {inventoryItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="item-card">
                  <h5>{item.name}</h5>
                  <p>{item.isComponent ? 'Component' : 'Combined'}</p>
                </div>
              ))}
            </div>
            
            <h4>Champions with Items</h4>
            <div className="champions-grid">
              {champions
                .filter(champion => {
                  const items = championItems.get(champion.id);
                  return items && items.length > 0;
                })
                .map(champion => (
                  <div key={champion.id} className="champion-card">
                    <h5>{champion.name} ({champion.stars}★)</h5>
                    <p>Items:</p>
                    <div className="champion-items">
                      {(championItems.get(champion.id) || []).map((item, index) => (
                        <div key={`${champion.id}-${item.id}-${index}`} className="item-badge">
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <p>No items detected yet. Capture a screenshot or use mock data.</p>
        )}
      </div>
      
      <style jsx>{`
        .item-detection-test {
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
        
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .champions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .item-card {
          background-color: #2a2a2a;
          border-radius: 4px;
          padding: 10px;
        }
        
        .champion-card {
          background-color: #2a2a2a;
          border-radius: 4px;
          padding: 10px;
        }
        
        .champion-items {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 5px;
        }
        
        .item-badge {
          background-color: #4a4a4a;
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 0.8em;
        }
        
        h5 {
          margin-top: 0;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default ItemDetectionTest;
