import React from "react";
import { Bell, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  // Update current path when URL changes
  React.useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return ['Início', ...parts].map((part) => 
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
    );
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-[240px] bg-white border-b z-10">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {getBreadcrumbs().map((crumb, index, array) => (
            <div key={index} className="flex items-center">
              <span>{crumb}</span>
              {index < array.length - 1 && (
                <span className="mx-2">/</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}