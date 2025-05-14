import React, { useState, useEffect } from 'react';
import gameStateTrackingService, { GameStage, GameEvent } from '../services/game-state-tracking';

/**
 * Component for testing game state tracking functionality
 */
const GameStateTrackingTest: React.FC = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [stage, setStage] = useState<string>('');
  const [gameStage, setGameStage] = useState<GameStage>(GameStage.UNKNOWN);
  const [economy, setEconomy] = useState<{ gold: number; level: number; health: number; xp?: number; streak?: number }>({
    gold: 0,
    level: 1,
    health: 100
  });
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<Array<{
    timestamp: number;
    stage: string;
    gameStage: GameStage;
    events: GameEvent[];
  }>>([]);

  // Initialize game state tracking service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await gameStateTrackingService.initialize();
      } catch (err) {
        setError(`Failed to initialize game state tracking service: ${err}`);
      }
    };

    initializeService();
  }, []);

  // Capture screen and track game state
  const captureAndTrack = async () => {
    try {
      setIsTracking(true);
      setError(null);
      
      // Capture the screen
      const captureResult = await window.electron.captureScreen();
      
      if (captureResult.success && captureResult.data) {
        setScreenshot(captureResult.data);
        
        // Track game state
        const trackingResult = await gameStateTrackingService.trackGameState(captureResult.data);
        
        setStage(trackingResult.stage);
        setGameStage(trackingResult.gameStage);
        setEconomy(trackingResult.economy);
        setEvents(trackingResult.events);
        setConfidence(trackingResult.confidence);
        setProcessingTime(trackingResult.processingTime);
        
        // Add to tracking history
        setTrackingHistory(prev => [
          {
            timestamp: Date.now(),
            stage: trackingResult.stage,
            gameStage: trackingResult.gameStage,
            events: trackingResult.events
          },
          ...prev.slice(0, 9) // Keep only the last 10 entries
        ]);
      } else {
        setError(captureResult.message || 'Failed to capture screen');
      }
    } catch (err) {
      setError(`Error during tracking: ${err}`);
    } finally {
      setIsTracking(false);
    }
  };

  // Use mock data for testing
  const useMockData = () => {
    try {
      setIsTracking(true);
      setError(null);
      
      // Get mock tracking result
      const mockResult = gameStateTrackingService.getMockTrackingResult();
      
      setStage(mockResult.stage);
      setGameStage(mockResult.gameStage);
      setEconomy(mockResult.economy);
      setEvents(mockResult.events);
      setConfidence(mockResult.confidence);
      setProcessingTime(mockResult.processingTime);
      
      // Add to tracking history
      setTrackingHistory(prev => [
        {
          timestamp: Date.now(),
          stage: mockResult.stage,
          gameStage: mockResult.gameStage,
          events: mockResult.events
        },
        ...prev.slice(0, 9) // Keep only the last 10 entries
      ]);
      
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
      setIsTracking(false);
    }
  };

  // Reset tracking state
  const resetTracking = () => {
    gameStateTrackingService.resetState();
    setTrackingHistory([]);
    setEvents([]);
  };

  return (
    <div className="game-state-tracking-test">
      <h2>Game State Tracking Test</h2>
      
      <div className="controls">
        <button 
          onClick={captureAndTrack} 
          disabled={isTracking}
        >
          {isTracking ? 'Tracking...' : 'Capture Screen & Track Game State'}
        </button>
        
        <button 
          onClick={useMockData} 
          disabled={isTracking}
        >
          Use Mock Data
        </button>
        
        <button 
          onClick={resetTracking} 
          disabled={isTracking}
        >
          Reset Tracking
        </button>
      </div>
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}
      
      <div className="tracking-results">
        <div className="current-state">
          <h3>Current Game State</h3>
          
          {stage ? (
            <>
              <div className="state-grid">
                <div className="state-item">
                  <h4>Stage</h4>
                  <p>{stage}</p>
                </div>
                
                <div className="state-item">
                  <h4>Game Phase</h4>
                  <p>{gameStage}</p>
                </div>
                
                <div className="state-item">
                  <h4>Gold</h4>
                  <p>{economy.gold}</p>
                </div>
                
                <div className="state-item">
                  <h4>Level</h4>
                  <p>{economy.level}</p>
                </div>
                
                <div className="state-item">
                  <h4>Health</h4>
                  <p>{economy.health}</p>
                </div>
                
                {economy.xp !== undefined && (
                  <div className="state-item">
                    <h4>XP</h4>
                    <p>{economy.xp}</p>
                  </div>
                )}
                
                {economy.streak !== undefined && (
                  <div className="state-item">
                    <h4>Streak</h4>
                    <p>{economy.streak}</p>
                  </div>
                )}
              </div>
              
              <div className="events">
                <h4>Events</h4>
                {events.length > 0 ? (
                  <ul>
                    {events.map((event, index) => (
                      <li key={index}>{event}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No events detected</p>
                )}
              </div>
              
              <div className="meta">
                <p>
                  Confidence: {(confidence * 100).toFixed(1)}% | 
                  Processing time: {processingTime.toFixed(2)}ms
                </p>
              </div>
            </>
          ) : (
            <p>No game state tracked yet. Capture a screenshot or use mock data.</p>
          )}
        </div>
        
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
        
        {trackingHistory.length > 0 && (
          <div className="tracking-history">
            <h3>Tracking History</h3>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Stage</th>
                  <th>Game Phase</th>
                  <th>Events</th>
                </tr>
              </thead>
              <tbody>
                {trackingHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                    <td>{entry.stage}</td>
                    <td>{entry.gameStage}</td>
                    <td>{entry.events.length > 0 ? entry.events.join(', ') : 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .game-state-tracking-test {
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
        
        .tracking-results {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        .current-state {
          background-color: #2a2a2a;
          border-radius: 4px;
          padding: 15px;
        }
        
        .state-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .state-item {
          background-color: #3a3a3a;
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
        
        .events {
          margin-bottom: 15px;
        }
        
        .events ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .events li {
          background-color: #4a4a4a;
          border-radius: 4px;
          padding: 5px 10px;
          font-size: 0.9em;
        }
        
        .meta {
          font-size: 0.9em;
          color: #aaa;
        }
        
        .screenshot {
          margin-top: 20px;
        }
        
        .tracking-history {
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
        
        tr:nth-child(even) {
          background-color: #2a2a2a;
        }
      `}</style>
    </div>
  );
};

export default GameStateTrackingTest;
