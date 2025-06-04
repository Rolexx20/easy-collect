
import { useState } from 'react';
import { Home, Users, FileText, BarChart3, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const AppSidebar = ({ activeTab, setActiveTab, language, isCollapsed, setIsCollapsed }: AppSidebarProps) => {
  const translations = {
    en: {
      appName: 'EasyCollect',
      dashboard: 'Dashboard',
      borrowers: 'Borrowers',
      loans: 'Loans',
      reports: 'Reports',
      settings: 'Settings'
    },
    ta: {
      appName: 'EasyCollect',
      dashboard: 'டாஷ்போர்டு',
      borrowers: 'கடன் வாங்குபவர்கள்',
      loans: 'கடன்கள்',
      reports: 'அறிக்கைகள்',
      settings: 'அமைப்புகள்'
    }
  };

  const t = translations[language as keyof typeof translations];

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'borrowers', label: t.borrowers, icon: Users },
    { id: 'loans', label: t.loans, icon: FileText },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-slate-900 dark:bg-slate-800 text-white z-50 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16 md:w-16" : "w-64 md:w-64",
        "md:relative md:z-auto"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 dark:border-slate-600">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-slate-800 dark:hover:bg-slate-700"
          >
            <Menu className="w-5 h-5" />
          </Button>
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-blue-400 dark:text-blue-300">{t.appName}</h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors",
                activeTab === item.id ? "bg-blue-600 dark:bg-blue-500 border-r-4 border-blue-400 dark:border-blue-300" : "",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-800 border-t border-slate-700 dark:border-slate-600 z-30">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                activeTab === item.id 
                  ? "bg-blue-600 dark:bg-blue-500 text-white" 
                  : "text-slate-300 dark:text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-700"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
