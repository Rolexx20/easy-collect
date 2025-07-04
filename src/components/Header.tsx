import {
  Moon,
  Sun,
  Globe,
  LanguagesIcon,
  MoonStar,
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  Printer,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import { useState } from "react";
import { bluetoothPrinter } from "@/utils/bluetoothPrinter";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { User as UserIcon } from "lucide-react";

interface HeaderProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const Header = ({
  isDark,
  setIsDark,
  activeTab,
  setActiveTab,
}: HeaderProps) => {
  const { signOut, profile } = useAuth();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);
  // User profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleConnectPrinter = async () => {
    setIsPrinting(true);
    try {
      const connected = await bluetoothPrinter.connect();
      if (connected) {
        setPrinterConnected(true);
        toast({ title: "Printer Connected" });
      } else {
        toast({
          title: "Failed to connect printer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Printer connection error:", error);
      toast({
        title: "Failed to connect printer",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  // Helper to get first name or initials
  const getUserInitial = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts[0][0]?.toUpperCase() || "";
  };

  const translations = {
    en: {
      title: "EasyCollect",
      dashboard: "Dashboard",
      borrowers: "Borrowers",
      loans: "Loans",
      reports: "Reports",
      settings: "Settings",
      connectPrinter: "Connect",
      printerConnected: "Printer Connected",
      printerConnectionFailed: "Failed to connect printer",
    },
    ta: {
      title: "EasyCollect",
      dashboard: "டாஷ்போர்டு",
      borrowers: "கடன் வாங்குபவர்கள்",
      loans: "கடன்கள்",
      reports: "அறிக்கைகள்",
      settings: "அமைப்புகள்",
      connectPrinter: "இணைக்கவும்",
      printerConnected: "பிரிண்டர் இணைக்கப்பட்டது",
      printerConnectionFailed: "பிரிண்டர் இணைப்பு தோல்வி",
    },
  };

  const t = translations["en" as keyof typeof translations];

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
            {/* Logo and Title - Left */}
            <div className="flex items-center flex-shrink-0 relative">
              <img
                src={logo}
                alt="EasyCollect Logo"
                className="inline-block w-14 h-14 mr-0 mt-3 align-middle rounded self-center animate-logo-spin"
                style={{
                  verticalAlign: "middle",
                  filter: isDark
                    ? "drop-shadow(0 4px 12px rgba(0,0,0,0.18))"
                    : "drop-shadow(0 4px 12px rgba(0,0,0,0.28))",
                  transform: "rotate(-45deg)",
                }}
              />
              <h1
                className="text-xl sm:text-2xl font-bold tracking-tight self-center bg-clip-text text-transparent drop-shadow-lg"
                style={{
                  backgroundImage: isDark
                    ? "linear-gradient(45deg, #FFD700, #FDBD12, #FFEF8B, #FFD700)"
                    : "linear-gradient(-45deg, #B8860B, #FFD700, #B8860B, #FFD700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: isDark
                    ? "0 5px 16px rgba(253,215,85,0.28)"
                    : "0 5px 16px rgba(253,215,85,0.28)",
                }}
              >
                {t.title}
              </h1>
            </div>

            {/* Nav - Center */}
            <nav className="hidden md:flex flex-1 justify-center items-center space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 border-b-2",
                    activeTab === item.id
                      ? "border-blue-600 bg-gray-100 dark:bg-gray-700/50 text-blue-700 dark:text-white shadow-none dark:border-gray-200"
                      : "border-transparent text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-500"
                  )}
                  style={{
                    borderBottomWidth: "2px",
                  }}
                >
                  <item.icon className="w-5 h-5" />
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
                      isDark ? "text-gray-200" : "text-gray-800"
                    )}
                  />
                </div>
              </div>

              {/* User Profile Button with Icon and Dropdown */}
              {profile && (
                <div className="relative">
                  <button
                    className={cn(
                      "flex items-center gap-2 border-2 rounded-full transition-all duration-300 h-7 px-2 focus:outline-none",
                      isDark
                        ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                    )}
                    style={{
                      width: "auto",
                      minWidth: 0,
                      justifyContent: "flex-start",
                      paddingRight: "8px",
                      paddingLeft: "4px",
                    }}
                    onClick={() => setShowProfileMenu((v) => !v)}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs",
                        isDark
                          ? "bg-blue-900 text-blue-200"
                          : "bg-blue-200 text-blue-800"
                      )}
                    >
                      {getUserInitial(profile.name) || (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </span>
                    <span className="hidden sm:inline truncate max-w-[60px] text-left">{profile.name?.split(" ")[0]}</span>
                  </button>
                  {showProfileMenu && (
                    <div
                      className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                      onMouseLeave={() => setShowProfileMenu(false)}
                    >
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
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
                "flex items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 border-b-2",
                activeTab === item.id
                  ? "border-blue-600 bg-gray-100 dark:bg-gray-700/50 text-blue-700 dark:text-white shadow-none dark:border-gray-200"
                  : "border-transparent text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-500"
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
