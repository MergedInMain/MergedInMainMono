import React from 'react';

/**
 * Dashboard component showing application status and overview
 */
const Dashboard = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      
      <div className="card">
        <h3 className="card-title">Application Status</h3>
        <p>HighRoll TFT Overlay is currently in development.</p>
        <p>Version: 0.1.0 (Alpha)</p>
      </div>
      
      <div className="card">
        <h3 className="card-title">Implementation Progress</h3>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Phase 1: Core Infrastructure</span>
            <span>In Progress</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            backgroundColor: '#3d3d3d',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: '20%', 
              height: '100%', 
              backgroundColor: '#0078d4' 
            }}></div>
          </div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Phase 2: Game State Detection</span>
            <span>Pending</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            backgroundColor: '#3d3d3d',
            borderRadius: '5px'
          }}></div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Phase 3: Recommendation Engine</span>
            <span>Pending</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            backgroundColor: '#3d3d3d',
            borderRadius: '5px'
          }}></div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Phase 4: UI Development</span>
            <span>Pending</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            backgroundColor: '#3d3d3d',
            borderRadius: '5px'
          }}></div>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Phase 5: Testing and Optimization</span>
            <span>Pending</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            backgroundColor: '#3d3d3d',
            borderRadius: '5px'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
