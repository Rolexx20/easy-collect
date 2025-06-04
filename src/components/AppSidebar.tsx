import { Home, Users, FileText, BarChart3, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const AppSidebar = ({
  activeTab,
  setActiveTab,
  language,
  isCollapsed,
  setIsCollapsed,
}: AppSidebarProps) => {
  const translations = {
    en: {
      appName: "EasyCollect",
      dashboard: "Dashboard",
      borrowers: "Borrowers",
      loans: "Loans",
      reports: "Reports",
      settings: "Settings",
    },
    ta: {
      appName: "EasyCollect",
      dashboard: "டாஷ்போர்டு",
      borrowers: "கடன் வாங்குபவர்கள்",
      loans: "கடன்கள்",
      reports: "அறிக்கைகள்",
      settings: "அமைப்புகள்",
    },
  };

  const t = translations[language as keyof typeof translations];

  const navItems = [
    { id: "dashboard", label: t.dashboard, icon: Home },
    { id: "borrowers", label: t.borrowers, icon: Users },
    { id: "loans", label: t.loans, icon: FileText },
    { id: "reports", label: t.reports, icon: BarChart3 },
    { id: "settings", label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-white text-black dark:bg-slate-800 dark:text-white z-50 transition-all duration-300 flex flex-col hidden md:block", // Hide on mobile screens
          isCollapsed ? "w-16 md:w-16" : "w-64 md:w-64",
          "md:relative md:z-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center py-4 border-gray-700 dark:border-slate-600">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-black hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            <Menu className="w-5 h-5" />
          </Button>
          {!isCollapsed && (
            <h1 className="ml-2 text-xl font-bold text-blue-600 dark:text-blue-500">
              {t.appName}
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-14 bg-white dark:bg-slate-900 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-200 dark:hover:bg-slate-700 transition-colors",
                activeTab === item.id
                  ? "bg-blue-600/50 dark:bg-gray-500/50 border-r-4 border-blue-400 dark:border-gray-500"
                  : "text-black dark:text-white ",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  activeTab === item.id
                    ? "text-black dark:text-white"
                    : "text-black dark:text-slate-400"
                )}
              />
              {!isCollapsed && (
                <span className="font-medium text-black dark:text-white">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white text-black border-gray-300 dark:bg-slate-800 border-t dark:border-slate-700 z-30">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                activeTab === item.id
                  ? "text-black dark:text-white dark:bg-gray-50/10 shadow-md font-medium"
                  : "dark:text-gray-100 hover:bg-blue-200/90 dark:hover:bg-gray-900 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6",
                  activeTab === item.id
                    ? "text-black dark:text-white"
                    : "text-gray-600 dark:text-slate-400"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
