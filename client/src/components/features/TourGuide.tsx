import { useState, useEffect } from 'react';
import { SpotlightTour } from 'react-spotlight-tour';
import { Button } from '@/components/ui/button';
// Custom hooks
import { useLocalStorage } from '@/hooks/use-local-storage';
import { X, HelpCircle } from 'lucide-react';

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

      {/* Spotlight Tour */}
      {/* @ts-ignore - types might not match exactly with SpotlightTour props */}
      <SpotlightTour
        steps={steps}
        isOpen={isTourOpen}
        onRequestClose={handleClose}
        onComplete={handleClose}
        closeWithEscape={true}
        closeButton={<X size={16} />}
        spotlightPadding={10}
        scrollSmooth={true}
        styles={{
          spotlight: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          tooltipContainer: {
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '1rem',
            maxWidth: '20rem',
          },
          tooltipTitle: {
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          },
          tooltipContent: {
            fontSize: '0.875rem',
            color: '#4B5563',
            marginBottom: '1rem',
          },
          tooltipFooter: {
            display: 'flex',
            justifyContent: 'space-between',
          },
        }}
      />
    </>
  );
}