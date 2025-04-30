import React from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, QrCode, CreditCard, Image, BadgeCheck } from "lucide-react";

export default function Carteirinha() {
  const [, setLocation] = useLocation();

  // Navegação direta para a página de cadastro
  const navigateBack = () => {
    window.location.href = '/cadastro';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Carteirinha</h1>
          <p className="text-gray-600">Cadastro e gerenciamento de carteirinhas digitais</p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="mb-6 gap-2" 
        onClick={navigateBack}
      >
        <ArrowLeft size={16} />
        Voltar para Cadastro
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Modelo de Carteirinha</CardTitle>
            <CardDescription>
              Visualização do modelo atual da carteirinha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase">Nome</div>
                <div className="text-lg font-medium">Carla Silva</div>
              </div>
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase">CPF</div>
                <div className="text-base">123.456.789-00</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Associação</div>
                  <div className="text-sm">ABRACE</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">ID</div>
                  <div className="text-sm">#12345</div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Ativo</span>
                </div>
                <div className="text-xs text-gray-500">Válido até 04/30/2026</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações da Carteirinha</CardTitle>
            <CardDescription>
              Personalize a aparência e os dados da carteirinha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Aqui você pode personalizar o modelo da carteirinha digital dos associados.</p>
            <p className="mt-2">Personalize cores, layout e informações exibidas na carteirinha.</p>
            <div className="mt-6 flex gap-4">
              <Button size="sm" variant="default" className="gap-2">
                <CreditCard className="w-4 h-4" /> Personalizar Modelo
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <QrCode className="w-4 h-4" /> Gerar QR Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}