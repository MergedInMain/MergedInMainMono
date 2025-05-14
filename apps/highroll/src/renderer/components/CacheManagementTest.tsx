/**
 * Cache Management Test Component
 * 
 * A test component for verifying the functionality of the local data cache.
 */

import React, { useState, useEffect } from 'react';
import dataApi from '../services/data-api';
import cacheManagementService, { CacheStatus } from '../services/cache-management-service';
import { DataSource } from '../../shared/data-models';

/**
 * Cache management test component
 */
const CacheManagementTest: React.FC = () => {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<DataSource>(DataSource.COMBINED);
  const [selectedPatch, setSelectedPatch] = useState<string>('');
  const [availablePatches, setAvailablePatches] = useState<string[]>([]);

  // Initialize the component
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize the data API
        await dataApi.initialize();
        
        // Get the cache status
        const status = await cacheManagementService.getCacheStatus();
        setCacheStatus(status);
        
        // Get available patches
        const patches = await cacheManagementService.getAvailablePatches();
        setAvailablePatches(patches);
        
        // Set the current patch
        const currentPatch = dataApi.getCurrentPatch();
        if (currentPatch) {
          setSelectedPatch(currentPatch);
        }
      } catch (error) {
        console.error('Error initializing cache management test:', error);
        setMessage('Error initializing cache management test');
      }
    };
    
    initialize();
  }, []);

  /**
   * Refresh the cache status
   */
  const refreshCacheStatus = async () => {
    try {
      const status = await cacheManagementService.getCacheStatus(selectedPatch || undefined);
      setCacheStatus(status);
      setMessage('Cache status refreshed');
    } catch (error) {
      console.error('Error refreshing cache status:', error);
      setMessage('Error refreshing cache status');
    }
  };

  /**
   * Fetch data from external APIs
   */
  const fetchData = async () => {
    setIsLoading(true);
    setMessage('Fetching data...');
    
    try {
      await dataApi.refreshData({
        source: selectedSource,
        patch: selectedPatch || undefined,
        forceRefresh: true
      });
      
      setMessage('Data fetched successfully');
      await refreshCacheStatus();
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear the cache
   */
  const clearCache = async () => {
    setIsLoading(true);
    setMessage('Clearing cache...');
    
    try {
      if (selectedPatch) {
        await dataApi.clearPatchCache(selectedPatch);
        setMessage(`Cache cleared for patch ${selectedPatch}`);
      } else {
        await dataApi.clearCache();
        setMessage('All cache cleared');
      }
      
      await refreshCacheStatus();
    } catch (error) {
      console.error('Error clearing cache:', error);
      setMessage('Error clearing cache');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load data from cache
   */
  const loadFromCache = async () => {
    setIsLoading(true);
    setMessage('Loading data from cache...');
    
    try {
      const teamComps = await dataApi.getTeamComps({
        source: selectedSource,
        patch: selectedPatch || undefined,
        forceRefresh: false
      });
      
      const items = await dataApi.getItems({
        source: selectedSource,
        patch: selectedPatch || undefined,
        forceRefresh: false
      });
      
      const augments = await dataApi.getAugments({
        source: selectedSource,
        patch: selectedPatch || undefined,
        forceRefresh: false
      });
      
      setMessage(`Loaded from cache: ${teamComps.length} team comps, ${items.length} items, ${augments.length} augments`);
    } catch (error) {
      console.error('Error loading from cache:', error);
      setMessage('Error loading from cache');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if offline data is available
   */
  const checkOfflineData = async () => {
    try {
      const isAvailable = await dataApi.isOfflineDataAvailable(selectedPatch || undefined);
      setMessage(`Offline data ${isAvailable ? 'is' : 'is not'} available`);
    } catch (error) {
      console.error('Error checking offline data:', error);
      setMessage('Error checking offline data');
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Cache Management Test</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Cache Status</h3>
        {cacheStatus ? (
          <div className="bg-gray-700 p-3 rounded">
            <p>Available: {cacheStatus.isAvailable ? 'Yes' : 'No'}</p>
            {cacheStatus.lastUpdated && (
              <p>Last Updated: {new Date(cacheStatus.lastUpdated).toLocaleString()}</p>
            )}
            {cacheStatus.patch && <p>Patch: {cacheStatus.patch}</p>}
            {cacheStatus.version && <p>Version: {cacheStatus.version}</p>}
            <p>Data Types:</p>
            <ul className="list-disc pl-5">
              <li>Team Comps: {cacheStatus.dataTypes.teamComps ? 'Yes' : 'No'}</li>
              <li>Items: {cacheStatus.dataTypes.items ? 'Yes' : 'No'}</li>
              <li>Augments: {cacheStatus.dataTypes.augments ? 'Yes' : 'No'}</li>
              <li>Champions: {cacheStatus.dataTypes.champions ? 'Yes' : 'No'}</li>
              <li>Traits: {cacheStatus.dataTypes.traits ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        ) : (
          <p>No cache status available</p>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Options</h3>
        <div className="flex flex-col space-y-2">
          <div>
            <label className="mr-2">Data Source:</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as DataSource)}
              className="bg-gray-700 p-1 rounded"
            >
              <option value={DataSource.COMBINED}>Combined</option>
              <option value={DataSource.META_TFT}>Meta TFT</option>
              <option value={DataSource.TACTICS_TOOLS}>Tactics.Tools</option>
            </select>
          </div>
          
          <div>
            <label className="mr-2">Patch:</label>
            <select
              value={selectedPatch}
              onChange={(e) => setSelectedPatch(e.target.value)}
              className="bg-gray-700 p-1 rounded"
            >
              <option value="">Latest</option>
              {availablePatches.map((patch) => (
                <option key={patch} value={patch}>
                  {patch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded disabled:opacity-50"
          >
            Fetch Data
          </button>
          
          <button
            onClick={loadFromCache}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded disabled:opacity-50"
          >
            Load from Cache
          </button>
          
          <button
            onClick={clearCache}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded disabled:opacity-50"
          >
            Clear Cache
          </button>
          
          <button
            onClick={refreshCacheStatus}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded disabled:opacity-50"
          >
            Refresh Status
          </button>
          
          <button
            onClick={checkOfflineData}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded disabled:opacity-50"
          >
            Check Offline Data
          </button>
        </div>
      </div>
      
      {message && (
        <div className="mt-4 p-2 bg-gray-700 rounded">
          <p>{message}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-4 flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default CacheManagementTest;
