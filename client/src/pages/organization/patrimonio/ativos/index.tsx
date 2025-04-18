'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Wrench, 
  Building, 
  Package, 
  FileText, 
  Upload, 
  Download,
  Filter,
  Tag
} from 'lucide-react';
import { Link } from 'wouter';
import { columns, Asset } from '../columns/asset-columns';
import AssetViewModal from '../components/asset-view-modal';
import AssetTagGenerator from '../components/asset-tag-generator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function AtivosPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAssetViewOpen, setIsAssetViewOpen] = useState(false);
  const [isTagGeneratorOpen, setIsTagGeneratorOpen] = useState(false);
  
  // Consulta de ativos
  const {
    data: ativos,
    isLoading: isLoadingAtivos
  } = useQuery({
    queryKey: ['/api/patrimonio/ativos'],
  });

  // Dados para mock quando a API não retornar os dados reais
  const mockAtivos: Asset[] = ativos || [
    {
      id: 1,
      nome: 'Equipamento HPLC Agilent',
      tipo: 'laboratório',
      numeroSerie: 'AG12345678',
      marca: 'Agilent',
      modelo: '1260 Infinity II',
      dataAquisicao: '2022-05-15',
      valorAquisicao: 150000,
      vidaUtilAnos: 10,
      status: 'Ativo',
      localizacao: 'Laboratório Central',
      departamento: 'Pesquisa'
    },
    {
      id: 2,
      nome: 'Câmara Fria para Armazenamento',
      tipo: 'refrigeração',
      numeroSerie: 'CF98765432',
      marca: 'Frigostrella',
      modelo: 'CF-500',
      dataAquisicao: '2021-11-20',
      valorAquisicao: 85000,
      vidaUtilAnos: 15,
      status: 'Em Manutenção',
      localizacao: 'Setor de Armazenamento',
      departamento: 'Logística'
    },
    {
      id: 3,
      nome: 'Computador Dell Workstation',
      tipo: 'tecnologia',
      numeroSerie: 'DL78945612',
      marca: 'Dell',
      modelo: 'Precision 5820',
      dataAquisicao: '2023-02-10',
      valorAquisicao: 12000,
      vidaUtilAnos: 5,
      status: 'Ativo',
      localizacao: 'Escritório Principal',
      departamento: 'TI'
    }
  ];

  // Handlers para ações de visualização/modalos
  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsAssetViewOpen(true);
  };

  const handleCloseAssetView = () => {
    setIsAssetViewOpen(false);
  };

  const handleOpenTagGenerator = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsTagGeneratorOpen(true);
  };

  const handleCloseTagGenerator = () => {
    setIsTagGeneratorOpen(false);
  };

  // Atualiza as colunas da tabela para incluir o handler de visualização
  const columnsWithViewHandler = React.useMemo(() => {
    return columns.map(column => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }: any) => {
            const asset = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal h-4 w-4">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleViewAsset(asset)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye mr-2 h-4 w-4">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to={`/organization/patrimonio/ativos/editar/${asset.id}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil mr-2 h-4 w-4">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                        <path d="m15 5 4 4"></path>
                      </svg>
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleOpenTagGenerator(asset)}>
                    <Tag className="mr-2 h-4 w-4" />
                    Gerar Etiqueta
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to={`/organization/patrimonio/ativos/${asset.id}/calcular-depreciacao`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calculator mr-2 h-4 w-4">
                        <rect width="16" height="20" x="4" y="2" rx="2"></rect>
                        <line x1="8" x2="16" y1="6" y2="6"></line>
                        <line x1="16" x2="16" y1="14" y2="18"></line>
                        <path d="M8 14h.01"></path>
                        <path d="M12 14h.01"></path>
                        <path d="M8 18h.01"></path>
                        <path d="M12 18h.01"></path>
                      </svg>
                      Calcular Depreciação
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2 mr-2 h-4 w-4">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" x2="10" y1="11" y2="17"></line>
                      <line x1="14" x2="14" y1="11" y2="17"></line>
                    </svg>
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
        };
      }
      return column;
    });
  }, []);

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Ativos e Equipamentos"
        text="Gerencie todos os seus ativos e equipamentos."
        data-tour="patrimonio-ativos-header"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button asChild data-tour="patrimonio-ativos-novo">
            <Link to="/organization/patrimonio/ativos/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Ativo
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" data-tour="patrimonio-ativos-acoes">
                <Filter className="mr-2 h-4 w-4" /> Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Opções</DropdownMenuLabel>
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4" /> Importar Ativos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" /> Exportar Ativos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-tour="patrimonio-etiquetas">
                <Tag className="mr-2 h-4 w-4" /> Gerar Etiquetas em Lote
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageHeader>
      
      {isLoadingAtivos ? (
        <div className="space-y-2 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div data-tour="patrimonio-ativos-tabela">
          <DataTable columns={columnsWithViewHandler} data={mockAtivos} />
        </div>
      )}
      
      {/* Modal de visualização do ativo */}
      {selectedAsset && (
        <AssetViewModal 
          asset={selectedAsset}
          isOpen={isAssetViewOpen}
          onClose={handleCloseAssetView}
        />
      )}
      
      {/* Gerador de etiquetas */}
      {selectedAsset && isTagGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Gerar Etiqueta para {selectedAsset.nome}</h2>
            </div>
            <div className="p-4">
              <AssetTagGenerator 
                asset={selectedAsset} 
                onClose={handleCloseTagGenerator} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}