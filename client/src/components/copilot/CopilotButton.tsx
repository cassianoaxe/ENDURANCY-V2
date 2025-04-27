import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopilotButtonProps {
  onClick: () => void;
  className?: string;
}

const CopilotButton: React.FC<CopilotButtonProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed right-6 bottom-6 flex items-center justify-center w-12 h-12 rounded-full bg-black shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 z-50",
        className
      )}
      aria-label="Abrir Endurancy Copilot"
    >
      <Sparkles className="text-white w-5 h-5" />
    </button>
  );
};

export default CopilotButton;