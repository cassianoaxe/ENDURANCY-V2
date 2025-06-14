import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calculator, 
  TrendingUp, 
  Gift, 
  FileText, 
  Plus, 
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  Home,
  Phone,
  Mail,
  FileImage,
  Target
} from "lucide-react";

const ExemptionsPage = () => {
  const [selectedTab, setSelectedTab] = useState("beneficiaries");
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);

  // Mock data para demonstração
  const exemptionTypes = [
    { value: "exemption_100", label: "100% - 1x por mês", discount: 100, monthlyLimit: 1 },
    { value: "exemption_50", label: "50% - 2x por mês", discount: 50, monthlyLimit: 2 },
    { value: "exemption_25", label: "25% - 5x por mês", discount: 25, monthlyLimit: 5 },
    { value: "anuidade_only", label: "Só Anuidade", discount: 0, monthlyLimit: 0 }
  ];

  const mockBeneficiaries = [
    {
      id: 1,
      name: "Maria Silva Santos",
      cpf: "123.456.789-01",
      exemptionType: "exemption_100",
      criteriaRank: 8.5,
      exemptionValue: 450.00,
      monthlyUsage: 0,
      monthlyLimit: 1,
      status: "active"
    },
    {
      id: 2,
      name: "João Oliveira Costa",
      cpf: "987.654.321-00",
      exemptionType: "exemption_50",
      criteriaRank: 6.8,
      exemptionValue: 225.00,
      monthlyUsage: 1,
      monthlyLimit: 2,
      status: "active"
    },
    {
      id: 3,
      name: "Ana Paula Lima",
      cpf: "456.789.123-45",
      exemptionType: "exemption_25",
      criteriaRank: 4.2,
      exemptionValue: 112.50,
      monthlyUsage: 3,
      monthlyLimit: 5,
      status: "active"
    }
  ];

  const transparencyData = {
    currentMonth: {
      totalExemptions: 2850.50,
      exemptions100Count: 12,
      exemptions50Count: 18,
      exemptions25Count: 35,
      totalDonations: 15420.00,
      activeBeneficiaries: 65
    },
    yearToDate: {
      totalExemptions: 28505.00,
      totalDonations: 154200.00,
      newBeneficiaries: 23
    }
  };

  const criteriaWeights = {
    monthlyIncome: 0.4,
    familyMembers: 0.2,
    medicalCondition: 0.3,
    socialVulnerability: 0.1
  };

  const calculateCriteriaRank = (income: number, familyMembers: number, hasMedical: boolean, vulnerability: number) => {
    const incomeScore = Math.max(0, 10 - (income / 1000)); // Quanto menor a renda, maior a pontuação
    const familyScore = Math.min(10, familyMembers * 1.5); // Mais membros = maior pontuação
    const medicalScore = hasMedical ? 8 : 0;
    const vulnerabilityScore = vulnerability;

    return (
      incomeScore * criteriaWeights.monthlyIncome +
      familyScore * criteriaWeights.familyMembers +
      medicalScore * criteriaWeights.medicalCondition +
      vulnerabilityScore * criteriaWeights.socialVulnerability
    );
  };

  const getExemptionTypeByRank = (rank: number) => {
    if (rank >= 8) return "exemption_100";
    if (rank >= 6) return "exemption_50";
    if (rank >= 4) return "exemption_25";
    return "anuidade_only";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Isenções Sociais</h1>
        <p className="text-gray-600">
          Gerencie beneficiários, isenções e acompanhe o índice total de transparência
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiários Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transparencyData.currentMonth.activeBeneficiaries}</div>
            <p className="text-xs text-gray-500">+{transparencyData.yearToDate.newBeneficiaries} este ano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Isenções do Mês</CardTitle>
            <Calculator className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {transparencyData.currentMonth.totalExemptions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500">
              100%: {transparencyData.currentMonth.exemptions100Count} | 
              50%: {transparencyData.currentMonth.exemptions50Count} | 
              25%: {transparencyData.currentMonth.exemptions25Count}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações do Mês</CardTitle>
            <Gift className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {transparencyData.currentMonth.totalDonations.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500">Meta: R$ 20.000,00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Índice Transparência</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(transparencyData.currentMonth.totalExemptions + transparencyData.currentMonth.totalDonations).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500">Isenções + Doações</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} defaultValue="beneficiaries" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="beneficiaries">Beneficiários</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="donations">Doações</TabsTrigger>
          <TabsTrigger value="transparency">Transparência</TabsTrigger>
        </TabsList>

        <TabsContent value="beneficiaries" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Buscar por nome ou CPF..." className="pl-10 w-80" />
              </div>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar Cadastros
              </Button>
            </div>
            <Button onClick={() => setShowAddBeneficiary(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Beneficiário
            </Button>
          </div>

          {showAddBeneficiary && (
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Novo Beneficiário</CardTitle>
                <CardDescription>
                  Os dados serão analisados automaticamente para determinar o programa de isenção adequado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" placeholder="Digite o nome completo" />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" placeholder="000.000.000-00" />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input id="birthDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="monthlyIncome">Renda Mensal (R$)</Label>
                      <Input id="monthlyIncome" type="number" placeholder="0,00" />
                    </div>
                    <div>
                      <Label htmlFor="familyMembers">Membros da Família</Label>
                      <Input id="familyMembers" type="number" placeholder="1" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="email@exemplo.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" placeholder="(11) 99999-9999" />
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço Completo</Label>
                      <Textarea id="address" placeholder="Rua, número, bairro, cidade, estado, CEP" />
                    </div>
                    <div>
                      <Label htmlFor="medicalCondition">Possui Condição Médica Especial?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não</SelectItem>
                          <SelectItem value="chronic">Doença Crônica</SelectItem>
                          <SelectItem value="disability">Deficiência</SelectItem>
                          <SelectItem value="elderly">Idoso (60+)</SelectItem>
                          <SelectItem value="other">Outra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Documentos Necessários</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Documento de Identidade (Frente)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Clique para enviar</p>
                      </div>
                    </div>
                    <div>
                      <Label>Comprovante de Renda</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Clique para enviar</p>
                      </div>
                    </div>
                    <div>
                      <Label>Comprovante de Residência</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Clique para enviar</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowAddBeneficiary(false)}>
                    Cancelar
                  </Button>
                  <Button>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calcular Critério e Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {mockBeneficiaries.map((beneficiary) => (
              <Card key={beneficiary.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{beneficiary.name}</h3>
                        <p className="text-gray-500">CPF: {beneficiary.cpf}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Programa</div>
                        <Badge variant={beneficiary.exemptionType === 'exemption_100' ? 'default' : 
                                     beneficiary.exemptionType === 'exemption_50' ? 'secondary' : 'outline'}>
                          {exemptionTypes.find(t => t.value === beneficiary.exemptionType)?.label.split(' - ')[0]}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Rank Critério</div>
                        <div className="font-semibold text-lg">{beneficiary.criteriaRank.toFixed(1)}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Valor Isenção</div>
                        <div className="font-semibold text-lg text-green-600">
                          R$ {beneficiary.exemptionValue.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Uso Mensal</div>
                        <div className="font-semibold text-lg">
                          {beneficiary.monthlyUsage}/{beneficiary.monthlyLimit}
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(beneficiary.monthlyUsage / beneficiary.monthlyLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Histórico de Compras com Isenção</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Implementação do histórico de compras em desenvolvimento</p>
                <p className="text-sm">Aqui serão exibidas todas as compras realizadas com isenção</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Gestão de Doações</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Doação
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Doações em Dinheiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">R$ 12.500,00</div>
                <p className="text-sm text-gray-500">Este mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-blue-600" />
                  Doações em Bens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">R$ 2.920,00</div>
                <p className="text-sm text-gray-500">Valor estimado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-purple-600" />
                  Doações Imóveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">R$ 0,00</div>
                <p className="text-sm text-gray-500">Este mês</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transparency" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Portal de Transparência</h2>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório Mensal
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Índice Total de Isenções</CardTitle>
                <CardDescription>Valores liberados no programa de isenção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  R$ {transparencyData.currentMonth.totalExemptions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Isenção 100%:</span>
                    <span className="font-semibold">{transparencyData.currentMonth.exemptions100Count} beneficiários</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Isenção 50%:</span>
                    <span className="font-semibold">{transparencyData.currentMonth.exemptions50Count} beneficiários</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Isenção 25%:</span>
                    <span className="font-semibold">{transparencyData.currentMonth.exemptions25Count} beneficiários</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Consolidado do Ano</CardTitle>
                <CardDescription>Resumo anual de isenções e doações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Total de Isenções</div>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {transparencyData.yearToDate.totalExemptions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total de Doações</div>
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {transparencyData.yearToDate.totalDonations.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Novos Beneficiários</div>
                    <div className="text-2xl font-bold text-blue-600">{transparencyData.yearToDate.newBeneficiaries}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Critérios de Avaliação</CardTitle>
              <CardDescription>Sistema de pontuação para classificação de beneficiários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Pesos dos Critérios</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Renda Mensal:</span>
                      <span className="font-semibold">{(criteriaWeights.monthlyIncome * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Membros da Família:</span>
                      <span className="font-semibold">{(criteriaWeights.familyMembers * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Condição Médica:</span>
                      <span className="font-semibold">{(criteriaWeights.medicalCondition * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vulnerabilidade Social:</span>
                      <span className="font-semibold">{(criteriaWeights.socialVulnerability * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Classificação por Pontuação</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>8.0 - 10.0:</span>
                      <Badge>Isenção 100%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>6.0 - 7.9:</span>
                      <Badge variant="secondary">Isenção 50%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>4.0 - 5.9:</span>
                      <Badge variant="outline">Isenção 25%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>0.0 - 3.9:</span>
                      <Badge variant="destructive">Só Anuidade</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExemptionsPage;