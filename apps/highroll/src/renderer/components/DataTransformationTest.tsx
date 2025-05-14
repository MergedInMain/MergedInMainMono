import React, { useState } from 'react';
import dataFetchingService, { DataSource, FetchOptions } from '../services/data-fetching-service';
import dataTransformationService from '../services/data-transformation-service';
import { TeamComp, Item, Augment } from '../../shared/types';
import { TransformationOptions } from '../../shared/data-models';

/**
 * Component for testing data transformation functionality
 */
const DataTransformationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [source, setSource] = useState<DataSource>(DataSource.META_TFT);
  const [dataType, setDataType] = useState<string>('teamComps');
  const [normalizeNames, setNormalizeNames] = useState<boolean>(true);
  const [validateData, setValidateData] = useState<boolean>(true);
  const [fetchTimestamp, setFetchTimestamp] = useState<number>(0);
  const [transformTimestamp, setTransformTimestamp] = useState<number>(0);

  /**
   * Fetch and transform data
   */
  const fetchAndTransform = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch data
      const fetchOptions: FetchOptions = {
        source,
        forceRefresh: true
      };
      
      let fetchResult;
      
      switch (dataType) {
        case 'teamComps':
          fetchResult = await dataFetchingService.fetchTeamComps(fetchOptions);
          break;
        case 'items':
          fetchResult = await dataFetchingService.fetchItems(fetchOptions);
          break;
        case 'augments':
          fetchResult = await dataFetchingService.fetchAugments(fetchOptions);
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      setRawData(fetchResult.data);
      setFetchTimestamp(fetchResult.timestamp);
      
      if (fetchResult.error) {
        setError(fetchResult.error);
        setIsLoading(false);
        return;
      }
      
      // Transform data
      const transformOptions: TransformationOptions = {
        source: fetchResult.source,
        normalizeNames,
        validateData
      };
      
      let transformedResult;
      
      switch (dataType) {
        case 'teamComps':
          if (source === DataSource.META_TFT) {
            const metaTftData = { 
              comps: fetchResult.data, 
              patch: fetchResult.patch || '', 
              updatedAt: new Date(fetchResult.timestamp).toISOString() 
            };
            transformedResult = dataTransformationService.transformMetaTftTeamComps(
              metaTftData,
              transformOptions
            );
          } else if (source === DataSource.TACTICS_TOOLS) {
            const tacticsToolsData = { 
              comps: fetchResult.data, 
              patch: fetchResult.patch || '', 
              updatedAt: new Date(fetchResult.timestamp).toISOString() 
            };
            transformedResult = dataTransformationService.transformTacticsToolsTeamComps(
              tacticsToolsData,
              transformOptions
            );
          }
          break;
        case 'items':
          if (source === DataSource.META_TFT) {
            const metaTftData = { 
              items: fetchResult.data, 
              patch: fetchResult.patch || '', 
              updatedAt: new Date(fetchResult.timestamp).toISOString() 
            };
            transformedResult = dataTransformationService.transformMetaTftItems(
              metaTftData,
              transformOptions
            );
          } else if (source === DataSource.TACTICS_TOOLS) {
            const tacticsToolsData = { 
              items: fetchResult.data, 
              patch: fetchResult.patch || '', 
              updatedAt: new Date(fetchResult.timestamp).toISOString() 
            };
            transformedResult = dataTransformationService.transformTacticsToolsItems(
              tacticsToolsData,
              transformOptions
            );
          }
          break;
        case 'augments':
          if (source === DataSource.META_TFT) {
            const metaTftData = { 
              augments: fetchResult.data, 
              patch: fetchResult.patch || '', 
              updatedAt: new Date(fetchResult.timestamp).toISOString() 
            };
            transformedResult = dataTransformationService.transformMetaTftAugments(
              metaTftData,
              transformOptions
            );
          } else if (source === DataSource.TACTICS_TOOLS) {
            const tacticsToolsData = { 
              augments: fetchResult.data, 
              patch: fetchResult.patch || '', 
              updatedAt: new Date(fetchResult.timestamp).toISOString() 
            };
            transformedResult = dataTransformationService.transformTacticsToolsAugments(
              tacticsToolsData,
              transformOptions
            );
          }
          break;
      }
      
      if (transformedResult) {
        setTransformedData(transformedResult.data);
        setTransformTimestamp(Date.now());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="data-transformation-test">
      <h2>Data Transformation Test</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>
            Data Source:
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as DataSource)}
              disabled={isLoading}
            >
              <option value={DataSource.META_TFT}>Meta TFT</option>
              <option value={DataSource.TACTICS_TOOLS}>Tactics.Tools</option>
            </select>
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Data Type:
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              disabled={isLoading}
            >
              <option value="teamComps">Team Compositions</option>
              <option value="items">Items</option>
              <option value="augments">Augments</option>
            </select>
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={normalizeNames}
              onChange={(e) => setNormalizeNames(e.target.checked)}
              disabled={isLoading}
            />
            Normalize Names
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={validateData}
              onChange={(e) => setValidateData(e.target.checked)}
              disabled={isLoading}
            />
            Validate Data
          </label>
        </div>
        
        <div className="button-group">
          <button onClick={fetchAndTransform} disabled={isLoading}>
            Fetch and Transform
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
      
      <div className="timestamps">
        {fetchTimestamp > 0 && (
          <p>Fetch: {new Date(fetchTimestamp).toLocaleString()}</p>
        )}
        {transformTimestamp > 0 && (
          <p>Transform: {new Date(transformTimestamp).toLocaleString()}</p>
        )}
      </div>
      
      <div className="results">
        <div className="result-section">
          <h3>Raw Data ({rawData.length})</h3>
          <pre className="data-preview">
            {JSON.stringify(rawData.slice(0, 1), null, 2)}
          </pre>
        </div>
        
        <div className="result-section">
          <h3>Transformed Data ({transformedData.length})</h3>
          <pre className="data-preview">
            {JSON.stringify(transformedData.slice(0, 1), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DataTransformationTest;
