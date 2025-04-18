'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Asset } from '../columns/asset-columns';
import { Package, QrCode, Printer, Tag } from 'lucide-react';

interface AssetTagGeneratorProps {
  asset: Asset;
  onClose: () => void;
}

export default function AssetTagGenerator({ asset, onClose }: AssetTagGeneratorProps) {
  const tagRef = useRef<HTMLDivElement>(null);
  const [tagFormat, setTagFormat] = React.useState<'standard' | 'qrcode' | 'detailed'>('standard');
  const [tagSize, setTagSize] = React.useState<'small' | 'medium' | 'large'>('medium');
  const [includeQRCode, setIncludeQRCode] = React.useState(true);
  const [includeBarcode, setIncludeBarcode] = React.useState(false);
  const [copies, setCopies] = React.useState(1);

  // Função para gerar o código de identificação do ativo
  const generateAssetCode = () => {
    const prefix = asset.tipo.substring(0, 3).toUpperCase();
    return `${prefix}-${asset.id.toString().padStart(5, '0')}`;
  };

  // Função para imprimir a etiqueta
  const printTag = () => {
    const printContents = tagRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Etiqueta de Ativo</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .asset-tag { 
                  border: 1px solid #000; 
                  padding: 10px; 
                  width: ${tagSize === 'small' ? '200px' : tagSize === 'medium' ? '300px' : '400px'};
                  text-align: center;
                  margin: 0 auto;
                }
                .asset-code { font-size: 18px; font-weight: bold; }
                .asset-details { font-size: 12px; margin-top: 5px; }
                .asset-qr { margin: 10px auto; }
                @media print {
                  @page { margin: 0; }
                  body { margin: 1cm; }
                }
              </style>
            </head>
            <body>
              <div style="text-align: center; margin-bottom: 20px;">
                <h3>Etiqueta de Ativo - ${copies} ${copies === 1 ? 'cópia' : 'cópias'}</h3>
                <button onclick="window.print()">Imprimir</button>
              </div>
              ${Array(copies).fill(printContents).join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
      }
    }
  };

  // Função para gerar o QR code com os dados do ativo
  const generateQRCodeData = () => {
    return JSON.stringify({
      id: asset.id,
      codigo: generateAssetCode(),
      nome: asset.nome,
      tipo: asset.tipo,
      serie: asset.numeroSerie || '',
      dataAquisicao: asset.dataAquisicao,
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerar Etiqueta de Ativo</CardTitle>
          <CardDescription>
            Crie etiquetas personalizadas para identificação física de seus ativos
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tagFormat">Formato da Etiqueta</Label>
              <Select 
                value={tagFormat} 
                onValueChange={(value) => setTagFormat(value as any)}
              >
                <SelectTrigger id="tagFormat">
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="qrcode">QR Code</SelectItem>
                  <SelectItem value="detailed">Detalhada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagSize">Tamanho</Label>
              <Select 
                value={tagSize} 
                onValueChange={(value) => setTagSize(value as any)}
              >
                <SelectTrigger id="tagSize">
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeQRCode"
                checked={includeQRCode}
                onChange={(e) => setIncludeQRCode(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="includeQRCode">Incluir QR Code</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeBarcode"
                checked={includeBarcode}
                onChange={(e) => setIncludeBarcode(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="includeBarcode">Incluir Código de Barras</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="copies">Número de Cópias</Label>
            <Input
              id="copies"
              type="number"
              min="1"
              max="10"
              value={copies}
              onChange={(e) => setCopies(parseInt(e.target.value))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={printTag}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Etiqueta
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={tagRef} 
            className={`asset-tag border border-gray-200 p-4 mx-auto mb-4 ${
              tagSize === 'small' ? 'w-[200px]' : tagSize === 'medium' ? 'w-[300px]' : 'w-[400px]'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Package className="mr-2 h-5 w-5" />
              <span className="text-lg font-bold">{asset.nome}</span>
            </div>
            
            <div className="asset-code flex items-center justify-center">
              <Tag className="mr-2 h-5 w-5" />
              <span className="text-xl font-mono font-bold">{generateAssetCode()}</span>
            </div>
            
            {(tagFormat === 'detailed' || tagFormat === 'standard') && (
              <div className="asset-details mt-2 text-sm">
                <div>Tipo: {asset.tipo}</div>
                {asset.numeroSerie && <div>S/N: {asset.numeroSerie}</div>}
                <div>Data: {new Date(asset.dataAquisicao).toLocaleDateString('pt-BR')}</div>
              </div>
            )}
            
            {includeQRCode && (
              <div className="asset-qr flex justify-center mt-3">
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-center">QR Code</div>
                  <div className="mt-1 bg-white p-2 text-center border">
                    <div className="h-20 w-20 mx-auto text-xs text-gray-400 flex items-center justify-center">
                      Imagem do QR Code
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {includeBarcode && (
              <div className="asset-barcode flex justify-center mt-3">
                <div className="bg-gray-100 p-1 text-center">
                  <div className="font-mono text-xs mb-1">{asset.id.toString().padStart(10, '0')}</div>
                  <div className="h-8 bg-gray-900 mx-4"></div>
                </div>
              </div>
            )}
            
            {tagFormat === 'detailed' && (
              <div className="asset-additional mt-3 text-xs border-t pt-2">
                {asset.marca && <div>Marca: {asset.marca}</div>}
                {asset.modelo && <div>Modelo: {asset.modelo}</div>}
                <div>Valor Aquisição: R$ {asset.valorAquisicao.toFixed(2)}</div>
                <div>Vida Útil: {asset.vidaUtilAnos} anos</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}