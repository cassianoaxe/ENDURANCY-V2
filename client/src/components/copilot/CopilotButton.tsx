import React from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopilotButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const CopilotButton: React.FC<CopilotButtonProps> = ({ isOpen, onClick }) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-5 right-5 h-12 w-12 rounded-full shadow-lg p-0 flex items-center justify-center transition-all duration-300 transform hover:scale-110",
        isOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
      )}
      aria-label={isOpen ? "Fechar Copilot" : "Abrir Copilot"}
    >
      <Bot className={cn(
        "h-6 w-6 text-white transition-transform duration-300",
        isOpen && "rotate-90"
      )} />
    </Button>
  );
};

export default CopilotButton;