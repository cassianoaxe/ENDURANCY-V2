import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";

interface MenuItemProps {
  item: {
    title: string;
    path: string;
    active: boolean;
    isSubmenu?: boolean;
    icon: React.ReactNode;
    subItems?: {
      title: string;
      path: string;
      active: boolean;
      icon: React.ReactNode;
    }[];
  };
  expandedMenu: string | null;
  toggleSubmenu: (title: string, event: React.MouseEvent) => void;
  closeSubmenu: (event: React.MouseEvent) => void;
  navigateTo: (path: string, keepSubmenuOpen?: boolean) => void;
  openSubmenu: (title: string) => void;
  collapsed: boolean;
}

export const SidebarMenuItem: React.FC<MenuItemProps> = ({
  item,
  expandedMenu,
  toggleSubmenu,
  closeSubmenu,
  navigateTo,
  openSubmenu,
  collapsed
}) => {
  return (
    <div 
      className={cn(
        "relative sidebar-menu-item",
        item.active && "bg-green-50 dark:bg-green-900/30"
      )}
    >
      {!collapsed ? (
        <>
          <div 
            className={cn(
              "flex items-center justify-between px-4 py-2 cursor-pointer group",
              item.active 
                ? "text-green-600 dark:text-green-400 font-medium" 
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
            onClick={(e) => {
              console.log('Clicando em item:', item.title, 'isSubmenu:', !!item.isSubmenu);
              
              // Guarda a posição de rolagem atual
              const currentScroll = document.querySelector('.custom-scrollbar')?.scrollTop || 0;
              localStorage.setItem('sidebarScrollPos', currentScroll.toString());
              
              // Marca este elemento para manter em foco após a navegação
              e.currentTarget.setAttribute('data-last-clicked', 'true');
              
              if (item.isSubmenu) {
                toggleSubmenu(item.title, e);
              } else {
                navigateTo(item.path);
              }
            }}
          >
            <div className="flex items-center gap-2">
              {item.icon ? React.cloneElement(item.icon as React.ReactElement, { 
                className: item.active 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-500 dark:text-gray-400" 
              }) : null}
              <span className={cn(
                "text-sm", // Menor tamanho de fonte
                item.active && "font-medium" // Médio em vez de semibold
              )}>
                {item.title}
              </span>
            </div>
            {item.isSubmenu && (
              <div className="flex items-center gap-1">
                {expandedMenu === item.title && (
                  <X
                    size={14}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeSubmenu(e);
                    }}
                    aria-label="Fechar menu"
                  />
                )}
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform duration-200",
                    expandedMenu === item.title ? "transform rotate-180" : "",
                    item.active
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                  )}
                />
              </div>
            )}
          </div>
          
          {/* Renderização condicional do submenu */}
          {item.isSubmenu && expandedMenu === item.title && (
            <div className="pl-7 space-y-1 mt-1 mb-1 bg-gray-50 dark:bg-gray-800/30 py-1">
              {item.subItems?.map((subItem, subIndex) => (
                <div
                  key={`subitem-${subIndex}`}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm cursor-pointer rounded-md",
                    subItem.active
                      ? "text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  onClick={(e) => {
                    console.log('Clicando em subitem:', subItem.title);
                    // Antes de navegar, garantimos que o localStorage é atualizado
                    localStorage.setItem('expandedSubmenu', item.title);
                    
                    // Guarda a posição de rolagem atual
                    const currentScroll = document.querySelector('.custom-scrollbar')?.scrollTop || 0;
                    localStorage.setItem('sidebarScrollPos', currentScroll.toString());
                    
                    // Marca este elemento para manter em foco
                    e.currentTarget.setAttribute('data-last-clicked', 'true');
                    
                    // Navega para o caminho mantendo o submenu aberto
                    // Passamos true como segundo parâmetro para manter o submenu aberto
                    navigateTo(subItem.path, true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {subItem.icon ? React.cloneElement(subItem.icon as React.ReactElement, { 
                      className: subItem.active
                        ? "text-green-600 dark:text-green-400" 
                        : "text-gray-500 dark:text-gray-400"
                    }) : null}
                    <span className={cn(
                      "truncate", 
                      subItem.active && "font-medium"
                    )}>
                      {subItem.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div 
          className={cn(
            "flex items-center justify-center px-4 py-2 cursor-pointer",
            item.active 
              ? "text-green-600 dark:text-green-400 font-medium" 
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
          onClick={(e) => {
            console.log('Clicando em item (collapsed):', item.title);
            
            // Guarda a posição de rolagem atual
            const currentScroll = document.querySelector('.custom-scrollbar')?.scrollTop || 0;
            localStorage.setItem('sidebarScrollPos', currentScroll.toString());
            
            // Marca este elemento para manter em foco após a navegação
            e.currentTarget.setAttribute('data-last-clicked', 'true');
            
            if (item.isSubmenu) {
              toggleSubmenu(item.title, e);
            } else {
              navigateTo(item.path);
            }
          }}
          title={item.title}
        >
          {item.icon ? React.cloneElement(item.icon as React.ReactElement, { 
            size: 20,
            className: item.active 
              ? "text-green-600 dark:text-green-400" 
              : "text-gray-600 dark:text-gray-300" 
          }) : null}
        </div>
      )}
    </div>
  );
};