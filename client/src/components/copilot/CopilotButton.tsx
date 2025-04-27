import { useState, useEffect } from 'react';
import { MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CopilotButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function CopilotButton({ onClick, isOpen }: CopilotButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pulse, setPulse] = useState(false);

  // Pulsar para chamar atenção do usuário ocasionalmente
  useEffect(() => {
    if (!isOpen) {
      const pulsarInterval = setInterval(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 2000);
      }, 60000); // Pulsar a cada 1 minuto
      
      return () => clearInterval(pulsarInterval);
    }
  }, [isOpen]);

  // Efeito inicial de pulsar após 5 segundos da primeira carga
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        size="lg"
        className={`rounded-full h-14 w-14 shadow-lg flex items-center justify-center transition-all duration-300 ${
          pulse ? 'scale-110 bg-green-600' : 'bg-primary'
        } ${isOpen ? 'rotate-90' : ''}`}
        aria-label="Endurancy Copilot"
      >
        <MessageSquareText size={24} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );
}