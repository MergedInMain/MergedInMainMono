/**
 * Example of how to use the TFT Composition Scraper service in the Highroll project
 */

import axios from 'axios';
import { TeamComposition } from '../src/models/types';

// Base URL for the API
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Fetch all team compositions
 * @param options Optional parameters for filtering and sorting
 * @returns Array of team compositions
 */
async function getTeamCompositions(options: {
  type?: string;
  minWinRate?: number;
  maxAvgPlace?: number;
  sortBy?: 'winRate' | 'avgPlace' | 'playRate' | 'top4';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
} = {}): Promise<TeamComposition[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/compositions`, {
      params: options
    });
    
    return response.data.compositions;
  } catch (error) {
    console.error('Error fetching team compositions:', error);
    return [];
  }
}

/**
 * Fetch a specific team composition by ID
 * @param id The composition ID
 * @returns The team composition or null if not found
 */
async function getTeamCompositionById(id: string): Promise<TeamComposition | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/compositions/${id}`);
    return response.data.composition;
  } catch (error) {
    console.error(`Error fetching composition ${id}:`, error);
    return null;
  }
}

/**
 * Search for team compositions by name or champion
 * @param query The search query
 * @returns Array of matching team compositions
 */
async function searchTeamCompositions(query: string): Promise<TeamComposition[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/compositions/search`, {
      params: { q: query }
    });
    
    return response.data.compositions;
  } catch (error) {
    console.error(`Error searching compositions for "${query}":`, error);
    return [];
  }
}

/**
 * Get the service status
 * @returns The service status information
 */
async function getServiceStatus(): Promise<{
  status: string;
  lastUpdate: string | null;
  patchVersion: string | null;
  compositionCount: number;
  nextScheduledRun: string | null;
}> {
  try {
    const response = await axios.get(`${API_BASE_URL}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service status:', error);
    return {
      status: 'unknown',
      lastUpdate: null,
      patchVersion: null,
      compositionCount: 0,
      nextScheduledRun: null
    };
  }
}

/**
 * Example usage in a React component
 */
/*
import React, { useState, useEffect } from 'react';
import { getTeamCompositions, TeamComposition } from './tftCompositionService';

const TeamCompositionList: React.FC = () => {
  const [compositions, setCompositions] = useState<TeamComposition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchCompositions() {
      try {
        setLoading(true);
        const data = await getTeamCompositions({
          sortBy: 'avgPlace',
          sortOrder: 'asc',
          limit: 10
        });
        
        setCompositions(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch team compositions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompositions();
  }, []);
  
  if (loading) {
    return <div>Loading team compositions...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div>
      <h2>Top TFT Team Compositions</h2>
      <div className="compositions-grid">
        {compositions.map(comp => (
          <div key={comp.id} className="composition-card">
            <h3>{comp.name}</h3>
            <div className="stats">
              <div>Avg Place: {comp.stats.averagePlacement.toFixed(2)}</div>
              <div>Win Rate: {comp.stats.winPercentage.toFixed(1)}%</div>
              <div>Top 4: {comp.stats.top4Percentage.toFixed(1)}%</div>
            </div>
            <div className="units">
              <h4>Core Units</h4>
              <div className="unit-list">
                {comp.units
                  .filter(unit => unit.isCore)
                  .map(unit => (
                    <div key={unit.name} className="unit">
                      <img 
                        src={`/images/champions/${unit.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`} 
                        alt={unit.name} 
                      />
                      <div className="star-level">{'★'.repeat(unit.starLevel)}</div>
                    </div>
                  ))
                }
              </div>
            </div>
            <a 
              href={comp.teamBuilderUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="team-builder-link"
            >
              Open in Team Builder
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamCompositionList;
*/

// Export the functions for use in the Highroll project
export {
  getTeamCompositions,
  getTeamCompositionById,
  searchTeamCompositions,
  getServiceStatus
};
