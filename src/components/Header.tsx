import { Moon, Sun, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  sidebarCollapsed,
  setSidebarCollapsed
}: HeaderProps) => {
  const translations = {
    en: {
      title: 'EasyCollect',
      english: 'English',
      tamil: 'தமிழ்'
    },
    ta: {
      title: 'EasyCollect',
      english: 'English',
      tamil: 'தமிழ்'
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
            {t.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.english}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('ta')}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.tamil}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="relative overflow-hidden"
          >
            <Sun className={cn(
              "h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            )} />
            <Moon className={cn(
              "absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            )} />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
