import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TabButton = ({ isActive, label, onClick }) => (
  <button 
    className={`tab-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
    style={{
      padding: '10px 15px',
      marginRight: '5px',
      background: isActive ? '#ffffff' : '#f0f0f0',
      border: '1px solid #ccc',
      borderBottom: isActive ? 'none' : '1px solid #ccc',
      borderRadius: '5px 5px 0 0',
      cursor: 'pointer'
    }}
  >
    {label}
  </button>
);

export const Tabs = ({ children, defaultActiveKey }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveKey);
  
  // Filter children to only include TabPane components
  const tabs = React.Children.toArray(children).filter(
    child => child.type === TabPane
  );

  return (
    <div className="tabs-container">
      <div className="tabs-header" style={{display: 'flex', borderBottom: '1px solid #ccc'}}>
        {tabs.map(tab => (
          <TabButton
            key={tab.props.tabKey}
            isActive={activeTab === tab.props.tabKey}
            label={tab.props.label}
            onClick={() => setActiveTab(tab.props.tabKey)}
          />
        ))}
      </div>
      <div className="tabs-content" style={{padding: '20px', border: '1px solid #ccc', borderTop: 'none'}}>
        {tabs.find(tab => tab.props.tabKey === activeTab)}
      </div>
    </div>
  );
};

export const TabPane = ({ children }) => {
  return <div className="tab-pane">{children}</div>;
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultActiveKey: PropTypes.string.isRequired
};

TabPane.propTypes = {
  children: PropTypes.node.isRequired,
  tabKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

export default { Tabs, TabPane };
