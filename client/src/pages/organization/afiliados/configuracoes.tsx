import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Wallet, 
  Settings, 
  Bell, 
  CreditCard, 
  UserPlus,
  Percent
} from 'lucide-react';

const ConfiguracoesAfiliados = () => {
  const [valorPonto, setValorPonto] = useState('0.10');
  const [pontosIndicacao, setPontosIndicacao] = useState('100');
  const [pontosPlanoBasico, setPontosPlanoBasico] = useState('80');
  const [pontosPlanoEstandar, setPontosPlanoEstandar] = useState('120');
  const [pontosPlanoPremiun, setPontosPlanoPremiun] = useState('250');
  const [minResgate, setMinResgate] = useState('200');
  const [chavePix, setChavePix] = useState('exemplo@meuemail.com.br');
  const [notificarIndicacao, setNotificarIndicacao] = useState(true);
  const [notificarPagamento, setNotificarPagamento] = useState(true);
  const [programaAtivo, setProgramaAtivo] = useState(true);

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Configurações do Programa de Afiliados</h1>
            <p className="text-gray-600 mt-1">Configure as regras e parâmetros do seu programa de afiliados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" onClick={() => window.location.href = '/organization/afiliados'}>
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <Button className="gap-1">
              <Save className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="geral">
          <TabsList className="mb-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="pontos">Pontos e Comissões</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configure os parâmetros básicos do programa de afiliados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label className="text-base" htmlFor="programa-ativo">Ativar programa de afiliados</Label>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, seus membros poderão gerar links de afiliados e receber comissões
                    </p>
                  </div>
                  <Switch
                    id="programa-ativo"
                    checked={programaAtivo}
                    onCheckedChange={setProgramaAtivo}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor-ponto">Valor do ponto (R$)</Label>
                      <div className="flex items-center">
                        <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">R$</span>
                        <Input
                          id="valor-ponto"
                          type="number"
                          value={valorPonto}
                          onChange={(e) => setValorPonto(e.target.value)}
                          step="0.01"
                          min="0"
                          className="rounded-l-none"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valor em reais de cada ponto do programa
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min-resgate">Mínimo para resgate (pontos)</Label>
                      <Input
                        id="min-resgate"
                        type="number"
                        value={minResgate}
                        onChange={(e) => setMinResgate(e.target.value)}
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Quantidade mínima de pontos para solicitar resgate
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Período de validade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validade-pontos">Validade dos pontos</Label>
                      <Select defaultValue="12">
                        <SelectTrigger id="validade-pontos">
                          <SelectValue placeholder="Selecionar período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 meses</SelectItem>
                          <SelectItem value="6">6 meses</SelectItem>
                          <SelectItem value="12">12 meses</SelectItem>
                          <SelectItem value="24">24 meses</SelectItem>
                          <SelectItem value="0">Sem validade</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Tempo que os pontos ficam válidos após serem creditados
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pontos">
            <Card>
              <CardHeader>
                <CardTitle>Pontos e Comissões</CardTitle>
                <CardDescription>Configure a quantidade de pontos por tipo de indicação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pontos por Indicação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pontos-indicacao">Pontos por indicação bem-sucedida</Label>
                      <Input
                        id="pontos-indicacao"
                        type="number"
                        value={pontosIndicacao}
                        onChange={(e) => setPontosIndicacao(e.target.value)}
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Pontos ganhos quando alguém se registra pelo seu link (valor base)
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pontos por Plano Contratado</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pontos-basico">Plano Básico</Label>
                      <div className="flex items-center">
                        <Input
                          id="pontos-basico"
                          type="number"
                          value={pontosPlanoBasico}
                          onChange={(e) => setPontosPlanoBasico(e.target.value)}
                          min="0"
                        />
                        <span className="ml-2">pontos</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pontos-estandar">Plano Padrão</Label>
                      <div className="flex items-center">
                        <Input
                          id="pontos-estandar"
                          type="number"
                          value={pontosPlanoEstandar}
                          onChange={(e) => setPontosPlanoEstandar(e.target.value)}
                          min="0"
                        />
                        <span className="ml-2">pontos</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pontos-premiun">Plano Premium</Label>
                      <div className="flex items-center">
                        <Input
                          id="pontos-premiun"
                          type="number"
                          value={pontosPlanoPremiun}
                          onChange={(e) => setPontosPlanoPremiun(e.target.value)}
                          min="0"
                        />
                        <span className="ml-2">pontos</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pontos por Renovação</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Switch id="pontos-renovacao" defaultChecked />
                      <Label htmlFor="pontos-renovacao" className="ml-2">
                        Conceder pontos por renovação de plano
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, o afiliado receberá pontos também nas renovações de plano dos clientes indicados
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="porcentagem-renovacao">Porcentagem dos pontos iniciais</Label>
                    <div className="flex items-center w-32">
                      <Input
                        id="porcentagem-renovacao"
                        type="number"
                        defaultValue="50"
                        min="0"
                        max="100"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagamentos">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>Configure como os afiliados receberão seus pagamentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Métodos de Pagamento</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="pagamento-pix" defaultChecked />
                      <Label htmlFor="pagamento-pix">PIX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="pagamento-desconto" defaultChecked />
                      <Label htmlFor="pagamento-desconto">Desconto em mensalidade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="pagamento-produtos" defaultChecked />
                      <Label htmlFor="pagamento-produtos">Produtos e serviços</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dados para Pagamento</h3>
                  <div className="space-y-2">
                    <Label htmlFor="chave-pix">Sua Chave PIX</Label>
                    <Input
                      id="chave-pix"
                      value={chavePix}
                      onChange={(e) => setChavePix(e.target.value)}
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                    />
                    <p className="text-xs text-muted-foreground">
                      Chave PIX para receber os pagamentos das comissões
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Frequência de Pagamentos</h3>
                  <div className="space-y-2">
                    <Label htmlFor="frequencia-pagamento">Frequência dos pagamentos</Label>
                    <Select defaultValue="mensal">
                      <SelectTrigger id="frequencia-pagamento">
                        <SelectValue placeholder="Selecionar frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="manual">Manual (Sob demanda)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>Configure como e quando receber notificações sobre o programa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificações por E-mail</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base" htmlFor="notificar-indicacao">Nova indicação</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba um e-mail quando alguém se registrar usando seu link de afiliado
                        </p>
                      </div>
                      <Switch
                        id="notificar-indicacao"
                        checked={notificarIndicacao}
                        onCheckedChange={setNotificarIndicacao}
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base" htmlFor="notificar-pagamento">Pagamento recebido</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba um e-mail quando um pagamento de comissão for realizado
                        </p>
                      </div>
                      <Switch
                        id="notificar-pagamento"
                        checked={notificarPagamento}
                        onCheckedChange={setNotificarPagamento}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificações no Sistema</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="notificar-sistema-indicacao" defaultChecked />
                      <Label htmlFor="notificar-sistema-indicacao">Nova indicação</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notificar-sistema-pagamento" defaultChecked />
                      <Label htmlFor="notificar-sistema-pagamento">Pagamento recebido</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notificar-sistema-status" defaultChecked />
                      <Label htmlFor="notificar-sistema-status">Alteração de status</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(ConfiguracoesAfiliados, {
  moduleType: "afiliados",
  moduleName: "Programa de Afiliados",
  moduleDescription: "Indique novos associados e ganhe pontos para trocar por produtos e serviços.",
  modulePrice: 49.00
});