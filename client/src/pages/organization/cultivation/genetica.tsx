import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Dna, 
  Github, 
  BarChart2, 
  Settings,
  Copy,
  CheckCircle2,
  Download,
  Leaf,
  Scale,
  Eye,
  HelpCircle,
  History,
  KeyRound
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const GenericaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  
  // Dados simulados de genótipos
  const genotipos = [
    {
      id: "GEN-001",
      nome: "Sativa CBD Alto",
      tipoEspecie: "Cannabis Sativa",
      origem: "Colombia x Tailândia",
      caracteristicas: ["Alto CBD", "Baixo THC", "Resistente a fungos"],
      tempoFloracao: "9-10 semanas",
      producaoEstimada: "Alta",
      status: "ativo",
      dataRegistro: "10/01/2025"
    },
    {
      id: "GEN-002",
      nome: "Indica Terapêutica",
      tipoEspecie: "Cannabis Indica",
      origem: "Afeganistão x Marrocos",
      caracteristicas: ["Médio CBD", "Médio THC", "Alta em Mirceno"],
      tempoFloracao: "7-8 semanas",
      producaoEstimada: "Média",
      status: "ativo",
      dataRegistro: "15/02/2025"
    },
    {
      id: "GEN-003",
      nome: "Ruderalis Autoflorescente",
      tipoEspecie: "Cannabis Ruderalis",
      origem: "Rússia x Autoflower",
      caracteristicas: ["Baixo CBD", "Baixo THC", "Autoflorescente"],
      tempoFloracao: "10-11 semanas (total)",
      producaoEstimada: "Baixa",
      status: "ativo",
      dataRegistro: "05/03/2025"
    }
  ];
  
  // Dados simulados de análises genéticas
  const analises = [
    {
      id: "ANG-001",
      genotipo: "GEN-001",
      tipoAnalise: "Sequenciamento completo",
      dataAnalise: "20/01/2025",
      laboratorio: "GenCannabis",
      resultado: {
        pureza: 98.5,
        marcadoresIdentificados: 154,
        estabilidade: "Alta"
      },
      status: "completo"
    },
    {
      id: "ANG-002",
      genotipo: "GEN-002",
      tipoAnalise: "Marcadores específicos",
      dataAnalise: "25/02/2025",
      laboratorio: "BioSequence",
      resultado: {
        pureza: 96.2,
        marcadoresIdentificados: 78,
        estabilidade: "Média"
      },
      status: "completo"
    },
    {
      id: "ANG-003",
      genotipo: "GEN-003",
      tipoAnalise: "Sequenciamento parcial",
      dataAnalise: "15/03/2025",
      laboratorio: "GenCannabis",
      resultado: null,
      status: "em_analise"
    }
  ];
  
  // Dados simulados de cruzamentos
  const cruzamentos = [
    {
      id: "CRZ-001",
      nome: "CBD Master",
      parental1: "GEN-001",
      parental2: "GEN-003",
      objetivo: "Autoflorescente com alto CBD",
      dataInicio: "01/04/2025",
      geracao: "F1",
      status: "em_progresso",
      progressoEstimado: 30,
      notas: "Primeiros resultados promissores em testes iniciais"
    },
    {
      id: "CRZ-002",
      nome: "Terapêutica Rápida",
      parental1: "GEN-002",
      parental2: "GEN-003",
      objetivo: "Reduzir tempo de floração mantendo terpenos",
      dataInicio: "15/03/2025",
      geracao: "F1",
      status: "em_progresso",
      progressoEstimado: 15,
      notas: "Processo de seleção inicial em andamento"
    }
  ];
  
  // Dados simulados de genes específicos
  const genes = [
    {
      id: "GENE-001",
      nome: "THCA Sintase",
      funcao: "Produção de THCA",
      cromossomo: 6,
      variantesConhecidas: 3,
      descricao: "Gene responsável pela produção da enzima THCA sintase, que converte CBGA em THCA."
    },
    {
      id: "GENE-002",
      nome: "CBDA Sintase",
      funcao: "Produção de CBDA",
      cromossomo: 7,
      variantesConhecidas: 4,
      descricao: "Gene responsável pela produção da enzima CBDA sintase, que converte CBGA em CBDA."
    },
    {
      id: "GENE-003",
      nome: "Terpeno Sintase",
      funcao: "Produção de terpenos",
      cromossomo: 4,
      variantesConhecidas: 8,
      descricao: "Família de genes responsáveis pela produção de diferentes terpenos presentes na planta."
    }
  ];
  
  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Genética e Melhoramento</h1>
            <p className="text-gray-600 mt-1">Genótipos, análises genéticas e programa de melhoramento</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <a href="/organization/cultivation" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Voltar</span>
              </a>
            </Button>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              <span>Novo Genótipo</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="genotipos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="genotipos">Genótipos</TabsTrigger>
            <TabsTrigger value="analises">Análises Genéticas</TabsTrigger>
            <TabsTrigger value="cruzamentos">Cruzamentos</TabsTrigger>
            <TabsTrigger value="biblioteca">Biblioteca Genética</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar genótipos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter" className="whitespace-nowrap">Filtrar por:</Label>
              <select
                id="filter"
                className="border rounded-md px-3 py-1 text-sm"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="todos">Todas as Espécies</option>
                <option value="sativa">Cannabis Sativa</option>
                <option value="indica">Cannabis Indica</option>
                <option value="ruderalis">Cannabis Ruderalis</option>
                <option value="hibrido">Híbridos</option>
              </select>
            </div>
          </div>
          
          {/* TAB DE GENÓTIPOS */}
          <TabsContent value="genotipos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {genotipos.map((genotipo) => (
                <Card key={genotipo.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{genotipo.nome}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                    <CardDescription>{genotipo.tipoEspecie}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID do Genótipo</p>
                      <div className="flex items-center mt-1">
                        <p className="font-mono text-sm font-medium">{genotipo.id}</p>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Origem</p>
                      <p className="font-medium">{genotipo.origem}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Características</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {genotipo.caracteristicas.map((caracteristica, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {caracteristica}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Floração</p>
                        <p className="font-medium">{genotipo.tempoFloracao}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Produção</p>
                        <p className="font-medium">{genotipo.producaoEstimada}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t pt-2 pb-2 flex justify-between">
                    <p className="text-xs text-gray-500">Registro: {genotipo.dataRegistro}</p>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Dna className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Detalhes do Genótipo</CardTitle>
                <CardDescription>Informações detalhadas sobre o genótipo Sativa CBD Alto (GEN-001)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <h3 className="text-base font-medium mb-2">Descrição</h3>
                      <p className="text-sm text-gray-700">
                        Genótipo Sativa CBD Alto desenvolvido para apresentar alto teor de CBD (acima de 12%) e níveis mínimos de THC (&lt;0.3%), mantendo as características energéticas da Sativa. Cruzamento selecionado a partir de linhagens colombianas e tailandesas com alto teor de CBD, seguido por estabilização ao longo de 6 gerações.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Terpenos Predominantes</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-md">
                          <span className="text-sm font-medium">Mirceno</span>
                          <span className="text-sm">38%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                          <span className="text-sm font-medium">Pineno</span>
                          <span className="text-sm">22%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-md">
                          <span className="text-sm font-medium">Limoneno</span>
                          <span className="text-sm">18%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                          <span className="text-sm font-medium">Linalol</span>
                          <span className="text-sm">12%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Marcadores Genéticos Principais</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <Dna className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">CBDA Sintase</p>
                              <p className="text-xs text-gray-500">Variante: Alto Rendimento</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <Dna className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">THCA Sintase</p>
                              <p className="text-xs text-gray-500">Variante: Baixa Expressão</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <Dna className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Mirceno Sintase</p>
                              <p className="text-xs text-gray-500">Variante: Expressão Média</p>
                            </div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800">Provável</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Canabinoides Esperados</h3>
                      <div className="space-y-2">
                        <div className="relative pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">CBD</span>
                            <span className="text-xs font-medium">12-16%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                        
                        <div className="relative pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">THC</span>
                            <span className="text-xs font-medium">&lt; 0.3%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '5%' }}></div>
                          </div>
                        </div>
                        
                        <div className="relative pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">CBG</span>
                            <span className="text-xs font-medium">1-2%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                        
                        <div className="relative pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">CBC</span>
                            <span className="text-xs font-medium">0.5-1%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: '8%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Condições Ideais</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-600">Temperatura Vegetativa</span>
                          <span>24-26°C</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-600">Temperatura Floração</span>
                          <span>22-24°C</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-600">Umidade Vegetativa</span>
                          <span>65-75%</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-600">Umidade Floração</span>
                          <span>45-55%</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-600">Ciclo de Luz Vegetativa</span>
                          <span>18/6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ciclo de Luz Floração</span>
                          <span>12/12</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Status de Proteção</h3>
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                        <div className="flex items-center">
                          <KeyRound className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-900">Proteção Intelectual</span>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          Genótipo protegido por registro de cultivar em processo de análise.
                          Referência: PROT-2025-00154
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  Histórico
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Relatório Completo
                  </Button>
                  <Button size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Editar Genótipo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* TAB DE ANÁLISES GENÉTICAS */}
          <TabsContent value="analises">
            <Card>
              <CardHeader>
                <CardTitle>Análises Genéticas</CardTitle>
                <CardDescription>Análises realizadas nos genótipos</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Genótipo</th>
                        <th scope="col" className="px-6 py-3">Tipo de Análise</th>
                        <th scope="col" className="px-6 py-3">Data</th>
                        <th scope="col" className="px-6 py-3">Laboratório</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analises.map((analise) => (
                        <tr key={analise.id} className="bg-white border-b hover:bg-gray-50">
                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {analise.id}
                          </th>
                          <td className="px-6 py-4">{analise.genotipo}</td>
                          <td className="px-6 py-4">{analise.tipoAnalise}</td>
                          <td className="px-6 py-4">{analise.dataAnalise}</td>
                          <td className="px-6 py-4">{analise.laboratorio}</td>
                          <td className="px-6 py-4">
                            {analise.status === "completo" ? (
                              <Badge className="bg-green-100 text-green-800">Completo</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">Em Análise</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <FileText className="h-4 w-4" />
                              </Button>
                              {analise.status === "completo" && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
                <div className="text-sm text-gray-500">Mostrando 3 de 3 resultados</div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Análise
                </Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Análise - ANG-001</CardTitle>
                  <CardDescription>Genótipo: Sativa CBD Alto (GEN-001)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Análise</p>
                      <p className="font-medium">Sequenciamento completo</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="font-medium">20/01/2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Laboratório</p>
                      <p className="font-medium">GenCannabis</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Pureza Genética</h3>
                      <Badge className="bg-green-100 text-green-800">98.5%</Badge>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500">Porcentagem de homozigose nos marcadores chave da linhagem</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Marcadores Identificados</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">CBDA Sintase</span>
                          <Badge variant="outline" className="text-xs">Homozigoto</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Variante de alto rendimento identificada</p>
                      </div>
                      
                      <div className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">THCA Sintase</span>
                          <Badge variant="outline" className="text-xs">Homozigoto</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Variante de baixa expressão</p>
                      </div>
                      
                      <div className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">CBG Sintase</span>
                          <Badge variant="outline" className="text-xs">Heterozigoto</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Múltiplas variantes presentes</p>
                      </div>
                      
                      <div className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Terpeno Sintase</span>
                          <Badge variant="outline" className="text-xs">Heterozigoto</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Expressão de mirceno predominante</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">154 marcadores moleculares identificados no total</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Estabilidade Genética</h3>
                    <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                      <div className="flex items-center mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-800">Alta Estabilidade</span>
                      </div>
                      <p className="text-xs text-green-700">
                        Os marcadores genéticos indicam alta estabilidade da linhagem, com expressão consistente dos 
                        genes-chave responsáveis pelo perfil desejado de canabinoides e terpenos.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Relatório Completo
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar Dados
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Perfil Genético</CardTitle>
                  <CardDescription>Visualização dos genes e alelos principais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gray-50 rounded-md border flex items-center justify-center">
                    <Dna className="h-12 w-12 text-gray-300" />
                    <span className="text-gray-400 ml-2">Mapa Genético Interativo</span>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-base mb-2">Análise Comparativa</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Comparação com outros genótipos do banco genético
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">96%</Badge>
                          <span className="text-sm font-medium">GEN-004</span>
                        </div>
                        <span className="text-xs text-gray-500">Linhagem Irmã</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">82%</Badge>
                          <span className="text-sm font-medium">GEN-007</span>
                        </div>
                        <span className="text-xs text-gray-500">Mesmo Parental</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-800">65%</Badge>
                          <span className="text-sm font-medium">GEN-012</span>
                        </div>
                        <span className="text-xs text-gray-500">Origem Similar</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium text-base mb-2">Recomendações</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <p className="text-sm">Selecionar para cruzamento com GEN-003 para introduzir característica de autoflorescimento</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <p className="text-sm">Manter programa de seleção para aumentar expressão de terpenos (mirceno e limoneno)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <p className="text-sm">Realizar análise de segregação na próxima geração para confirmação de estabilidade</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* TAB DE CRUZAMENTOS */}
          <TabsContent value="cruzamentos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cruzamentos.map((cruzamento) => (
                <Card key={cruzamento.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cruzamento.nome}</CardTitle>
                        <CardDescription>Cruzamento {cruzamento.id} - Geração {cruzamento.geracao}</CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Em Progresso</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Parental 1</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="font-mono">{cruzamento.parental1}</Badge>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Parental 2</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="font-mono">{cruzamento.parental2}</Badge>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Objetivo</p>
                      <p className="font-medium">{cruzamento.objetivo}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Progresso</p>
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Iniciado em {cruzamento.dataInicio}</span>
                          <span className="text-xs font-medium">{cruzamento.progressoEstimado}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${cruzamento.progressoEstimado}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Notas</p>
                      <p className="text-sm">{cruzamento.notas}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
                    <Button variant="outline" size="sm">
                      <History className="h-4 w-4 mr-1" />
                      Histórico
                    </Button>
                    <Button size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Gerenciar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card>
                <CardHeader>
                  <CardTitle>Novo Programa de Cruzamento</CardTitle>
                  <CardDescription>Crie um novo programa de cruzamento e melhoramento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome-cruzamento">Nome do Programa</Label>
                      <Input id="nome-cruzamento" placeholder="Ex: CBD Alto Autoflorescente" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="parental1">Parental 1</Label>
                        <select id="parental1" className="border rounded-md px-3 py-1.5 w-full">
                          <option value="">Selecione um genótipo</option>
                          <option value="GEN-001">GEN-001 (Sativa CBD Alto)</option>
                          <option value="GEN-002">GEN-002 (Indica Terapêutica)</option>
                          <option value="GEN-003">GEN-003 (Ruderalis Autoflorescente)</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="parental2">Parental 2</Label>
                        <select id="parental2" className="border rounded-md px-3 py-1.5 w-full">
                          <option value="">Selecione um genótipo</option>
                          <option value="GEN-001">GEN-001 (Sativa CBD Alto)</option>
                          <option value="GEN-002">GEN-002 (Indica Terapêutica)</option>
                          <option value="GEN-003">GEN-003 (Ruderalis Autoflorescente)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="objetivo-cruzamento">Objetivo</Label>
                      <Input id="objetivo-cruzamento" placeholder="Descreva o objetivo deste cruzamento" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="caracteristicas">Características Alvo</Label>
                      <div className="p-3 border rounded-md space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="carac1" className="h-4 w-4 text-primary" />
                          <Label htmlFor="carac1" className="text-sm">Alto Teor de CBD (&gt;12%)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="carac2" className="h-4 w-4 text-primary" />
                          <Label htmlFor="carac2" className="text-sm">Baixo Teor de THC (&lt;0.3%)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="carac3" className="h-4 w-4 text-primary" />
                          <Label htmlFor="carac3" className="text-sm">Autoflorescimento</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="carac4" className="h-4 w-4 text-primary" />
                          <Label htmlFor="carac4" className="text-sm">Resistência a Fungos</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="carac5" className="h-4 w-4 text-primary" />
                          <Label htmlFor="carac5" className="text-sm">Perfil Rico em Terpenos</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notas-cruzamento">Notas</Label>
                      <textarea 
                        id="notas-cruzamento" 
                        rows={3} 
                        className="border rounded-md px-3 py-1.5 w-full" 
                        placeholder="Notas adicionais sobre o cruzamento..."
                      ></textarea>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-end py-3">
                  <Button variant="outline" className="mr-2">Cancelar</Button>
                  <Button>Iniciar Programa</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* TAB DE BIBLIOTECA GENÉTICA */}
          <TabsContent value="biblioteca">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Biblioteca de Genes</CardTitle>
                    <CardDescription>Genes significativos identificados em Cannabis</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Função</th>
                            <th scope="col" className="px-6 py-3">Cromossomo</th>
                            <th scope="col" className="px-6 py-3">Variantes</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {genes.map((gene) => (
                            <tr key={gene.id} className="bg-white border-b hover:bg-gray-50">
                              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap font-mono">
                                {gene.id}
                              </th>
                              <td className="px-6 py-4 font-medium">{gene.nome}</td>
                              <td className="px-6 py-4">{gene.funcao}</td>
                              <td className="px-6 py-4">{gene.cromossomo}</td>
                              <td className="px-6 py-4">{gene.variantesConhecidas}</td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Github className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
                    <div className="text-sm text-gray-500">Mostrando 3 de 145 genes</div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-1" />
                        Filtrar
                      </Button>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Gene THCA Sintase (GENE-001)</CardTitle>
                    <CardDescription>Informações detalhadas sobre o gene e suas variantes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-medium mb-2">Descrição</h3>
                        <p className="text-sm text-gray-700">
                          O gene THCA Sintase codifica a enzima THCA sintase, responsável pela conversão do canabinóide precursor CBGA (ácido canabigerólico) em THCA (ácido tetrahidrocanabinólico), que quando descarboxilado se torna THC. As variantes deste gene afetam diretamente a quantidade de THC produzida na planta.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-2">Localização Genômica</h3>
                        <div className="p-3 border rounded-md">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Cromossomo</p>
                              <p className="font-medium">6</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Posição</p>
                              <p className="font-medium">12,453,678 - 12,458,792</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Tamanho</p>
                              <p className="font-medium">5,114 bp</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Exons</p>
                              <p className="font-medium">2</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <Github className="h-3 w-3" />
                            <span>Sequência disponível na base de dados genômica</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-2">Variantes Conhecidas</h3>
                        <div className="space-y-2">
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between">
                              <span className="font-medium">THCA-V1 (Alta Expressão)</span>
                              <Badge className="bg-green-100 text-green-800">Comum</Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Variante funcional com alta taxa de conversão de CBGA para THCA
                            </p>
                          </div>
                          
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between">
                              <span className="font-medium">THCA-V2 (Expressão Média)</span>
                              <Badge className="bg-amber-100 text-amber-800">Comum</Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Variante com eficiência moderada de conversão de CBGA para THCA
                            </p>
                          </div>
                          
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between">
                              <span className="font-medium">THCA-V3 (Baixa Expressão)</span>
                              <Badge className="bg-blue-100 text-blue-800">Rara</Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Variante com baixa eficiência ou enzima parcialmente funcional
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-2">Importância para Melhoramento</h3>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-700">
                          <p>
                            Este gene é crítico para programas de melhoramento que visam:
                          </p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Controlar o teor de THC para conformidade regulatória</li>
                            <li>Desenvolver variedades com baixo THC e alto CBD para fins medicinais</li>
                            <li>Manipular o perfil global de canabinoides para aplicações terapêuticas específicas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-1" />
                      Ver no Banco Genômico
                    </Button>
                    <Button size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Editar Informações
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Recursos de Pesquisa</CardTitle>
                    <CardDescription>Ferramentas e recursos para análise genética</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 border rounded-md flex items-center gap-3">
                      <div className="bg-purple-100 h-10 w-10 rounded-full flex items-center justify-center">
                        <Github className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Banco Genômico Cannabis</h3>
                        <p className="text-xs text-gray-500">Banco de dados de sequências genômicas</p>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-md flex items-center gap-3">
                      <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
                        <Dna className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">CannaMAPPER</h3>
                        <p className="text-xs text-gray-500">Ferramenta de análise e visualização genômica</p>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-md flex items-center gap-3">
                      <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Guia de Marcadores Moleculares</h3>
                        <p className="text-xs text-gray-500">Manual de referência para análise genética</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Agendamento de Análises</CardTitle>
                    <CardDescription>Próximas análises genéticas agendadas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Sequenciamento GEN-005</span>
                        <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
                      </div>
                      <p className="text-xs text-gray-500">10/05/2025 • GenCannabis</p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">PCR Marcadores CRZ-001</span>
                        <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
                      </div>
                      <p className="text-xs text-gray-500">15/05/2025 • Laboratório Interno</p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Análise de F2 CRZ-002</span>
                        <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>
                      </div>
                      <p className="text-xs text-gray-500">30/05/2025 • A definir</p>
                    </div>
                    
                    <Button className="w-full mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Agendar Nova Análise
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Estatísticas do Banco Genético</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Genótipos Registrados</span>
                      <span className="font-medium">28</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Análises Genéticas</span>
                      <span className="font-medium">42</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Cruzamentos Ativos</span>
                      <span className="font-medium">6</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Marcadores Identificados</span>
                      <span className="font-medium">289</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Genes Catalogados</span>
                      <span className="font-medium">145</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(GenericaPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});