import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold">Bem-vindo ao Sistema</h1>
        <p className="text-gray-600">Escolha o ambiente para continuar:</p>
        
        <div className="space-y-3">
          <Link href="/patient/produtos">
            <Button className="w-full py-6 text-lg">
              Área do Paciente
            </Button>
          </Link>
          
          <Link href="/organization/dashboard">
            <Button className="w-full py-6 text-lg" variant="outline">
              Área da Organização
            </Button>
          </Link>
          
          <Link href="/laboratory/dashboard">
            <Button className="w-full py-6 text-lg" variant="outline">
              Área do Laboratório
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}