import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { RootState } from '../store';
import {
  setOverlayOpacity,
  setOverlayPosition,
  setOverlaySize,
  setCaptureInterval,
  setDataRefreshInterval,
  setHotkeys,
} from '../store/settingsSlice';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  
  const [opacity, setOpacity] = useState(settings.overlayOpacity);
  const [position, setPosition] = useState(settings.overlayPosition);
  const [size, setSize] = useState(settings.overlaySize);
  const [captureInterval, setCaptureIntervalState] = useState(settings.captureInterval);
  const [dataRefreshInterval, setDataRefreshIntervalState] = useState(settings.dataRefreshInterval);
  const [hotkeys, setHotkeysState] = useState(settings.hotkeys);
  
  // Save settings
  const saveSettings = () => {
    // Update Redux state
    dispatch(setOverlayOpacity(opacity));
    dispatch(setOverlayPosition(position));
    dispatch(setOverlaySize(size));
    dispatch(setCaptureInterval(captureInterval));
    dispatch(setDataRefreshInterval(dataRefreshInterval));
    dispatch(setHotkeys(hotkeys));
    
    // Update overlay opacity via IPC
    ipcRenderer.invoke('set-overlay-opacity', opacity);
    
    // Update overlay position via IPC
    ipcRenderer.invoke('reposition-overlay', position);
    
    // Update overlay size via IPC
    ipcRenderer.invoke('resize-overlay', size);
    
    // Save to localStorage
    localStorage.setItem('settings', JSON.stringify({
      overlayOpacity: opacity,
      overlayPosition: position,
      overlaySize: size,
      captureInterval,
      dataRefreshInterval,
      hotkeys,
    }));
    
    onClose();
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    setOpacity(0.8);
    setPosition({ x: 0, y: 0 });
    setSize({ width: 400, height: 600 });
    setCaptureIntervalState(5000);
    setDataRefreshIntervalState(86400000);
    setHotkeysState({
      toggleOverlay: 'Alt+T',
      captureScreen: 'Alt+C',
    });
  };
  
  return (
    <div className="p-4 bg-gray-800 bg-opacity-90 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      
      <div className="space-y-4">
        {/* Overlay Opacity */}
        <div>
          <label className="block mb-1">Overlay Opacity</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full mr-2"
            />
            <span>{Math.round(opacity * 100)}%</span>
          </div>
        </div>
        
        {/* Overlay Position */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1">X Position</label>
            <input
              type="number"
              value={position.x}
              onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) })}
              className="w-full bg-gray-700 p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Y Position</label>
            <input
              type="number"
              value={position.y}
              onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) })}
              className="w-full bg-gray-700 p-2 rounded"
            />
          </div>
        </div>
        
        {/* Overlay Size */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1">Width</label>
            <input
              type="number"
              value={size.width}
              onChange={(e) => setSize({ ...size, width: parseInt(e.target.value) })}
              className="w-full bg-gray-700 p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Height</label>
            <input
              type="number"
              value={size.height}
              onChange={(e) => setSize({ ...size, height: parseInt(e.target.value) })}
              className="w-full bg-gray-700 p-2 rounded"
            />
          </div>
        </div>
        
        {/* Capture Interval */}
        <div>
          <label className="block mb-1">Capture Interval (ms)</label>
          <input
            type="number"
            value={captureInterval}
            onChange={(e) => setCaptureIntervalState(parseInt(e.target.value))}
            className="w-full bg-gray-700 p-2 rounded"
          />
        </div>
        
        {/* Data Refresh Interval */}
        <div>
          <label className="block mb-1">Data Refresh Interval (hours)</label>
          <input
            type="number"
            value={dataRefreshInterval / (60 * 60 * 1000)}
            onChange={(e) => setDataRefreshIntervalState(parseInt(e.target.value) * 60 * 60 * 1000)}
            className="w-full bg-gray-700 p-2 rounded"
          />
        </div>
        
        {/* Hotkeys */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1">Toggle Overlay</label>
            <input
              type="text"
              value={hotkeys.toggleOverlay}
              onChange={(e) => setHotkeysState({ ...hotkeys, toggleOverlay: e.target.value })}
              className="w-full bg-gray-700 p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Capture Screen</label>
            <input
              type="text"
              value={hotkeys.captureScreen}
              onChange={(e) => setHotkeysState({ ...hotkeys, captureScreen: e.target.value })}
              className="w-full bg-gray-700 p-2 rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={resetSettings}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Reset
        </button>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
