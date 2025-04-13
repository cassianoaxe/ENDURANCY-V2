'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Check, 
  Download, 
  Plus, 
  Save, 
  Trash2, 
  User, 
  CreditCard, 
  Building2,
  FileText,
  Wallet
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// Dados mockados para configurações financeiras
const CONTAS_BANCARIAS = [
  { 
    id: 1, 
    nome: 'Conta Principal', 
    banco: 'Banco do Brasil', 
    agencia: '1234-5', 
    conta: '12345-6', 
    tipo: 'Conta Corrente',
    principal: true,
    saldo: 75680.45
  },
  { 
    id: 2, 
    nome: 'Conta Secundária', 
    banco: 'Itaú', 
    agencia: '6789-0', 
    conta: '98765-4', 
    tipo: 'Conta Corrente',
    principal: false,
    saldo: 23450.12
  },
  { 
    id: 3, 
    nome: 'Poupança', 
    banco: 'Banco do Brasil', 
    agencia: '1234-5', 
    conta: '12345-7', 
    tipo: 'Conta Poupança',
    principal: false,
    saldo: 132540.78
  }
];

const CATEGORIAS_FINANCEIRAS = [
  { id: 1, nome: 'Vendas', tipo: 'receita', cor: '#4ade80', ativo: true },
  { id: 2, nome: 'Serviços', tipo: 'receita', cor: '#2dd4bf', ativo: true },
  { id: 3, nome: 'Assinaturas', tipo: 'receita', cor: '#a78bfa', ativo: true },
  { id: 4, nome: 'Outras Receitas', tipo: 'receita', cor: '#f87171', ativo: true },
  { id: 5, nome: 'Salários', tipo: 'despesa', cor: '#4ade80', ativo: true },
  { id: 6, nome: 'Fornecedores', tipo: 'despesa', cor: '#2dd4bf', ativo: true },
  { id: 7, nome: 'Marketing', tipo: 'despesa', cor: '#a78bfa', ativo: true },
  { id: 8, nome: 'Infraestrutura', tipo: 'despesa', cor: '#f87171', ativo: true },
  { id: 9, nome: 'Impostos', tipo: 'despesa', cor: '#facc15', ativo: true },
  { id: 10, nome: 'Outras Despesas', tipo: 'despesa', cor: '#f97316', ativo: true }
];

const FORMAS_PAGAMENTO = [
  { id: 1, nome: 'Cartão de Crédito', tipo: 'cartão', ativo: true },
  { id: 2, nome: 'Boleto Bancário', tipo: 'boleto', ativo: true },
  { id: 3, nome: 'Transferência Bancária', tipo: 'transferência', ativo: true },
  { id: 4, nome: 'Pix', tipo: 'pix', ativo: true },
  { id: 5, nome: 'Dinheiro', tipo: 'outros', ativo: true }
];

const CENTROS_CUSTO = [
  { id: 1, nome: 'Administrativo', descricao: 'Custos administrativos', ativo: true },
  { id: 2, nome: 'Comercial', descricao: 'Vendas e marketing', ativo: true },
  { id: 3, nome: 'Operacional', descricao: 'Produção e operações', ativo: true },
  { id: 4, nome: 'TI', descricao: 'Tecnologia e sistemas', ativo: true }
];

// Formatar valores monetários
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export default function ConfiguracaoFinanceira() {
  const [tabAtiva, setTabAtiva] = useState('contas');
  const [formDadosEmpresa, setFormDadosEmpresa] = useState({
    razaoSocial: 'Empresa Exemplo S.A.',
    cnpj: '12.345.678/0001-90',
    inscricaoEstadual: '123456789',
    regime: 'simples',
    endereco: 'Rua Exemplo, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    telefone: '(11) 1234-5678',
    email: 'financeiro@exemplo.com'
  });
  
  const [configAutomacao, setConfigAutomacao] = useState({
    conciliacaoAutomatica: true,
    categorizacaoAutomatica: true,
    lembretesPagamentos: true,
    notificacoesRecebimentos: true,
    exportacaoAutomatica: false
  });
  
  // Lidar com salvamento de configurações gerais
  const salvarConfiguracoes = () => {
    // Em uma aplicação real, aqui faria uma chamada de API
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram salvas com sucesso.",
    });
  };
  
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações Financeiras</h1>
            <p className="text-muted-foreground">
              Gerencie contas bancárias, categorias e outros parâmetros financeiros
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="gap-2" onClick={salvarConfiguracoes}>
              <Save className="h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </div>

        <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="contas">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="pagamentos">Formas de Pagamento</TabsTrigger>
            <TabsTrigger value="centros">Centros de Custo</TabsTrigger>
            <TabsTrigger value="geral">Configurações Gerais</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contas">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contas Bancárias</CardTitle>
                  <CardDescription>
                    Gerencie suas contas bancárias para controle financeiro
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Conta
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Banco</TableHead>
                      <TableHead>Agência / Conta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="w-[120px]">Principal</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CONTAS_BANCARIAS.map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.nome}</TableCell>
                        <TableCell>{conta.banco}</TableCell>
                        <TableCell>{conta.agencia} / {conta.conta}</TableCell>
                        <TableCell>{conta.tipo}</TableCell>
                        <TableCell className="text-right">{formatarMoeda(conta.saldo)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Switch 
                              checked={conta.principal} 
                              disabled={conta.principal}
                              aria-label="Conta principal" 
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="mr-2">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categorias">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categorias Financeiras</CardTitle>
                  <CardDescription>
                    Gerencie categorias para classificar receitas e despesas
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Categoria
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="todas">
                  <TabsList>
                    <TabsTrigger value="todas">Todas</TabsTrigger>
                    <TabsTrigger value="receitas">Receitas</TabsTrigger>
                    <TabsTrigger value="despesas">Despesas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="todas" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Cor</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {CATEGORIAS_FINANCEIRAS.map((categoria) => (
                          <TableRow key={categoria.id}>
                            <TableCell className="font-medium">{categoria.nome}</TableCell>
                            <TableCell>
                              <Badge variant={categoria.tipo === 'receita' ? 'default' : 'secondary'}>
                                {categoria.tipo === 'receita' ? 'Receita' : 'Despesa'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-5 h-5 rounded-full" 
                                  style={{ backgroundColor: categoria.cor }}
                                />
                                {categoria.cor}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch checked={categoria.ativo} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2">
                                Editar
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="receitas" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Cor</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {CATEGORIAS_FINANCEIRAS
                          .filter(cat => cat.tipo === 'receita')
                          .map((categoria) => (
                          <TableRow key={categoria.id}>
                            <TableCell className="font-medium">{categoria.nome}</TableCell>
                            <TableCell>
                              <Badge variant="default">Receita</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-5 h-5 rounded-full" 
                                  style={{ backgroundColor: categoria.cor }}
                                />
                                {categoria.cor}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch checked={categoria.ativo} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2">
                                Editar
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="despesas" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Cor</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {CATEGORIAS_FINANCEIRAS
                          .filter(cat => cat.tipo === 'despesa')
                          .map((categoria) => (
                          <TableRow key={categoria.id}>
                            <TableCell className="font-medium">{categoria.nome}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">Despesa</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-5 h-5 rounded-full" 
                                  style={{ backgroundColor: categoria.cor }}
                                />
                                {categoria.cor}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch checked={categoria.ativo} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2">
                                Editar
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pagamentos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Formas de Pagamento</CardTitle>
                  <CardDescription>
                    Configure os métodos de pagamento aceitos
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Forma de Pagamento
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FORMAS_PAGAMENTO.map((formaPagamento) => (
                      <TableRow key={formaPagamento.id}>
                        <TableCell className="font-medium">{formaPagamento.nome}</TableCell>
                        <TableCell className="capitalize">{formaPagamento.tipo}</TableCell>
                        <TableCell>
                          <Switch checked={formaPagamento.ativo} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="mr-2">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="centros">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Centros de Custo</CardTitle>
                  <CardDescription>
                    Gerencie os centros de custo da sua empresa
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Centro de Custo
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CENTROS_CUSTO.map((centro) => (
                      <TableRow key={centro.id}>
                        <TableCell className="font-medium">{centro.nome}</TableCell>
                        <TableCell>{centro.descricao}</TableCell>
                        <TableCell>
                          <Switch checked={centro.ativo} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="mr-2">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="geral">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>
                    Informações básicas da empresa para documentos financeiros
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input 
                      id="razaoSocial" 
                      value={formDadosEmpresa.razaoSocial}
                      onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, razaoSocial: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input 
                        id="cnpj" 
                        value={formDadosEmpresa.cnpj}
                        onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, cnpj: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                      <Input 
                        id="inscricaoEstadual" 
                        value={formDadosEmpresa.inscricaoEstadual}
                        onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, inscricaoEstadual: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regime">Regime Tributário</Label>
                    <Select 
                      value={formDadosEmpresa.regime}
                      onValueChange={(value) => setFormDadosEmpresa({ ...formDadosEmpresa, regime: value })}
                    >
                      <SelectTrigger id="regime">
                        <SelectValue placeholder="Selecione o regime tributário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples">Simples Nacional</SelectItem>
                        <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="lucro_real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input 
                      id="endereco" 
                      value={formDadosEmpresa.endereco}
                      onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, endereco: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input 
                        id="cidade" 
                        value={formDadosEmpresa.cidade}
                        onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, cidade: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input 
                        id="estado" 
                        value={formDadosEmpresa.estado}
                        onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, estado: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input 
                        id="cep" 
                        value={formDadosEmpresa.cep}
                        onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, cep: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input 
                        id="telefone" 
                        value={formDadosEmpresa.telefone}
                        onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, telefone: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail Financeiro</Label>
                      <Input 
                        id="email" 
                        value={formDadosEmpresa.email}
                        onChange={(e) => setFormDadosEmpresa({ ...formDadosEmpresa, email: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={salvarConfiguracoes} className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Dados da Empresa
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Automação Financeira</CardTitle>
                    <CardDescription>
                      Configure as automações para seu controle financeiro
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Conciliação Automática</Label>
                        <p className="text-sm text-muted-foreground">
                          Conciliar automaticamente transações bancárias
                        </p>
                      </div>
                      <Switch 
                        checked={configAutomacao.conciliacaoAutomatica}
                        onCheckedChange={(checked) => 
                          setConfigAutomacao({ ...configAutomacao, conciliacaoAutomatica: checked })
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Categorização Automática</Label>
                        <p className="text-sm text-muted-foreground">
                          Categorizar automaticamente transações com base em padrões
                        </p>
                      </div>
                      <Switch 
                        checked={configAutomacao.categorizacaoAutomatica}
                        onCheckedChange={(checked) => 
                          setConfigAutomacao({ ...configAutomacao, categorizacaoAutomatica: checked })
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Lembretes de Pagamentos</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber lembretes de contas a pagar próximas ao vencimento
                        </p>
                      </div>
                      <Switch 
                        checked={configAutomacao.lembretesPagamentos}
                        onCheckedChange={(checked) => 
                          setConfigAutomacao({ ...configAutomacao, lembretesPagamentos: checked })
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações de Recebimentos</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações de contas recebidas
                        </p>
                      </div>
                      <Switch 
                        checked={configAutomacao.notificacoesRecebimentos}
                        onCheckedChange={(checked) => 
                          setConfigAutomacao({ ...configAutomacao, notificacoesRecebimentos: checked })
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Exportação Automática</Label>
                        <p className="text-sm text-muted-foreground">
                          Exportar relatórios financeiros automaticamente
                        </p>
                      </div>
                      <Switch 
                        checked={configAutomacao.exportacaoAutomatica}
                        onCheckedChange={(checked) => 
                          setConfigAutomacao({ ...configAutomacao, exportacaoAutomatica: checked })
                        }
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={salvarConfiguracoes} className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Integrações</CardTitle>
                    <CardDescription>
                      Configure integrações com serviços financeiros
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Integração Bancária</p>
                          <p className="text-sm text-muted-foreground">
                            Conectar com APIs de bancos
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Configurar</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Gateway de Pagamento</p>
                          <p className="text-sm text-muted-foreground">
                            Integrar com processadores de pagamento
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Configurar</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Emissão de NF-e</p>
                          <p className="text-sm text-muted-foreground">
                            Integrar com sistemas de emissão de notas fiscais
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Configurar</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium">Contabilidade</p>
                          <p className="text-sm text-muted-foreground">
                            Integrar com software contábil
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Configurar</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}