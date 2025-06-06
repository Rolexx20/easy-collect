
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
    </>
  );
};

export default AppSidebar;
