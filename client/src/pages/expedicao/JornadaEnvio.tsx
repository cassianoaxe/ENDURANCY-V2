import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShipmentJourneyAnimation from '@/components/expedicao/ShipmentJourneyAnimation';
import { TruckIcon, Route } from 'lucide-react';
import { Link, useLocation } from 'wouter';

// Tipos para componentes personalizados
type HeadingProps = {
  as?: React.ElementType;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  [x: string]: any;
};

type BreadcrumbItem = {
  href: string;
  label: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

// Componentes personalizados
const Heading: React.FC<HeadingProps> = ({ 
  as: Component = 'h1', 
  children, 
  size = 'md', 
  weight = 'medium', 
  className = '', 
  ...props 
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };
  
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  
  return (
    <Component
      className={`${sizeClasses[size]} ${weightClasses[weight]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [], className = '' }) => {
  const [, navigate] = useLocation();
  
  return (
    <nav className={`flex text-sm ${className}`}>
      <ol className="flex flex-wrap items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {index === items.length - 1 ? (
              <span className="text-gray-600">{item.label}</span>
            ) : (
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                }}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

const JornadaEnvio: React.FC = () => {
  const [selectedShipment, setSelectedShipment] = useState<number | null>(1);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Lista de envios para teste
  const shipments = [
    { id: 1, tracking_code: 'BR564897654321', destination: 'Rio de Janeiro/RJ' },
    { id: 2, tracking_code: 'BR123456789012', destination: 'Belo Horizonte/MG' },
    { id: 3, tracking_code: 'BR987654321098', destination: 'Salvador/BA' },
  ];
  
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="bg-primary/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            <span className="font-medium">Jornada do Envio - Modo de Tela Cheia</span>
          </div>
          <Button
            variant="outline"
            onClick={() => setFullscreen(false)}
          >
            Sair da Tela Cheia
          </Button>
        </div>
        <div className="flex-1 p-4">
          <ShipmentJourneyAnimation
            shipmentId={selectedShipment || undefined}
            fullscreen={true}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Painel', href: '/' },
          { label: 'Expedição', href: '/expedicao' },
          { label: 'Jornada de Envio', href: '/expedicao/jornada-envio' }
        ]} 
        className="mb-6" 
      />
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Heading as="h1" size="2xl" weight="bold" className="mb-2">
            <TruckIcon className="inline-block mr-2 h-8 w-8 text-primary" />
            Jornada de Envio
          </Heading>
          <p className="text-gray-500">
            Visualize em tempo real o percurso dos seus envios, desde a coleta até a entrega final.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/organization/expedicao">
            <Button variant="outline">
              Voltar
            </Button>
          </Link>
          <Button
            variant="default"
            onClick={() => setFullscreen(true)}
          >
            Modo de Tela Cheia
          </Button>
        </div>
      </div>
      
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione um Envio
            </label>
            <Select
              value={selectedShipment?.toString() || ''}
              onValueChange={(value) => setSelectedShipment(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um envio" />
              </SelectTrigger>
              <SelectContent>
                {shipments.map((shipment) => (
                  <SelectItem key={shipment.id} value={shipment.id.toString()}>
                    {shipment.tracking_code} - {shipment.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button
              variant="outline"
              onClick={() => setSelectedShipment(null)}
              disabled={!selectedShipment}
            >
              Limpar Seleção
            </Button>
          </div>
        </div>
      </Card>
      
      <ShipmentJourneyAnimation
        shipmentId={selectedShipment || undefined}
        className="w-full"
      />
    </div>
  );
};

export default JornadaEnvio;