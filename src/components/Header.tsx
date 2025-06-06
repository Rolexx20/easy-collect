
import { Moon, Sun, Globe, LanguagesIcon, MoonStar } from "lucide-react";
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
}: HeaderProps) => {
  const translations = {
    en: {
      title: "EasyCollect",
    },
    ta: {
      title: "EasyCollect",
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
            {t.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div
            onClick={() => setIsDark(!isDark)}
            className={`relative flex items-center border-2 w-16 h-8 p-0 rounded-full cursor-pointer transition-all duration-300 ${
              isDark
                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
            }`}
            aria-label="Toggle theme"
          >
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full transition-all duration-300 shadow-sm ${
                isDark ? "right-1 bg-gray-800" : "left-1 bg-white"
              }`}
            ></div>

            <div className="relative z-10 flex items-center justify-center w-8 h-full">
              <Sun
                className={`w-4 h-4 transition-colors ${
                  isDark ? "text-yellow-400" : "text-yellow-500"
                }`}
              />
            </div>

            <div className="relative z-10 flex items-center justify-center w-8 h-full">
              <MoonStar
                className={`w-4 h-4 transition-colors ${
                  isDark ? "text-gray-200" : "text-gray-600"
                }`}
              />
            </div>
          </div>

          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            className={cn(
              "flex items-center gap-2 border-2 rounded-full transition-all duration-300 hover:scale-105 h-8 px-3",
              isDark
                ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                : "bg-gray-100 border-gray-300 text-blue-700 hover:bg-gray-200"
            )}
          >
            {language === "en" ? (
              <>
                <LanguagesIcon className="w-4 h-4" />
                <span className="text-sm font-medium">த</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">E</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
