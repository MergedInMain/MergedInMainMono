import React, { useState, useEffect } from 'react';
import dataFetchingService, { DataSource, FetchOptions } from '../services/data-fetching-service';
import { TeamComp, Item, Augment } from '../../shared/types';

/**
 * Component for testing data fetching functionality
 */
const DataFetchingTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [teamComps, setTeamComps] = useState<TeamComp[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [augments, setAugments] = useState<Augment[]>([]);
  const [source, setSource] = useState<DataSource>(DataSource.COMBINED);
  const [patch, setPatch] = useState<string>('');
  const [fetchTimestamp, setFetchTimestamp] = useState<number>(0);

  /**
   * Fetch team compositions
   */
  const fetchTeamComps = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const options: FetchOptions = {
        source,
        patch: patch || undefined,
        forceRefresh: true
      };
      
      const result = await dataFetchingService.fetchTeamComps(options);
      
      setTeamComps(result.data);
      setFetchTimestamp(result.timestamp);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch items
   */
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const options: FetchOptions = {
        source,
        patch: patch || undefined,
        forceRefresh: true
      };
      
      const result = await dataFetchingService.fetchItems(options);
      
      setItems(result.data);
      setFetchTimestamp(result.timestamp);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch augments
   */
  const fetchAugments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const options: FetchOptions = {
        source,
        patch: patch || undefined,
        forceRefresh: true
      };
      
      const result = await dataFetchingService.fetchAugments(options);
      
      setAugments(result.data);
      setFetchTimestamp(result.timestamp);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch all data
   */
  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const options: FetchOptions = {
        source,
        patch: patch || undefined,
        forceRefresh: true
      };
      
      const [teamCompsResult, itemsResult, augmentsResult] = await Promise.all([
        dataFetchingService.fetchTeamComps(options),
        dataFetchingService.fetchItems(options),
        dataFetchingService.fetchAugments(options)
      ]);
      
      setTeamComps(teamCompsResult.data);
      setItems(itemsResult.data);
      setAugments(augmentsResult.data);
      setFetchTimestamp(Date.now());
      
      const errors = [
        teamCompsResult.error,
        itemsResult.error,
        augmentsResult.error
      ].filter(Boolean);
      
      if (errors.length > 0) {
        setError(errors.join(', '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="data-fetching-test">
      <h2>Data Fetching Test</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>
            Data Source:
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as DataSource)}
              disabled={isLoading}
            >
              <option value={DataSource.COMBINED}>Combined</option>
              <option value={DataSource.META_TFT}>Meta TFT</option>
              <option value={DataSource.TACTICS_TOOLS}>Tactics.Tools</option>
            </select>
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Patch:
            <input
              type="text"
              value={patch}
              onChange={(e) => setPatch(e.target.value)}
              placeholder="e.g., 13.10"
              disabled={isLoading}
            />
          </label>
        </div>
        
        <div className="button-group">
          <button onClick={fetchTeamComps} disabled={isLoading}>
            Fetch Team Comps
          </button>
          <button onClick={fetchItems} disabled={isLoading}>
            Fetch Items
          </button>
          <button onClick={fetchAugments} disabled={isLoading}>
            Fetch Augments
          </button>
          <button onClick={fetchAll} disabled={isLoading}>
            Fetch All
          </button>
        </div>
      </div>
      
      {isLoading && <div className="loading">Loading...</div>}
      
      {error && (
        <div className="error">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {fetchTimestamp > 0 && (
        <div className="timestamp">
          <p>Last fetch: {new Date(fetchTimestamp).toLocaleString()}</p>
        </div>
      )}
      
      <div className="results">
        <div className="result-section">
          <h3>Team Compositions ({teamComps.length})</h3>
          {teamComps.length > 0 ? (
            <ul>
              {teamComps.slice(0, 5).map((comp) => (
                <li key={comp.id}>
                  <strong>{comp.name}</strong> - Avg Placement: {comp.avgPlacement.toFixed(2)}
                  <br />
                  Units: {comp.units.map((unit) => unit.name).join(', ')}
                </li>
              ))}
              {teamComps.length > 5 && <li>...and {teamComps.length - 5} more</li>}
            </ul>
          ) : (
            <p>No team compositions fetched.</p>
          )}
        </div>
        
        <div className="result-section">
          <h3>Items ({items.length})</h3>
          {items.length > 0 ? (
            <ul>
              {items.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong>
                </li>
              ))}
              {items.length > 5 && <li>...and {items.length - 5} more</li>}
            </ul>
          ) : (
            <p>No items fetched.</p>
          )}
        </div>
        
        <div className="result-section">
          <h3>Augments ({augments.length})</h3>
          {augments.length > 0 ? (
            <ul>
              {augments.slice(0, 5).map((augment) => (
                <li key={augment.id}>
                  <strong>{augment.name}</strong> - Tier: {augment.tier}
                </li>
              ))}
              {augments.length > 5 && <li>...and {augments.length - 5} more</li>}
            </ul>
          ) : (
            <p>No augments fetched.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataFetchingTest;
