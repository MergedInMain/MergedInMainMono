import React, { useState, useEffect } from 'react';
import gameStateManager, { StateChangeType, StateChangeEvent } from '../services/game-state-manager';
import { GameState } from '../../shared/types';

/**
 * Component for testing game state manager functionality
 */
const GameStateManagerTest: React.FC = () => {
  const [currentState, setCurrentState] = useState<GameState | null>(null);
  const [stateHistory, setStateHistory] = useState<StateChangeEvent[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('gold');
  const [propertyValue, setPropertyValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize game state manager
  useEffect(() => {
    const initializeManager = async () => {
      try {
        setIsLoading(true);
        await gameStateManager.initialize();
        
        // Get initial state
        const initialState = gameStateManager.getCurrentState();
        setCurrentState(initialState);
        
        // Get state history
        const history = gameStateManager.getStateHistory();
        setStateHistory(history);
        
        // Add state change listener
        const removeListener = gameStateManager.addStateChangeListener((event) => {
          setCurrentState(event.state);
          setStateHistory(gameStateManager.getStateHistory());
        });
        
        // Clean up listener on unmount
        return () => removeListener();
      } catch (err) {
        setError(`Failed to initialize game state manager: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeManager();
  }, []);

  // Use mock data for testing
  const useMockData = () => {
    try {
      setIsLoading(true);
      
      // Get mock state
      const mockState = gameStateManager.getMockState();
      
      // Update state
      gameStateManager.updateState(mockState, 'mock');
    } catch (err) {
      setError(`Error using mock data: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state
  const resetState = () => {
    try {
      setIsLoading(true);
      gameStateManager.resetState();
    } catch (err) {
      setError(`Error resetting state: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Undo last state change
  const undoStateChange = () => {
    try {
      setIsLoading(true);
      gameStateManager.undoStateChange();
    } catch (err) {
      setError(`Error undoing state change: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update property
  const updateProperty = () => {
    try {
      setIsLoading(true);
      
      if (!selectedProperty || propertyValue === '') {
        setError('Please select a property and enter a value');
        setIsLoading(false);
        return;
      }
      
      // Parse value based on property type
      let parsedValue: any = propertyValue;
      
      if (selectedProperty === 'gold' || selectedProperty === 'level' || selectedProperty === 'health') {
        parsedValue = parseInt(propertyValue, 10);
        
        if (isNaN(parsedValue)) {
          setError(`Invalid number: ${propertyValue}`);
          setIsLoading(false);
          return;
        }
      }
      
      // Update property
      gameStateManager.setStateProperty(selectedProperty as keyof GameState, parsedValue);
      
      // Clear input
      setPropertyValue('');
    } catch (err) {
      setError(`Error updating property: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-state-manager-test">
      <h2>Game State Manager Test</h2>
      
      <div className="controls">
        <button 
          onClick={useMockData} 
          disabled={isLoading}
        >
          Use Mock Data
        </button>
        
        <button 
          onClick={resetState} 
          disabled={isLoading}
        >
          Reset State
        </button>
        
        <button 
          onClick={undoStateChange} 
          disabled={isLoading || stateHistory.length <= 1}
        >
          Undo Last Change
        </button>
      </div>
      
      <div className="property-editor">
        <h3>Update Property</h3>
        <div className="property-form">
          <select 
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            disabled={isLoading}
          >
            <option value="gold">Gold</option>
            <option value="level">Level</option>
            <option value="health">Health</option>
            <option value="stage">Stage</option>
          </select>
          
          <input 
            type="text"
            value={propertyValue}
            onChange={(e) => setPropertyValue(e.target.value)}
            placeholder={`Enter ${selectedProperty} value`}
            disabled={isLoading}
          />
          
          <button 
            onClick={updateProperty}
            disabled={isLoading || propertyValue === ''}
          >
            Update
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="state-display">
        <h3>Current State</h3>
        {currentState ? (
          <div className="state-grid">
            <div className="state-item">
              <h4>Stage</h4>
              <p>{currentState.stage || 'N/A'}</p>
            </div>
            
            <div className="state-item">
              <h4>Gold</h4>
              <p>{currentState.gold !== undefined ? currentState.gold : 'N/A'}</p>
            </div>
            
            <div className="state-item">
              <h4>Level</h4>
              <p>{currentState.level !== undefined ? currentState.level : 'N/A'}</p>
            </div>
            
            <div className="state-item">
              <h4>Health</h4>
              <p>{currentState.health !== undefined ? currentState.health : 'N/A'}</p>
            </div>
            
            <div className="state-item">
              <h4>Champions</h4>
              <p>{currentState.champions?.length || 0}</p>
            </div>
            
            <div className="state-item">
              <h4>Items</h4>
              <p>{currentState.items?.length || 0}</p>
            </div>
          </div>
        ) : (
          <p>No state available</p>
        )}
      </div>
      
      <div className="history-display">
        <h3>State History ({stateHistory.length})</h3>
        {stateHistory.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Source</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {stateHistory.map((event, index) => (
                <tr key={index} className={index === 0 ? 'current-state' : ''}>
                  <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                  <td>{event.type}</td>
                  <td>{event.source || 'N/A'}</td>
                  <td>
                    {event.changes 
                      ? Object.keys(event.changes).join(', ')
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No history available</p>
        )}
      </div>
      
      <style jsx>{`
        .game-state-manager-test {
          padding: 20px;
        }
        
        .controls {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }
        
        button {
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
        
        .property-editor {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #2a2a2a;
          border-radius: 4px;
        }
        
        .property-form {
          display: flex;
          gap: 10px;
        }
        
        select, input {
          padding: 8px;
          background-color: #3a3a3a;
          color: white;
          border: 1px solid #5a5a5a;
          border-radius: 4px;
        }
        
        .error {
          color: #ff5555;
          margin: 10px 0;
          padding: 10px;
          background-color: rgba(255, 85, 85, 0.1);
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error button {
          background-color: transparent;
          color: #ff5555;
          border: 1px solid #ff5555;
          padding: 4px 8px;
          font-size: 0.8em;
        }
        
        .state-display {
          margin-bottom: 20px;
        }
        
        .state-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 15px;
        }
        
        .state-item {
          background-color: #2a2a2a;
          border-radius: 4px;
          padding: 10px;
          text-align: center;
        }
        
        .state-item h4 {
          margin-top: 0;
          margin-bottom: 5px;
          font-size: 0.9em;
          color: #aaa;
        }
        
        .state-item p {
          margin: 0;
          font-size: 1.2em;
          font-weight: bold;
        }
        
        .history-display {
          margin-top: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #3a3a3a;
        }
        
        th {
          background-color: #2a2a2a;
        }
        
        tr.current-state {
          background-color: rgba(94, 106, 210, 0.2);
        }
      `}</style>
    </div>
  );
};

export default GameStateManagerTest;
