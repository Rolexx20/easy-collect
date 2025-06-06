
import { Moon, Sun, Globe, LanguagesIcon, MoonStar, Home, Users, FileText, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  language: string;
  setLanguage: (language: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const Header = ({
  isDark,
  setIsDark,
  language,
  setLanguage,
  activeTab,
  setActiveTab,
}: HeaderProps) => {
  const translations = {
    en: {
      title: "EasyCollect",
      dashboard: "Dashboard",
      borrowers: "Borrowers",
      loans: "Loans",
      reports: "Reports",
      settings: "Settings",
    },
    ta: {
      title: "EasyCollect",
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title - Left */}
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
                {t.title}
              </h1>
            </div>

            {/* Navigation - Center */}
            <nav className="hidden md:flex flex-1 justify-center items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Toggles - Right */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Theme Toggle */}
              <div
                onClick={() => setIsDark(!isDark)}
                className={cn(
                  "relative flex items-center border-2 w-14 h-7 p-0 rounded-full cursor-pointer transition-all duration-300",
                  isDark
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                    : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                )}
                aria-label="Toggle theme"
              >
                <div
                  className={cn(
                    "absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full transition-all duration-300 shadow-sm",
                    isDark ? "right-1 bg-gray-800" : "left-1 bg-white"
                  )}
                />

                <div className="relative z-10 flex items-center justify-center w-7 h-full">
                  <Sun
                    className={cn(
                      "w-3 h-3 transition-colors",
                      isDark ? "text-yellow-400" : "text-yellow-500"
                    )}
                  />
                </div>

                <div className="relative z-10 flex items-center justify-center w-7 h-full">
                  <MoonStar
                    className={cn(
                      "w-3 h-3 transition-colors",
                      isDark ? "text-gray-200" : "text-gray-600"
                    )}
                  />
                </div>
              </div>

              {/* Language Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                className={cn(
                  "flex items-center gap-2 border-2 rounded-full transition-all duration-300 hover:scale-105 h-7 px-3",
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    : "bg-gray-100 border-gray-300 text-blue-700 hover:bg-gray-200"
                )}
              >
                {language === "en" ? (
                  <>
                    <LanguagesIcon className="w-3 h-3" />
                    <span className="text-xs font-medium">த</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3" />
                    <span className="text-xs font-medium">E</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-w-0 flex-1",
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;
