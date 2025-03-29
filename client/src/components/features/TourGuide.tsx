import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// Custom hooks
import { useLocalStorage } from '@/hooks/use-local-storage';
import { HelpCircle } from 'lucide-react';

// Define the tour steps with the type derived from the package
type SpotlightStep = {
  selector: string;
  title: string;
  content: string;
  buttonText?: string;
  placementBeacon?: 'top' | 'right' | 'bottom' | 'left';
};

const dashboardTourSteps: SpotlightStep[] = [
  {
    selector: '.dashboard-stats',
    title: 'Dashboard Overview',
    content: 'Veja estatísticas e métricas importantes da sua plataforma em tempo real.',
    buttonText: 'Próximo',
    placementBeacon: 'top',
  },
  {
    selector: '.organizations-table',
    title: 'Lista de Organizações',
    content: 'Visualize e gerencie todas as organizações cadastradas na plataforma.',
    buttonText: 'Próximo',
    placementBeacon: 'top',
  },
  {
    selector: '.add-organization-button',
    title: 'Adicionar Organização',
    content: 'Clique aqui para adicionar uma nova organização ao sistema.',
    buttonText: 'Próximo',
    placementBeacon: 'bottom',
  },
  {
    selector: '.sidebar-nav',
    title: 'Menu de Navegação',
    content: 'Acesse todas as funcionalidades do sistema através deste menu.',
    buttonText: 'Próximo',
    placementBeacon: 'right',
  },
  {
    selector: '.user-profile',
    title: 'Perfil do Usuário',
    content: 'Acesse e gerencie suas informações de perfil e preferências.',
    buttonText: 'Finalizar Tour',
    placementBeacon: 'bottom',
  },
];

interface TourGuideProps {
  tourId?: string;
  steps?: SpotlightStep[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TourGuide({
  tourId = 'dashboard-tour',
  steps = dashboardTourSteps,
  isOpen: isOpenProp,
  onClose,
}: TourGuideProps) {
  const [isTourOpen, setIsTourOpen] = useState(isOpenProp || false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(`${tourId}-completed`, false);

  // Check if it's the user's first visit
  useEffect(() => {
    if (isOpenProp === undefined && !hasSeenTour) {
      // Only auto-start the tour if it's the first visit
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1000); // Slight delay to ensure DOM is ready
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, isOpenProp]);

  // Handle external open state if provided
  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsTourOpen(isOpenProp);
    }
  }, [isOpenProp]);

  const handleClose = () => {
    setIsTourOpen(false);
    setHasSeenTour(true);
    
    if (onClose) {
      onClose();
    }
  };

  const startTour = () => {
    setIsTourOpen(true);
  };

  return (
    <>
      {/* Tour Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
        onClick={startTour}
      >
        <HelpCircle className="h-4 w-4" />
        Tour Guiado
      </Button>

      {/* Simplified version without actual tour rendering for now */}
      {isTourOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Tour Guiado</h3>
            <p className="text-gray-600 mb-4">
              Um passeio guiado pelos principais recursos estará disponível em breve.
              Esta é uma prévia do recurso.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}