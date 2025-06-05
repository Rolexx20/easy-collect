import { Home, Users, FileText, BarChart3, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

<<<<<<< HEAD
=======
import { Home, Users, FileText, BarChart3, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
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
<<<<<<< HEAD
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-white text-black dark:bg-slate-800 dark:text-white z-50 transition-all duration-300 flex flex-col hidden md:block", // Hide on mobile screens
          isCollapsed ? "w-16 md:w-16" : "w-64 md:w-64",
          "md:relative md:z-auto"
        )}
      >
=======
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-50 transition-all duration-300 flex flex-col hidden md:block shadow-lg",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
        {/* Header */}
<<<<<<< HEAD
        <div className="flex items-center py-4 border-gray-700 dark:border-slate-600">
=======
        <div className={cn(
          "flex items-center border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900",
          isCollapsed ? "p-4 justify-center" : "p-6"
        )}>
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
<<<<<<< HEAD
            className="text-black hover:bg-gray-200 dark:hover:bg-slate-700"
=======
            className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-slate-700 rounded-lg"
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          >
            <Menu className="w-5 h-5" />
          </Button>
          {!isCollapsed && (
<<<<<<< HEAD
            <h1 className="ml-2 text-xl font-bold text-blue-600 dark:text-blue-500">
              {t.appName}
            </h1>
=======
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.appName}
            </h1>
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          )}
        </div>

        {/* Navigation */}
<<<<<<< HEAD
        <nav className="flex-1 py-14 bg-white dark:bg-slate-900 overflow-y-auto">
=======
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
<<<<<<< HEAD
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-200 dark:hover:bg-slate-700 transition-colors",
                activeTab === item.id
                  ? "bg-blue-600/50 dark:bg-gray-500/50 border-r-4 border-blue-400 dark:border-gray-500"
                  : "text-black dark:text-white ",
                isCollapsed ? "justify-center" : ""
=======
                "w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-all duration-200 group",
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400",
                isCollapsed ? "justify-center px-3" : ""
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
              )}
            >
<<<<<<< HEAD
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  activeTab === item.id
                    ? "text-black dark:text-white"
                    : "text-black dark:text-slate-400"
                )}
              />
=======
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  activeTab === item.id
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                )}
              />
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
              {!isCollapsed && (
<<<<<<< HEAD
                <span className="font-medium text-black dark:text-white">
                  {item.label}
                </span>
=======
                <span className={cn(
                  "font-medium transition-colors",
                  activeTab === item.id
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                )}>
                  {item.label}
                </span>
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
<<<<<<< HEAD
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white text-black border-gray-300 dark:bg-slate-800 border-t dark:border-slate-700 z-30">
        <div className="flex items-center justify-around py-2">
=======
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 z-30 shadow-lg">
        <div className="flex items-center justify-around py-2 px-1">
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
<<<<<<< HEAD
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                activeTab === item.id
                  ? "text-black dark:text-white dark:bg-gray-50/10 shadow-md font-medium"
                  : "dark:text-gray-100 hover:bg-blue-200/90 dark:hover:bg-gray-900 hover:text-white"
=======
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 min-w-0 flex-1",
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
              )}
            >
<<<<<<< HEAD
              <item.icon
                className={cn(
                  "w-6 h-6",
                  activeTab === item.id
                    ? "text-black dark:text-white"
                    : "text-gray-600 dark:text-slate-400"
                )}
              />
=======
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  activeTab === item.id
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400"
                )}
              />
              <span className={cn(
                "text-xs font-medium truncate transition-colors",
                activeTab === item.id
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400"
              )}>
                {item.label}
              </span>
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
