import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Clipboard, Link, RefreshCw } from 'lucide-react';

export default function PaymentTest() {
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/api/payment-links/create-test-token');
      if (response.success) {
        setTokenData(response);
      } else {
        setError(response.message || 'Erro ao criar token de teste');
      }
    } catch (error: any) {
      console.error('Erro ao criar token de teste:', error);
      setError(error.message || 'Erro de comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Texto copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar texto:', err);
      });
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Esta página é para testar o fluxo de pagamento. Clique no botão abaixo para gerar um token de teste.
            </p>
            
            <Button
              onClick={createTestToken}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Gerando token...
                </>
              ) : (
                <>
                  Gerar token de teste
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {tokenData && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-semibold text-lg mb-2 text-green-800">Token gerado com sucesso!</h3>
              
              <div className="grid gap-3">
                <div className="flex items-start justify-between">
                  <span className="text-gray-600 font-medium">Token:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{tokenData.token}</code>
                    <button 
                      onClick={() => copyToClipboard(tokenData.token)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start justify-between">
                  <span className="text-gray-600 font-medium">URL de pagamento:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{window.location.origin + tokenData.paymentUrl}</code>
                    <button 
                      onClick={() => copyToClipboard(window.location.origin + tokenData.paymentUrl)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start justify-between">
                  <span className="text-gray-600 font-medium">Organização:</span>
                  <span>{tokenData.organization.name} (ID: {tokenData.organization.id})</span>
                </div>
                
                <div className="flex items-start justify-between">
                  <span className="text-gray-600 font-medium">Plano:</span>
                  <span>{tokenData.plan.name} (R$ {tokenData.plan.price.toFixed(2).replace('.', ',')})</span>
                </div>
              </div>
              
              <div className="mt-4">
                <a 
                  href={tokenData.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Link className="h-4 w-4" />
                  Abrir página de pagamento
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}