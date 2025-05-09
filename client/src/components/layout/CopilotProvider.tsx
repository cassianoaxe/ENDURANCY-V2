import React, { createContext, useContext, useState, useEffect } from 'react';
import Copilot from '@/components/copilot/Copilot';
import CopilotButton from '@/components/copilot/CopilotButton';

interface CopilotContextType {
  isOpen: boolean;
  openCopilot: () => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;
}

const CopilotContext = createContext<CopilotContextType | null>(null);

export const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot deve ser usado dentro de um CopilotProvider');
  }
  return context;
};

export default function CopilotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCopilot = () => setIsOpen(true);
  const closeCopilot = () => setIsOpen(false);
  const toggleCopilot = () => setIsOpen(prev => !prev);

  // Ouvinte de tecla para abrir/fechar o Copilot com Ctrl+K ou Command+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCopilot();
      } else if (e.key === 'Escape' && isOpen) {
        closeCopilot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <CopilotContext.Provider value={{ isOpen, openCopilot, closeCopilot, toggleCopilot }}>
      {children}
      <Copilot isOpen={isOpen} onClose={closeCopilot} />
      <CopilotButton isOpen={isOpen} onClick={toggleCopilot} />
    </CopilotContext.Provider>
  );
}