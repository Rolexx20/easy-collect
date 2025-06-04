
import { Moon, Sun, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const Header = ({ isDark, setIsDark, language, setLanguage }: HeaderProps) => {
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const translations = {
    en: { title: 'EasyCollect' },
    ta: { title: 'ஈஸிகலெக்ட்' }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center flex-1">
          {translations[language as keyof typeof translations].title}
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="p-2"
          >
            <Languages className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
