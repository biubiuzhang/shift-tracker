import { useState, useCallback } from 'react';
import { WeekView } from './views/WeekView';
import { DayDetail } from './views/DayDetail';
import { JobsView } from './views/JobsView';
import { PatternsView } from './views/PatternsView';
import { StatsView } from './views/StatsView';

type Tab = 'schedule' | 'jobs' | 'patterns' | 'stats';

interface DayDetailState {
  date: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [dayDetail, setDayDetail] = useState<DayDetailState | null>(null);

  const handleDayTap = useCallback((date: string) => {
    setDayDetail({ date });
  }, []);

  const handleBackFromDay = useCallback(() => {
    setDayDetail(null);
  }, []);

  const renderContent = () => {
    if (activeTab === 'schedule' && dayDetail) {
      return <DayDetail date={dayDetail.date} onBack={handleBackFromDay} />;
    }

    switch (activeTab) {
      case 'schedule':
        return <WeekView onDayTap={handleDayTap} />;
      case 'jobs':
        return <JobsView />;
      case 'patterns':
        return <PatternsView />;
      case 'stats':
        return <StatsView />;
    }
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === 'schedule') {
      setDayDetail(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {renderContent()}
      </div>
      <nav className="tab-bar">
        <button
          className={`tab-item ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => handleTabChange('schedule')}
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
          </svg>
          <span className="tab-label">排班表</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => handleTabChange('jobs')}
        >
          <svg viewBox="0 0 24 24">
            <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8-2h4v2h-4V4zM4 20V8h16v12H4z" />
          </svg>
          <span className="tab-label">工作</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => handleTabChange('patterns')}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
          </svg>
          <span className="tab-label">排班规律</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => handleTabChange('stats')}
        >
          <svg viewBox="0 0 24 24">
            <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
          </svg>
          <span className="tab-label">统计</span>
        </button>
      </nav>
    </div>
  );
}
