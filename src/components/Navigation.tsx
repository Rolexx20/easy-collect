
import { Home, Users, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string;
}

const Navigation = ({ activeTab, setActiveTab, language }: NavigationProps) => {
  const translations = {
    en: {
      dashboard: 'Dashboard',
      borrowers: 'Borrowers', 
      loans: 'Loans',
      reports: 'Reports'
    },
    ta: {
      dashboard: 'டாஷ்போர்டு',
      borrowers: 'கடன் வாங்குபவர்கள்',
      loans: 'கடன்கள்',
      reports: 'அறிக்கைகள்'
    }
  };

  const t = translations[language as keyof typeof translations];

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'borrowers', label: t.borrowers, icon: Users },
    { id: 'loans', label: t.loans, icon: FileText },
    { id: 'reports', label: t.reports, icon: BarChart3 },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex justify-center max-w-7xl mx-auto">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => setActiveTab(item.id)}
              className="flex items-center gap-2 px-4 py-2"
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
