
import { Menu } from "lucide-react";
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
  language,
  isCollapsed,
  setIsCollapsed,
}: AppSidebarProps) => {
  const translations = {
    en: {
      appName: "EasyCollect",
    },
    ta: {
      appName: "EasyCollect",
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-40 transition-all duration-300 flex-col hidden md:block shadow-lg",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm",
          isCollapsed ? "p-3 justify-center" : "p-3"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
          {!isCollapsed && (
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.appName}
            </h1>
          )}
        </div>

        {/* Empty Content Area for future use */}
        <div className="flex-1 py-6 px-3">
          {/* Removed quick access panel content */}
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
