<<<<<<< HEAD
import { Moon, Sun, Globe, Menu, LanguagesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
=======
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37

import { Moon, Sun, Globe, LanguagesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  language: string;
  setLanguage: (language: string) => void;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
}

const Header = ({
  isDark,
  setIsDark,
  language,
  setLanguage,
<<<<<<< HEAD
  sidebarCollapsed,
  setSidebarCollapsed,
=======
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
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
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
<<<<<<< HEAD
          {setSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-500">
=======
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
            {t.title}
          </h1>
        </div>

<<<<<<< HEAD
        <div className="flex items-center gap-2">
=======
        <div className="flex items-center gap-3">
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          {/* Theme Toggle */}
<<<<<<< HEAD
          <div
            onClick={() => setIsDark(!isDark)}
            className={`relative flex items-center border-2 w-16 h-8 p-0 rounded-full cursor-pointer transition-colors ${
              isDark
                ? "bg-gray-700 text-white hover:bg-gray-500"
                : "bg-gray-200 text-gray-900 hover:bg-gray-100"
            }`}
            aria-label="Toggle theme"
          >
            {/* Circular knob for the selected side */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full transition-all ${
                isDark ? "right-1 bg-gray-800" : "left-1 bg-white"
              }`}
            ></div>

            {/* Sun Icon */}
            <div className="relative z-10 flex items-center justify-center w-8 h-full">
              <Sun
                className={`w-4 h-4 transition-colors ${
                  isDark ? "text-yellow-500" : "text-yellow-500"
                }`}
              />
            </div>

            {/* Moon Icon */}
            <div className="relative z-10 flex items-center justify-center w-8 h-full">
              <Moon
                className={`w-4 h-4 transition-colors ${
                  isDark ? "text-gray-200" : "text-gray-900"
                }`}
              />
            </div>
          </div>
          {/* Language Toggle */}
=======
          <div
            onClick={() => setIsDark(!isDark)}
            className={`relative flex items-center border-2 w-16 h-8 p-0 rounded-full cursor-pointer transition-all duration-300 ${
              isDark
                ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
            }`}
            aria-label="Toggle theme"
          >
            {/* Circular knob for the selected side */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full transition-all duration-300 shadow-sm ${
                isDark ? "right-1 bg-gray-800" : "left-1 bg-white"
              }`}
            ></div>

            {/* Sun Icon */}
            <div className="relative z-10 flex items-center justify-center w-8 h-full">
              <Sun
                className={`w-4 h-4 transition-colors ${
                  isDark ? "text-yellow-400" : "text-yellow-500"
                }`}
              />
            </div>

            {/* Moon Icon */}
            <div className="relative z-10 flex items-center justify-center w-8 h-full">
              <Moon
                className={`w-4 h-4 transition-colors ${
                  isDark ? "text-gray-200" : "text-gray-600"
                }`}
              />
            </div>
          </div>

          {/* Language Toggle */}
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          <Button
            variant="outline"
<<<<<<< HEAD
            size="sm"
            onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            className={cn(
              "flex items-center gap-2 border-2 rounded-3xl transition-colors hover:bg-gray-300 h-8",
              isDark
                ? "bg-gray-700 text-white hover:bg-gray-500"
                : "bg-gray-200 text-blue-700 hover:bg-gray-100"
            )}
=======
            size="sm"
            onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            className={cn(
              "flex items-center gap-2 border-2 rounded-full transition-all duration-300 hover:scale-105 h-8 px-3",
              isDark
                ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                : "bg-gray-100 border-gray-300 text-blue-700 hover:bg-gray-200"
            )}
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          >
<<<<<<< HEAD
            {language === "en" ? (
              <>
                <LanguagesIcon className="w-4 h-4" />த
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />E
              </>
            )}
=======
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
>>>>>>> 3f211891e5aae302ccc836c34e221241c5a0cf37
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
