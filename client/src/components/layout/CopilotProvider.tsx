import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import Copilot from '../copilot/Copilot';
import CopilotButton from '../copilot/CopilotButton';

interface CopilotContextType {
  isOpen: boolean;
  openCopilot: () => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
};

export default function CopilotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCopilot = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCopilot = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCopilot = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Keyboard shortcut to toggle Copilot (Ctrl/Cmd + Shift + E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl (Windows/Linux) or Command (Mac) + Shift + E is pressed
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'e') {
        e.preventDefault();
        toggleCopilot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleCopilot]);

  return (
    <CopilotContext.Provider value={{ isOpen, openCopilot, closeCopilot, toggleCopilot }}>
      {children}
      <CopilotButton isOpen={isOpen} onClick={toggleCopilot} />
      <Copilot isOpen={isOpen} onClose={closeCopilot} />
    </CopilotContext.Provider>
  );
}