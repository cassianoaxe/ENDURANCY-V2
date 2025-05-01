import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail, Truck } from "lucide-react";

export default function SupplierRegisterSuccess() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-gradient-to-r from-red-800 to-red-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Portal do Fornecedor</h1>
          </div>
          <nav>
            <Button variant="ghost" className="text-white hover:text-white hover:bg-red-700" onClick={() => setLocation("/")}>
              Voltar para Home
            </Button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-green-100">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-green-700">Cadastro Enviado!</CardTitle>
            <CardDescription className="text-center text-base">
              Recebemos sua solicitação de cadastro como fornecedor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center pb-2">
            <p>
              Agradecemos seu interesse em fazer parte do nosso Portal do Fornecedor.
              Nossa equipe irá analisar suas informações e documentos.
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
              <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="font-medium text-blue-800">Fique atento ao seu email</h3>
                <p className="text-sm text-blue-600">
                  Enviaremos atualizações sobre o status do seu cadastro para o email informado. 
                  O processo geralmente leva até 48 horas.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button 
              onClick={() => setLocation("/supplier/login")}
              className="w-full bg-red-700 hover:bg-red-800"
            >
              Ir para Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="w-full text-red-700 hover:text-red-800 hover:bg-red-50"
            >
              Voltar para Home
            </Button>
          </CardFooter>
        </Card>
      </main>

      {/* Rodapé */}
      <footer className="bg-red-900 text-white p-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Portal do Fornecedor - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}