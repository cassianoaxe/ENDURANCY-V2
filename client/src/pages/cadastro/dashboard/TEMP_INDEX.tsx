import React from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function CadastroDashboard() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Versão simplificada para teste de roteamento</p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="mb-6 gap-2" 
        onClick={() => window.location.href = '/cadastro'}
      >
        <ArrowLeft size={16} />
        Voltar para Cadastro
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Página de Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta é uma versão simplificada da página de Dashboard para testar o roteamento.</p>
          <p className="mt-2">Se você está vendo esta página, o roteamento está funcionando corretamente.</p>
        </CardContent>
      </Card>
    </div>
  );
}