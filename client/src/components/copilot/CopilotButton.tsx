import React from 'react';
import { cn } from '@/lib/utils';
import { Bot, X } from 'lucide-react';

interface CopilotButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const CopilotButton: React.FC<CopilotButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      className={cn(
        "fixed z-50 bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 transform",
        isOpen 
          ? "bg-red-500 hover:bg-red-600 translate-x-0" 
          : "bg-green-600 hover:bg-green-700 translate-x-0"
      )}
      onClick={onClick}
      aria-label={isOpen ? "Fechar Copilot" : "Abrir Copilot"}
    >
      {isOpen ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <Bot className="h-6 w-6 text-white" />
      )}
      
      {/* Badge de notificação - comentar quando não quiser mostrar */}
      {!isOpen && (
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
      )}
    </button>
  );
};

export default CopilotButton;