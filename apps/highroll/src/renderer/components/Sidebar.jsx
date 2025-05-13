import React from 'react';

/**
 * Sidebar component for navigation
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.setActiveTab - Function to set the active tab
 */
const Sidebar = ({ activeTab, setActiveTab }) => {
  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'compositions', label: 'Team Compositions' },
    { id: 'items', label: 'Item Optimizer' },
    { id: 'augments', label: 'Augment Analysis' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="sidebar">
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {navItems.map(item => (
            <li key={item.id} style={{ marginBottom: '10px' }}>
              <button
                style={{
                  background: activeTab === item.id ? '#0078d4' : 'transparent',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
