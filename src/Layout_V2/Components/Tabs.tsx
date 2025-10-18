import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  variant = 'default',
  onChange
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const getTabClasses = (isActive: boolean, disabled?: boolean) => {
    if (disabled) {
      return 'cursor-not-allowed text-gray-400';
    }

    const baseClasses = 'transition-colors duration-200';

    switch (variant) {
      case 'pills':
        return `${baseClasses} px-4 py-2 rounded-lg ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`;
      case 'underline':
        return `${baseClasses} px-4 py-2 border-b-2 ${
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`;
      default:
        return `${baseClasses} px-4 py-2 border rounded-t-lg ${
          isActive
            ? 'bg-white border-gray-300 border-b-white text-blue-600'
            : 'bg-gray-50 border-transparent text-gray-600 hover:text-gray-900'
        }`;
    }
  };

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className={`flex gap-2 ${variant === 'underline' ? 'border-b border-gray-200' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center font-medium text-sm ${getTabClasses(
              activeTab === tab.id,
              tab.disabled
            )}`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeContent}
      </div>
    </div>
  );
};

