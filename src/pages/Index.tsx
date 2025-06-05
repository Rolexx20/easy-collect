
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import AppSidebar from '@/components/AppSidebar';
import Dashboard from '@/components/Dashboard';
import BorrowerManager from '@/components/BorrowerManager';
import LoanManager from '@/components/LoanManager';
import Reports from '@/components/Reports';
import Settings from '@/components/Settings';
import { getBorrowers, getLoans, getDashboardStats } from '@/lib/database';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch borrowers
  const { data: borrowers = [], isLoading: borrowersLoading } = useQuery({
    queryKey: ['borrowers'],
    queryFn: getBorrowers,
    onError: (error) => {
      console.error('Error loading borrowers:', error);
      toast({
        title: "Error loading borrowers",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  });

  // Fetch loans
  const { data: loans = [], isLoading: loansLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: getLoans,
    onError: (error) => {
      console.error('Error loading loans:', error);
      toast({
        title: "Error loading loans",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  });

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    onError: (error) => {
      console.error('Error loading dashboard stats:', error);
    }
  });

  // Refresh data function
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['borrowers'] });
    queryClient.invalidateQueries({ queryKey: ['loans'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle mobile sidebar auto-collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    if (borrowersLoading || loansLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} borrowers={borrowers} loans={loans} dashboardStats={dashboardStats} />;
      case 'borrowers':
        return <BorrowerManager language={language} borrowers={borrowers} onDataChange={refreshData} />;
      case 'loans':
        return <LoanManager language={language} loans={loans} borrowers={borrowers} onDataChange={refreshData} />;
      case 'reports':
        return <Reports language={language} borrowers={borrowers} loans={loans} />;
      case 'settings':
        return <Settings language={language} />;
      default:
        return <Dashboard language={language} borrowers={borrowers} loans={loans} dashboardStats={dashboardStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full flex">
      <AppSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col w-full md:w-auto">
        <Header 
          isDark={isDark} 
          setIsDark={setIsDark} 
          language={language} 
          setLanguage={setLanguage}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        
        <main className="flex-1 transition-colors duration-200 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
