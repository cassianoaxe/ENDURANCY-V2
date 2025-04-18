'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Asset } from '../columns/asset-columns';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Clock, 
  Wrench, 
  Tag, 
  FileText,
  ImageIcon
} from 'lucide-react';
import AssetTagGenerator from './asset-tag-generator';

interface AssetViewModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetViewModal({ asset, isOpen, onClose }: AssetViewModalProps) {
  const [activeTab, setActiveTab] = React.useState('details');
  const [showTagGenerator, setShowTagGenerator] = React.useState(false);

  if (!asset) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Renderiza as informações do ativo em seções organizadas
  const renderAssetDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center">
        <Package className="h-6 w-6 mr-2 text-primary" />
        <h3 className="text-lg font-semibold">{asset.nome}</h3>
        <Badge className="ml-auto" variant={
          asset.status === 'Ativo' ? 'default' :
          asset.status === 'Em Manutenção' ? 'warning' :
          asset.status === 'Inativo' ? 'destructive' : 'secondary'
        }>{asset.status}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Tipo</p>
          <p>{asset.tipo}</p>
        </div>
        
        {asset.modelo && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Modelo</p>
            <p>{asset.modelo}</p>
          </div>
        )}
        
        {asset.marca && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Marca</p>
            <p>{asset.marca}</p>
          </div>
        )}
        
        {asset.numeroSerie && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Número de Série</p>
            <p className="font-mono">{asset.numeroSerie}</p>
          </div>
        )}
      </div>
      
      <div className="border-t pt-3 mt-3 space-y-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          <h4 className="font-medium">Informações de Aquisição</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data de Aquisição</p>
            <p>{formatDate(asset.dataAquisicao)}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
            <p className="font-semibold">{formatCurrency(asset.valorAquisicao)}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-3 mt-3 space-y-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          <h4 className="font-medium">Vida Útil e Depreciação</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Vida Útil</p>
            <p>{asset.vidaUtilAnos} anos</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Status Atual</p>
            <p>{asset.status}</p>
          </div>
        </div>
      </div>
      
      {(asset.localizacao || asset.departamento) && (
        <div className="border-t pt-3 mt-3 space-y-4">
          <div className="flex items-center">
            <Tag className="h-5 w-5 mr-2 text-primary" />
            <h4 className="font-medium">Localização</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {asset.localizacao && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Localização</p>
                <p>{asset.localizacao}</p>
              </div>
            )}
            
            {asset.departamento && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p>{asset.departamento}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderHistoricoManutencao = () => (
    <div className="space-y-2">
      <div className="text-center py-8">
        <Wrench className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Histórico de Manutenção</h3>
        <p className="text-sm text-muted-foreground">
          Não há registros de manutenção para este ativo.
        </p>
        <Button className="mt-4" variant="outline" asChild>
          <a href={`/organization/patrimonio/manutencoes/novo?ativoId=${asset.id}`}>
            Registrar Manutenção
          </a>
        </Button>
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div className="space-y-2">
      <div className="text-center py-8">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Documentos</h3>
        <p className="text-sm text-muted-foreground">
          Não há documentos vinculados a este ativo.
        </p>
        <Button className="mt-4" variant="outline">
          Adicionar Documento
        </Button>
      </div>
    </div>
  );

  const renderImagens = () => (
    <div className="space-y-2">
      <div className="text-center py-8">
        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Imagens</h3>
        <p className="text-sm text-muted-foreground">
          Não há imagens vinculadas a este ativo.
        </p>
        <Button className="mt-4" variant="outline">
          Adicionar Imagem
        </Button>
      </div>
    </div>
  );

  // Renderiza o gerador de etiquetas se solicitado
  if (showTagGenerator) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {
        setShowTagGenerator(false);
        onClose();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Etiquetas para {asset.nome}</DialogTitle>
            <DialogDescription>
              Crie etiquetas personalizadas para identificação física de seus ativos
            </DialogDescription>
          </DialogHeader>
          
          <AssetTagGenerator 
            asset={asset} 
            onClose={() => setShowTagGenerator(false)} 
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagGenerator(false)}>
              Voltar aos Detalhes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Ativo</DialogTitle>
          <DialogDescription>
            Visualize informações detalhadas e histórico do ativo
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="pt-4">
            {renderAssetDetails()}
          </TabsContent>
          
          <TabsContent value="maintenance" className="pt-4">
            {renderHistoricoManutencao()}
          </TabsContent>
          
          <TabsContent value="documents" className="pt-4">
            {renderDocumentos()}
          </TabsContent>
          
          <TabsContent value="images" className="pt-4">
            {renderImagens()}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTagGenerator(true)}
            >
              <Tag className="mr-2 h-4 w-4" />
              Gerar Etiqueta
            </Button>
          </div>
          <Button variant="default" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}