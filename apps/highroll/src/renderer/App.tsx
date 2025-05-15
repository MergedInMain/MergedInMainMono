import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { RootState } from './store';
import { setGameState } from './store/gameSlice';
import { setSettings } from './store/settingsSlice';
import { DEFAULT_SETTINGS } from '../shared/constants';
import { GameState } from '../shared/types';
import SettingsPanel from './components/SettingsPanel';
import TeamCompPanel from './components/TeamCompPanel';
import ItemBuilder from './components/ItemBuilder';
import AugmentAdvisor from './components/AugmentAdvisor';
import EconomyTracker from './components/EconomyTracker';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const settings = useSelector((state: RootState) => state.settings);
  const [activeTab, setActiveTab] = useState<string>('teamComp');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Initialize settings
  useEffect(() => {
    // Load settings from electron-store
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      dispatch(setSettings(JSON.parse(savedSettings)));
    } else {
      dispatch(setSettings(DEFAULT_SETTINGS));
    }
  }, [dispatch]);

  // Listen for game state updates from main process
  useEffect(() => {
    const handleGameStateUpdate = (_: any, newGameState: GameState) => {
      dispatch(setGameState(newGameState));
    };

    ipcRenderer.on('game-state-updated', handleGameStateUpdate);

    return () => {
      ipcRenderer.removeListener('game-state-updated', handleGameStateUpdate);
    };
  }, [dispatch]);

  // Toggle overlay visibility
  const toggleOverlay = () => {
    ipcRenderer.invoke('toggle-overlay', !settings.overlayVisible);
  };

  // Capture screen for analysis
  const captureScreen = async () => {
    const result = await ipcRenderer.invoke('capture-screen');
    if (result.success) {
      console.log('Screen captured:', result.imagePath);
      // Process the captured image
      // This would trigger the game state analysis
    } else {
      console.error('Screen capture failed:', result.error);
    }
  };

  return (
    <div 
      className="h-screen w-full bg-black bg-opacity-50 text-white overflow-hidden flex flex-col"
      style={{ opacity: settings.overlayOpacity }}
    >
      {/* Header/Drag Handle */}
      <div className="drag-handle flex justify-between items-center p-2 bg-gray-900 bg-opacity-80">
        <h1 className="text-lg font-bold">HighRoll TFT Overlay</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1 rounded hover:bg-gray-700"
          >
            ⚙️
          </button>
          <button 
            onClick={captureScreen}
            className="p-1 rounded hover:bg-gray-700"
          >
            📷
          </button>
          <button 
            onClick={toggleOverlay}
            className="p-1 rounded hover:bg-gray-700"
          >
            ✖️
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {isSettingsOpen ? (
          <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
              <button
                className={`px-4 py-2 ${activeTab === 'teamComp' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setActiveTab('teamComp')}
              >
                Team Comps
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'items' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setActiveTab('items')}
              >
                Items
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'augments' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setActiveTab('augments')}
              >
                Augments
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'economy' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setActiveTab('economy')}
              >
                Economy
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'teamComp' && <TeamCompPanel />}
              {activeTab === 'items' && <ItemBuilder />}
              {activeTab === 'augments' && <AugmentAdvisor />}
              {activeTab === 'economy' && <EconomyTracker />}
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-2 bg-gray-900 bg-opacity-80 text-xs">
        {gameState ? (
          <div className="flex justify-between">
            <span>Stage: {gameState.stage}</span>
            <span>Level: {gameState.playerLevel}</span>
            <span>Gold: {gameState.gold}</span>
            <span>Health: {gameState.playerHealth}</span>
          </div>
        ) : (
          <div className="text-center">Waiting for game data...</div>
        )}
      </div>
    </div>
  );
};

export default App;
