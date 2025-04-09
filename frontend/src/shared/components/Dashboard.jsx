import React, { useState } from 'react';
import ProjectList from './ProjectList';
import RuleList from './RuleList';
import FactList from './FactList';

const Dashboard = () => {
  const tabs = {
    projetos: 'Projetos',
    rules: 'Rules',
    fatos: 'Fatos',
  };

  const [activeTab, setActiveTab] = useState('projetos');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projetos':
        return <ProjectList />;
      case 'rules':
        return <RuleList />;
      case 'fatos':
        return <FactList />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard do Projeto</h1>
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
        {Object.entries(tabs).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '1rem',
              border: 'none',
              borderBottom: activeTab === key ? '2px solid blue' : 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === key ? 'bold' : 'normal',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default Dashboard;
