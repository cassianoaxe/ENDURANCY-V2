import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Receipt } from 'lucide-react';

export interface FiscalCheckoutOptions {
  emitirDocumentoFiscal: boolean;
  tipoDocumento: 'cupom_fiscal' | 'nfce';
  nomeCliente?: string;
  documentoCliente?: string;
}

interface CheckoutFiscalOptionsProps {
  onChange: (options: FiscalCheckoutOptions) => void;
  defaultValues?: Partial<FiscalCheckoutOptions>;
}

/**
 * Componente para adicionar opções fiscais no checkout
 * Permite ao cliente escolher se deseja receber um documento fiscal
 * e informar dados para emissão
 */
export default function CheckoutFiscalOptions({
  onChange,
  defaultValues = {
    emitirDocumentoFiscal: false,
    tipoDocumento: 'cupom_fiscal'
  }
}: CheckoutFiscalOptionsProps) {
  const [options, setOptions] = useState<FiscalCheckoutOptions>({
    emitirDocumentoFiscal: defaultValues.emitirDocumentoFiscal || false,
    tipoDocumento: defaultValues.tipoDocumento || 'cupom_fiscal',
    nomeCliente: defaultValues.nomeCliente || '',
    documentoCliente: defaultValues.documentoCliente || ''
  });
  
  // Manipulador para alterar opções
  const handleChange = (
    field: keyof FiscalCheckoutOptions,
    value: string | boolean
  ) => {
    const updatedOptions = { ...options, [field]: value };
    setOptions(updatedOptions);
    onChange(updatedOptions);
  };
  
  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="emitDocumento"
          checked={options.emitirDocumentoFiscal}
          onCheckedChange={(checked) => 
            handleChange('emitirDocumentoFiscal', Boolean(checked))
          }
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="emitDocumento"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <Receipt className="h-4 w-4 inline-block mr-1" />
            Emitir documento fiscal
          </Label>
          <p className="text-sm text-muted-foreground">
            Marque esta opção para receber um documento fiscal da sua compra
          </p>
        </div>
      </div>
      
      {options.emitirDocumentoFiscal && (
        <div className="pl-6 space-y-4 border-l">
          <div className="space-y-2">
            <Label htmlFor="tipoDocumento">Tipo de documento</Label>
            <Select
              value={options.tipoDocumento}
              onValueChange={(value) => 
                handleChange('tipoDocumento', value as 'cupom_fiscal' | 'nfce')
              }
            >
              <SelectTrigger id="tipoDocumento" className="w-full">
                <SelectValue placeholder="Selecione o tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cupom_fiscal">Cupom Fiscal</SelectItem>
                <SelectItem value="nfce">NFC-e (Nota Fiscal de Consumidor Eletrônica)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nomeCliente">Seu nome completo</Label>
            <Input
              id="nomeCliente"
              placeholder="Nome para o documento fiscal"
              value={options.nomeCliente || ''}
              onChange={(e) => handleChange('nomeCliente', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentoCliente">CPF/CNPJ</Label>
            <Input
              id="documentoCliente"
              placeholder="CPF ou CNPJ (apenas números)"
              value={options.documentoCliente || ''}
              onChange={(e) => handleChange('documentoCliente', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Se não informado, o documento será emitido como "Consumidor Final"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}