'use client';

import React, { useState, useEffect } from 'react';
import { SpotlightTour } from 'react-spotlight-tour';
import { Button } from '@/components/ui/button';
import { LightbulbIcon, InfoIcon, XIcon } from 'lucide-react';
import { useLocation } from 'wouter';

interface PatrimonioTourProps {
  isOpen: boolean;
  onClose: () => void;
  startStep?: 'dashboard' | 'ativos' | 'instalacoes' | 'manutencoes' | 'depreciacao';
}

// Interface para os passos do tour
interface TourStep {
  selector: string;
  title: string;
  description: string;
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  spotlightPadding?: number;
  condition?: () => boolean;
  action?: () => Promise<void>;
}

export default function PatrimonioTour({ isOpen, onClose, startStep = 'dashboard' }: PatrimonioTourProps) {
  const [location, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElements, setHighlightedElements] = useState<HTMLElement[]>([]);
  
  // Define todos os passos do tour
  const tourSteps: TourStep[] = [
    // Dashboard do módulo patrimônio
    {
      selector: '[data-tour="patrimonio-dashboard"]',
      title: 'Dashboard de Patrimônio',
      description: 'Bem-vindo ao módulo de Gestão de Patrimônio! Este dashboard exibe resumos dos seus ativos, instalações e manutenções programadas, fornecendo uma visão geral completa de todo o seu patrimônio.',
      placement: 'center',
      spotlightPadding: 10,
      action: () => navigateToPathAndWait('/organization/patrimonio')
    },
    {
      selector: '[data-tour="patrimonio-estatisticas"]',
      title: 'Estatísticas Gerais',
      description: 'Aqui você encontra um resumo estatístico de todo o seu patrimônio, incluindo o valor total de ativos, quantidade de instalações e o valor da depreciação mensal.',
      placement: 'bottom',
      spotlightPadding: 10,
      condition: () => location === '/organization/patrimonio'
    },
    {
      selector: '[data-tour="patrimonio-ativos-card"]',
      title: 'Acesso Rápido aos Ativos',
      description: 'Gerencie seus equipamentos, máquinas e outros ativos físicos de forma centralizada. Aqui você pode adicionar novos ativos, visualizar detalhes e calcular depreciações.',
      placement: 'right',
      spotlightPadding: 10,
      condition: () => location === '/organization/patrimonio'
    },
    {
      selector: '[data-tour="patrimonio-instalacoes-card"]',
      title: 'Instalações e Locais',
      description: 'Gerencie suas instalações como laboratórios, escritórios, depósitos e outros locais onde seus ativos estão alocados.',
      placement: 'left',
      spotlightPadding: 10,
      condition: () => location === '/organization/patrimonio'
    },
    
    // Lista de ativos
    {
      selector: '[data-tour="patrimonio-ativos-header"]',
      title: 'Gerenciamento de Ativos',
      description: 'Nesta tela você pode visualizar, editar e adicionar todos os seus ativos e equipamentos inventariados.',
      placement: 'bottom',
      spotlightPadding: 10,
      action: () => navigateToPathAndWait('/organization/patrimonio/ativos')
    },
    {
      selector: '[data-tour="patrimonio-ativos-novo"]',
      title: 'Adicionar Novos Ativos',
      description: 'Clique aqui para adicionar um novo ativo ao seu inventário. Você poderá incluir informações como valor de aquisição, localização e detalhes técnicos.',
      placement: 'bottom',
      spotlightPadding: 5,
      condition: () => location === '/organization/patrimonio/ativos'
    },
    {
      selector: '[data-tour="patrimonio-ativos-tabela"]',
      title: 'Tabela de Ativos',
      description: 'Aqui você pode ver todos os seus ativos cadastrados. Clique nas ações para visualizar detalhes, editar ou gerar etiquetas para identificação física dos itens.',
      placement: 'top',
      spotlightPadding: 10,
      condition: () => location === '/organization/patrimonio/ativos'
    },
    {
      selector: '[data-tour="patrimonio-ativos-acoes"]',
      title: 'Ações em Lote',
      description: 'Use este menu para ações em lote como importar/exportar ativos, gerar relatórios e imprimir etiquetas para múltiplos ativos de uma vez.',
      placement: 'left',
      spotlightPadding: 5,
      condition: () => location === '/organization/patrimonio/ativos'
    },
    
    // Instalações
    {
      selector: '[data-tour="patrimonio-instalacoes-header"]',
      title: 'Gestão de Instalações',
      description: 'Nesta tela você pode gerenciar todas as suas instalações físicas - como laboratórios, escritórios e depósitos - onde os ativos estão localizados.',
      placement: 'bottom',
      spotlightPadding: 10,
      action: () => navigateToPathAndWait('/organization/patrimonio/instalacoes')
    },
    
    // Manutenções
    {
      selector: '[data-tour="patrimonio-manutencoes-header"]',
      title: 'Controle de Manutenções',
      description: 'Agende, gerencie e acompanhe todas as manutenções preventivas e corretivas dos seus ativos. Mantenha um histórico completo para cada equipamento.',
      placement: 'bottom',
      spotlightPadding: 10,
      action: () => navigateToPathAndWait('/organization/patrimonio/manutencoes')
    },
    
    // Depreciação
    {
      selector: '[data-tour="patrimonio-depreciacao-header"]',
      title: 'Cálculo de Depreciação',
      description: 'Utilize nossa ferramenta para calcular automaticamente a depreciação de seus ativos, seguindo diferentes métodos contábeis e fiscais.',
      placement: 'bottom',
      spotlightPadding: 10,
      action: () => navigateToPathAndWait('/organization/patrimonio/depreciacao')
    },
    
    // Etiquetas
    {
      selector: '[data-tour="patrimonio-etiquetas"]',
      title: 'Geração de Etiquetas',
      description: 'Gere etiquetas personalizadas para identificação física dos seus ativos. Inclua QR Codes, códigos de barras e outras informações relevantes.',
      placement: 'left',
      spotlightPadding: 10,
      action: () => {
        if (location !== '/organization/patrimonio/ativos') {
          return navigateToPathAndWait('/organization/patrimonio/ativos');
        }
        return Promise.resolve();
      }
    },
    
    // Finalização
    {
      selector: 'body',
      title: 'Pronto para começar!',
      description: 'Agora você conhece as principais funcionalidades do módulo de Patrimônio. Comece adicionando suas instalações e depois cadastre seus ativos para um controle completo do seu patrimônio.',
      placement: 'center',
      spotlightPadding: 0
    }
  ];

  // Função para navegar para uma rota e esperar o carregamento
  async function navigateToPathAndWait(path: string) {
    if (location !== path) {
      navigate(path);
      // Espera o carregamento da página
      return new Promise<void>((resolve) => {
        setTimeout(resolve, 500);
      });
    }
    return Promise.resolve();
  }

  // Calcula o índice do passo inicial com base no parâmetro startStep
  useEffect(() => {
    if (isOpen) {
      let initialStep = 0;
      switch (startStep) {
        case 'ativos':
          initialStep = tourSteps.findIndex(step => step.selector === '[data-tour="patrimonio-ativos-header"]');
          break;
        case 'instalacoes':
          initialStep = tourSteps.findIndex(step => step.selector === '[data-tour="patrimonio-instalacoes-header"]');
          break;
        case 'manutencoes':
          initialStep = tourSteps.findIndex(step => step.selector === '[data-tour="patrimonio-manutencoes-header"]');
          break;
        case 'depreciacao':
          initialStep = tourSteps.findIndex(step => step.selector === '[data-tour="patrimonio-depreciacao-header"]');
          break;
        default:
          initialStep = 0;
      }
      setCurrentStep(initialStep >= 0 ? initialStep : 0);
    }
  }, [isOpen, startStep]);

  const handleTourEnd = () => {
    onClose();
  };

  // Se o tour não estiver aberto, não renderize nada
  if (!isOpen) return null;

  return (
    <SpotlightTour
      steps={tourSteps}
      spotlightPadding={5}
      initialStep={currentStep}
      closeOnClickOutside={false}
      styles={{
        spotlight: {
          borderRadius: '8px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)'
        },
        popover: {
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 15px rgba(0, 0, 0, 0.3)',
          padding: '16px',
          maxWidth: '350px'
        },
        popoverTitle: {
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          color: '#1f2937'
        },
        popoverDescription: {
          fontSize: '14px',
          margin: '0 0 16px',
          lineHeight: '1.5',
          color: '#4b5563'
        },
        buttonContainer: {
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '16px'
        },
        closeButton: {
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          color: '#9ca3af'
        }
      }}
      renderPopover={({
        step,
        nextStep,
        prevStep,
        closeSpotlight,
        currentStepIndex,
        stepsCount,
      }) => (
        <div>
          <button
            onClick={closeSpotlight}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <XIcon size={16} />
          </button>
          
          <div className="flex items-start mb-2">
            <LightbulbIcon className="text-yellow-500 mr-2 mt-1" size={20} />
            <h3 className="text-lg font-semibold">{step.title}</h3>
          </div>
          
          <p className="text-gray-600 mb-4">{step.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Passo {currentStepIndex + 1} de {stepsCount}
            </span>
            
            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <Button size="sm" variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
              )}
              
              {currentStepIndex < stepsCount - 1 ? (
                <Button size="sm" onClick={nextStep}>
                  Próximo
                </Button>
              ) : (
                <Button size="sm" onClick={closeSpotlight}>
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      onFinish={handleTourEnd}
      onClose={handleTourEnd}
    />
  );
}