import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { PageContainer } from '@/components/ui/page-container';
import CarteirinhaDigital from '@/components/carteirinha/CarteirinhaDigital';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Camera, BadgeCheck } from 'lucide-react';

export default function CarteirinhaPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Carteirinha Digital" 
        description="Sua identificação digital como associado"
        icon={<BadgeCheck className="w-6 h-6 text-primary" />}
      />
      
      <Tabs defaultValue="carteirinha" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="carteirinha">Carteirinha</TabsTrigger>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="carteirinha" className="space-y-4">
          <CarteirinhaDigital />
        </TabsContent>
        
        <TabsContent value="informacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={18} />
                Sobre a Carteirinha Digital
              </CardTitle>
              <CardDescription>
                Entenda como funciona sua identificação digital como associado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">O que é a carteirinha digital?</h3>
                <p className="text-muted-foreground">
                  A carteirinha digital é sua identificação oficial como associado. Ela contém um QR code único 
                  que pode ser verificado para confirmar sua associação, além de fornecer informações importantes 
                  sobre seu cadastro.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Como utilizar</h3>
                <p className="text-muted-foreground">
                  Você pode apresentar sua carteirinha digital nas seguintes situações:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Ao retirar medicamentos ou produtos na associação</li>
                  <li>Para identificação em eventos e reuniões</li>
                  <li>Para acesso a serviços exclusivos de associados</li>
                  <li>Em estabelecimentos parceiros para descontos e benefícios</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Verificação e Segurança</h3>
                <p className="text-muted-foreground">
                  O QR code presente na carteirinha leva a uma página segura que confirma a autenticidade 
                  e validade da sua associação. Esta verificação pode ser feita por qualquer pessoa ou 
                  estabelecimento para confirmar seu vínculo com a associação.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <div className="bg-muted p-4 rounded-lg w-full">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Camera size={16} />
                  Atualizar foto de perfil
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Para uma melhor identificação, recomendamos adicionar sua foto à carteirinha digital.
                </p>
                <Button variant="outline" size="sm">
                  Alterar foto
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}