import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, CheckCircle2, ArrowRight, Copy, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

export default function SupplierRegisterSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(10);
  
  // QR Code para o login do fornecedor
  const supplierLoginUrl = `${window.location.origin}/supplier/login`;
  
  // Dados fictícios do fornecedor para demonstração
  const supplierData = {
    id: "SUPP-" + Math.floor(10000 + Math.random() * 90000),
    name: "Nome da Empresa",
    registrationDate: new Date().toLocaleDateString('pt-BR'),
  };

  // Função para copiar o ID do fornecedor para o clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(supplierData.id)
      .then(() => {
        toast({
          title: "ID copiado!",
          description: "O ID do fornecedor foi copiado para a área de transferência.",
        });
      })
      .catch((error) => {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o ID.",
          variant: "destructive",
        });
      });
  };

  // Função para baixar o QR Code
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code') as SVGElement;
    if (!svg) return;
    
    // Criar uma cópia do SVG como string
    const svgData = new XMLSerializer().serializeToString(svg);
    
    // Criar um elemento Blob com os dados SVG
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Criar link de download
    const link = document.createElement('a');
    link.href = url;
    link.download = `supplier-qrcode-${supplierData.id}.svg`;
    link.click();
    
    // Limpar URL
    URL.revokeObjectURL(url);
  };

  // Contador regressivo para redirecionamento automático
  useEffect(() => {
    if (countdown <= 0) {
      setLocation('/supplier/login');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, setLocation]);

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
        <Card className="max-w-4xl w-full shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Cadastro Realizado com Sucesso!</h2>
                <p className="text-white/90">Sua conta de fornecedor foi criada e está pronta para uso.</p>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informações do Cadastro</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="font-medium">ID do Fornecedor:</div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{supplierData.id}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={copyToClipboard}
                          title="Copiar ID"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="font-medium">Data de Registro:</div>
                      <div>{supplierData.registrationDate}</div>
                      <div className="font-medium">Status:</div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Ativo
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Próximos Passos</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-600 text-xs text-red-600 mr-2">1</span>
                      <span>Faça login utilizando seu email e senha cadastrados</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-600 text-xs text-red-600 mr-2">2</span>
                      <span>Complete seu perfil adicionando mais informações sobre sua empresa</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-600 text-xs text-red-600 mr-2">3</span>
                      <span>Cadastre seus produtos no catálogo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-600 text-xs text-red-600 mr-2">4</span>
                      <span>Configure suas preferências de venda e entrega</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-gray-500 mb-1">
                    Você será redirecionado para a página de login em {countdown} segundos...
                  </p>
                  <Button 
                    onClick={() => setLocation('/supplier/login')} 
                    className="w-full bg-red-700 hover:bg-red-800"
                  >
                    Ir para o Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold">Acesso Rápido</h3>
                <p className="text-sm text-center text-gray-500 mb-2">
                  Escaneie o QR Code abaixo para acessar o Portal do Fornecedor
                </p>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <QRCodeSVG 
                    id="qr-code"
                    value={supplierLoginUrl} 
                    size={180} 
                    level="H" 
                    includeMargin={true}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center mt-2 text-red-700 border-red-700"
                  onClick={downloadQRCode}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar QR Code
                </Button>
                
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg w-full">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Importante</h4>
                  <p className="text-xs text-red-700">
                    Guarde seu ID de fornecedor em um local seguro. Você precisará dele para resolver qualquer problema com sua conta.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
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