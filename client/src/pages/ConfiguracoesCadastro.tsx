import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Settings, Building, FileText, Mail, DollarSign, FileCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConfiguracoesCadastro() {
  // Navegação direta para a página de cadastro
  const navigateBack = () => {
    window.location.href = '/cadastro';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Configurações de Cadastro</h1>
          <p className="text-gray-600">Personalize as configurações do módulo de cadastro</p>
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

      <Tabs defaultValue="tipos-org">
        <TabsList className="mb-4">
          <TabsTrigger value="tipos-org">Tipos de Organização</TabsTrigger>
          <TabsTrigger value="campos">Campos Personalizados</TabsTrigger>
          <TabsTrigger value="termos">Termos & Políticas</TabsTrigger>
          <TabsTrigger value="email">Configurações de Email</TabsTrigger>
          <TabsTrigger value="pagamento">Configurações de Pagamento</TabsTrigger>
          <TabsTrigger value="dominios">Domínios</TabsTrigger>
        </TabsList>

        <TabsContent value="tipos-org">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Organização</CardTitle>
              <CardDescription>
                Configure os tipos de organizações disponíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      <CardTitle className="text-md">Associação</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Organizações sem fins lucrativos que representam grupos de pacientes.
                    </p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      <CardTitle className="text-md">Empresa</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Organizações com fins lucrativos, como laboratórios e clínicas.
                    </p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campos">
          <Card>
            <CardHeader>
              <CardTitle>Campos Personalizados</CardTitle>
              <CardDescription>
                Configure campos adicionais para cada tipo de organização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Informações Adicionais (Associação)</p>
                      <p className="text-sm text-muted-foreground">8 campos configurados</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Informações Adicionais (Empresa)</p>
                      <p className="text-sm text-muted-foreground">6 campos configurados</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>

                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Documentação Extra</p>
                      <p className="text-sm text-muted-foreground">3 campos configurados</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="termos">
          <Card>
            <CardHeader>
              <CardTitle>Termos & Políticas</CardTitle>
              <CardDescription>
                Configure os termos de uso e políticas de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Termos de Uso</p>
                      <p className="text-sm text-muted-foreground">Última atualização: 15/04/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Política de Privacidade</p>
                      <p className="text-sm text-muted-foreground">Última atualização: 20/04/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>

                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Termos Específicos para Associações</p>
                      <p className="text-sm text-muted-foreground">Última atualização: 10/04/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Email</CardTitle>
              <CardDescription>
                Configure modelos de email e notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email de Boas-vindas</p>
                      <p className="text-sm text-muted-foreground">Enviado após confirmação de cadastro</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email de Verificação</p>
                      <p className="text-sm text-muted-foreground">Enviado durante o processo de cadastro</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>

                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email de Aprovação</p>
                      <p className="text-sm text-muted-foreground">Enviado após aprovação administrativa</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamento">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pagamento</CardTitle>
              <CardDescription>
                Configure opções de pagamento para organizações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Gateway de Pagamento</p>
                      <p className="text-sm text-muted-foreground">Stripe (conectado)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Opções de Faturamento</p>
                      <p className="text-sm text-muted-foreground">Mensal, Anual, Personalizado</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>

                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Descontos Automáticos</p>
                      <p className="text-sm text-muted-foreground">3 regras configuradas</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dominios">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Domínio</CardTitle>
              <CardDescription>
                Configure opções de domínio e subdomínio para organizações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Domínio Principal</p>
                      <p className="text-sm text-muted-foreground">comply.app.br</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>

                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Subdomínios Automáticos</p>
                      <p className="text-sm text-muted-foreground">Habilitado (org.comply.app.br)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>

                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Domínios Personalizados</p>
                      <p className="text-sm text-muted-foreground">Permitido para planos Premium</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}