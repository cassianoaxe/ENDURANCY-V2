// Este componente foi removido pois o recurso de tour guiado ficou tecnologicamente defasado.
// Componente vazio mantido para preservar as importações existentes.

interface TourGuideProps {
  tourId?: string;
  steps?: any[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TourGuide(_props: TourGuideProps) {
  return null;
}