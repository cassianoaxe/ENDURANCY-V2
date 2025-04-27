import { useState, useEffect, createContext, useContext } from 'react';
import CopilotButton from '../copilot/CopilotButton';
import Copilot from '../copilot/Copilot';

interface CopilotContextType {
  isOpen: boolean;
  openCopilot: () => void;
  closeCopilot: () => void;
  toggleCopilot: () => void;
}

const CopilotContext = createContext<CopilotContextType>({
  isOpen: false,
  openCopilot: () => {},
  closeCopilot: () => {},
  toggleCopilot: () => {},
});

export const useCopilot = () => useContext(CopilotContext);

export default function CopilotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const openCopilot = () => setIsOpen(true);
  const closeCopilot = () => setIsOpen(false);
  const toggleCopilot = () => setIsOpen(prev => !prev);
  
  // Fecha o copilot quando o usuário pressiona a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCopilot();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <CopilotContext.Provider value={{ isOpen, openCopilot, closeCopilot, toggleCopilot }}>
      {children}
      <CopilotButton onClick={toggleCopilot} isOpen={isOpen} />
      <Copilot isOpen={isOpen} onClose={closeCopilot} />
    </CopilotContext.Provider>
  );
}