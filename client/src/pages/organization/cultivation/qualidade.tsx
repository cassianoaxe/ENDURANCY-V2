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
  Check, 
  X, 
  AlertTriangle, 
  FileText, 
  FlaskConical, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Beaker, 
  Plus, 
  Calendar, 
  BarChart2,
  CheckCircle2,
  Clock,
  FileDown,
  Scale,
  Microscope,
  GraduationCap,
  Leaf,
  Settings
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const QualidadePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  
  // Dados simulados de análises
  const analises = [
    {
      id: "ANL-001",
      lote: "CLT-001",
      strain: "Cannabis Sativa",
      dataColeta: "20/04/2025",
      dataAnalise: "22/04/2025",
      tipoAnalise: "Canabinoides",
      status: "completo",
      resultado: {
        thc: 0.28,
        cbd: 12.5,
        cbn: 0.1,
        terpenos: 3.2
      }
    },
    {
      id: "ANL-002",
      lote: "CLT-002",
      strain: "Cannabis Indica",
      dataColeta: "15/04/2025",
      dataAnalise: "18/04/2025",
      tipoAnalise: "Microbiológica",
      status: "completo",
      resultado: {
        aprovado: true,
        observacoes: "Dentro dos parâmetros aceitáveis"
      }
    },
    {
      id: "ANL-003",
      lote: "CLT-003",
      strain: "Cannabis Ruderalis",
      dataColeta: "25/04/2025",
      dataAnalise: "27/04/2025",
      tipoAnalise: "Metais Pesados",
      status: "em_analise",
      resultado: null
    }
  ];
  
  // Dados simulados de certificados
  const certificados = [
    {
      id: "CERT-001",
      lote: "CLT-001",
      tipoAnalise: "Canabinoides",
      dataEmissao: "23/04/2025",
      validade: "23/04/2026",
      laboratorio: "LabCannabis Brasil",
      status: "válido"
    },
    {
      id: "CERT-002",
      lote: "CLT-002",
      tipoAnalise: "Microbiológica",
      dataEmissao: "19/04/2025",
      validade: "19/04/2026",
      laboratorio: "LabCannabis Brasil",
      status: "válido"
    }
  ];
  
  // Dados simulados de padrões de qualidade
  const padroes = [
    {
      id: 1,
      nome: "Padrão Anvisa RDC 660",
      categoria: "Regulatório",
      parametros: [
        { nome: "THC", maximo: 0.3, unidade: "%" },
        { nome: "Chumbo", maximo: 0.5, unidade: "ppm" },
        { nome: "Aflatoxinas", maximo: 20, unidade: "ppb" }
      ]
    },
    {
      id: 2,
      nome: "Padrão Interno Premium",
      categoria: "Interno",
      parametros: [
        { nome: "CBD", minimo: 12, unidade: "%" },
        { nome: "Terpenos", minimo: 3, unidade: "%" },
        { nome: "Umidade", maximo: 10, unidade: "%" }
      ]
    }
  ];
  
  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Controle de Qualidade</h1>
            <p className="text-gray-600 mt-1">Gestão de análises e certificados de qualidade da produção</p>
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
              <span>Nova Análise</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="analises" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="analises">Análises</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
            <TabsTrigger value="laboratorios">Laboratórios</TabsTrigger>
            <TabsTrigger value="padroes">Padrões de Qualidade</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar análises..."
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
                <option value="todos">Todos os Tipos</option>
                <option value="canabinoides">Canabinoides</option>
                <option value="microbiologica">Microbiológica</option>
                <option value="metais">Metais Pesados</option>
                <option value="terpenos">Terpenos</option>
                <option value="pesticidas">Pesticidas</option>
              </select>
            </div>
          </div>
          
          {/* TAB DE ANÁLISES */}
          <TabsContent value="analises">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Análises Recentes</CardTitle>
                <CardDescription>Análises realizadas nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Tipo de Análise</th>
                        <th scope="col" className="px-6 py-3">Data da Coleta</th>
                        <th scope="col" className="px-6 py-3">Data da Análise</th>
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
                          <td className="px-6 py-4">{analise.lote}</td>
                          <td className="px-6 py-4">{analise.tipoAnalise}</td>
                          <td className="px-6 py-4">{analise.dataColeta}</td>
                          <td className="px-6 py-4">{analise.dataAnalise || "-"}</td>
                          <td className="px-6 py-4">
                            {analise.status === "completo" ? (
                              <Badge className="bg-green-100 text-green-800">Completo</Badge>
                            ) : analise.status === "em_analise" ? (
                              <Badge className="bg-blue-100 text-blue-800">Em Análise</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <FileText className="h-4 w-4" />
                              </Button>
                              {analise.status === "completo" && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <FileDown className="h-4 w-4" />
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
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise Detalhada</CardTitle>
                  <CardDescription>Visualização dos resultados da análise ANL-001</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Lote</p>
                        <p className="font-medium">CLT-001</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Strain</p>
                        <p className="font-medium">Cannabis Sativa</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p className="font-medium">Canabinoides</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-base mb-3">Resultados da Análise</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <Scale className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">THC</p>
                              <p className="text-xs text-gray-500">Limite Legal: 0.3%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">0.28%</span>
                            <CheckCircle2 className="h-4 w-4 text-green-600 ml-1" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <Scale className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">CBD</p>
                              <p className="text-xs text-gray-500">Alvo: &gt;10%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">12.5%</span>
                            <CheckCircle2 className="h-4 w-4 text-green-600 ml-1" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <Scale className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">CBN</p>
                              <p className="text-xs text-gray-500">Informativo</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">0.1%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center">
                              <Scale className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">Terpenos Totais</p>
                              <p className="text-xs text-gray-500">Alvo: &gt;2%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">3.2%</span>
                            <CheckCircle2 className="h-4 w-4 text-green-600 ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Laboratório</p>
                        <p className="font-medium">LabCannabis Brasil</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Responsável Técnico</p>
                        <p className="font-medium">Dr. Maria Santos (CRF: 12345)</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Data da Análise</p>
                        <p className="font-medium">22/04/2025</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Resultado Final</p>
                        <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
                  <Button variant="outline" size="sm">Ver Histórico</Button>
                  <Button size="sm">Exportar Relatório</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Componentes</CardTitle>
                  <CardDescription>Composição da amostra ANL-001</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-md border flex items-center justify-center">
                    <BarChart2 className="h-12 w-12 text-gray-300" />
                    <span className="text-gray-400 ml-2">Gráfico de Canabinoides</span>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-base mb-3">Interpretação dos Resultados</h3>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                      <p className="text-blue-800 mb-2">
                        <strong>Análise de Conformidade:</strong>
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-blue-700">
                        <li>A amostra apresenta teor de THC dentro do limite legal (abaixo de 0.3%)</li>
                        <li>O teor de CBD está acima do padrão esperado para uso medicinal (acima de 10%)</li>
                        <li>Perfil de terpenos indica presença adequada de mirceno, limoneno e pineno</li>
                        <li>Não foram detectados contaminantes microbiológicos ou metais pesados</li>
                      </ul>
                      <p className="text-blue-800 mt-2">
                        <strong>Conclusão:</strong> Produto aprovado para uso medicinal conforme RDC 660.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-base mb-2">Próximas Etapas</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Emissão de certificado de análise</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Liberação do lote para processamento</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm">Agendamento de análise de estabilidade (em 90 dias)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* TAB DE CERTIFICADOS */}
          <TabsContent value="certificados">
            <Card>
              <CardHeader>
                <CardTitle>Certificados de Análise</CardTitle>
                <CardDescription>Documentos oficiais de certificação de qualidade</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Lote</th>
                        <th scope="col" className="px-6 py-3">Tipo de Análise</th>
                        <th scope="col" className="px-6 py-3">Laboratório</th>
                        <th scope="col" className="px-6 py-3">Data de Emissão</th>
                        <th scope="col" className="px-6 py-3">Validade</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificados.map((certificado) => (
                        <tr key={certificado.id} className="bg-white border-b hover:bg-gray-50">
                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {certificado.id}
                          </th>
                          <td className="px-6 py-4">{certificado.lote}</td>
                          <td className="px-6 py-4">{certificado.tipoAnalise}</td>
                          <td className="px-6 py-4">{certificado.laboratorio}</td>
                          <td className="px-6 py-4">{certificado.dataEmissao}</td>
                          <td className="px-6 py-4">{certificado.validade}</td>
                          <td className="px-6 py-4">
                            <Badge className="bg-green-100 text-green-800">Válido</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4" />
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
                <div className="text-sm text-gray-500">Mostrando 2 de 2 resultados</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Enviar Novo Certificado</CardTitle>
                <CardDescription>Faça o upload de um certificado emitido por laboratório parceiro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lote-id">Lote</Label>
                      <select id="lote-id" className="border rounded-md px-3 py-1.5 w-full">
                        <option value="">Selecione o lote</option>
                        <option value="CLT-001">CLT-001 (Cannabis Sativa)</option>
                        <option value="CLT-002">CLT-002 (Cannabis Indica)</option>
                        <option value="CLT-003">CLT-003 (Cannabis Ruderalis)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo-analise">Tipo de Análise</Label>
                      <select id="tipo-analise" className="border rounded-md px-3 py-1.5 w-full">
                        <option value="">Selecione o tipo</option>
                        <option value="canabinoides">Canabinoides</option>
                        <option value="microbiologica">Microbiológica</option>
                        <option value="metais">Metais Pesados</option>
                        <option value="terpenos">Terpenos</option>
                        <option value="pesticidas">Pesticidas</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lab-name">Laboratório</Label>
                      <select id="lab-name" className="border rounded-md px-3 py-1.5 w-full">
                        <option value="">Selecione o laboratório</option>
                        <option value="lab1">LabCannabis Brasil</option>
                        <option value="lab2">BioAnalítica</option>
                        <option value="lab3">CentroLab Análises</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data-emissao">Data de Emissão</Label>
                      <Input type="date" id="data-emissao" className="w-full" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="certificado-upload">Arquivo do Certificado (PDF)</Label>
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="certificado-upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-medium">Clique para fazer upload</span> ou arraste e solte
                          </p>
                          <p className="text-xs text-gray-500">PDF, JPG ou PNG (máx. 10MB)</p>
                        </div>
                        <input id="certificado-upload" type="file" className="hidden" />
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <textarea 
                      id="observacoes" 
                      rows={3} 
                      className="border rounded-md px-3 py-1.5 w-full" 
                      placeholder="Informações adicionais sobre o certificado..."
                    ></textarea>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-end py-3">
                <Button variant="outline" className="mr-2">Cancelar</Button>
                <Button>Enviar Certificado</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* TAB DE LABORATÓRIOS */}
          <TabsContent value="laboratorios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Laboratórios Parceiros</CardTitle>
                  <CardDescription>Laboratórios credenciados para análises</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 border-b flex items-start">
                    <div className="h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <Microscope className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">LabCannabis Brasil</h3>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Laboratório especializado em análises de cannabis medicinal. Credenciado pela Anvisa.
                      </p>
                      <div className="flex gap-4 text-sm mt-2">
                        <div>
                          <p className="text-gray-500">Análises Disponíveis:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Canabinoides</Badge>
                            <Badge variant="outline" className="text-xs">Terpenos</Badge>
                            <Badge variant="outline" className="text-xs">Microbiológica</Badge>
                            <Badge variant="outline" className="text-xs">Metais Pesados</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-b flex items-start">
                    <div className="h-12 w-12 rounded-md bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <Microscope className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">BioAnalítica</h3>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Laboratório com foco em pesquisa e controle de qualidade de produtos naturais.
                      </p>
                      <div className="flex gap-4 text-sm mt-2">
                        <div>
                          <p className="text-gray-500">Análises Disponíveis:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Canabinoides</Badge>
                            <Badge variant="outline" className="text-xs">Microbiológica</Badge>
                            <Badge variant="outline" className="text-xs">Pesticidas</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-start">
                    <div className="h-12 w-12 rounded-md bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <Microscope className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">CentroLab Análises</h3>
                        <Badge className="bg-yellow-100 text-yellow-800">Em Credenciamento</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Laboratório em processo de credenciamento para análises de cannabis medicinal.
                      </p>
                      <div className="flex gap-4 text-sm mt-2">
                        <div>
                          <p className="text-gray-500">Análises Disponíveis:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Canabinoides</Badge>
                            <Badge variant="outline" className="text-xs">Terpenos</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t py-3">
                  <Button size="sm" className="ml-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Laboratório
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Programação de Análises</CardTitle>
                  <CardDescription>Calendário de coletas e análises programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <h3 className="font-medium">Maio 2025</h3>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                            <span className="font-medium text-blue-800">05</span>
                          </div>
                          <div>
                            <p className="font-medium">Coleta para Análise de Canabinoides</p>
                            <p className="text-xs text-gray-500">Lote CLT-004 • LabCannabis Brasil</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                            <span className="font-medium text-blue-800">12</span>
                          </div>
                          <div>
                            <p className="font-medium">Coleta para Análise Microbiológica</p>
                            <p className="text-xs text-gray-500">Lote CLT-005 • BioAnalítica</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                            <span className="font-medium text-blue-800">20</span>
                          </div>
                          <div>
                            <p className="font-medium">Análise de Estabilidade</p>
                            <p className="text-xs text-gray-500">Lote CLT-001 • LabCannabis Brasil</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium text-base mb-2">Adicionar Nova Análise</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="programacao-lote">Lote</Label>
                          <select id="programacao-lote" className="border rounded-md px-3 py-1.5 w-full text-sm">
                            <option value="">Selecione o lote</option>
                            <option value="CLT-001">CLT-001</option>
                            <option value="CLT-002">CLT-002</option>
                            <option value="CLT-003">CLT-003</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="programacao-tipo">Tipo de Análise</Label>
                          <select id="programacao-tipo" className="border rounded-md px-3 py-1.5 w-full text-sm">
                            <option value="">Selecione o tipo</option>
                            <option value="canabinoides">Canabinoides</option>
                            <option value="microbiologica">Microbiológica</option>
                            <option value="metais">Metais Pesados</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="programacao-data">Data Programada</Label>
                          <Input type="date" id="programacao-data" className="w-full text-sm" />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="programacao-lab">Laboratório</Label>
                          <select id="programacao-lab" className="border rounded-md px-3 py-1.5 w-full text-sm">
                            <option value="">Selecione o laboratório</option>
                            <option value="lab1">LabCannabis Brasil</option>
                            <option value="lab2">BioAnalítica</option>
                          </select>
                        </div>
                      </div>
                      <Button className="w-full mt-3">Agendar Análise</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* TAB DE PADRÕES DE QUALIDADE */}
          <TabsContent value="padroes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Padrões de Qualidade</CardTitle>
                  <CardDescription>Parâmetros e limites para análises de qualidade</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {padroes.map((padrao, index) => (
                    <div key={padrao.id} className={`p-4 ${index < padroes.length - 1 ? 'border-b' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {padrao.categoria === 'Regulatório' ? (
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Beaker className="h-5 w-5 text-green-600" />
                          )}
                          <h3 className="font-medium">{padrao.nome}</h3>
                        </div>
                        <Badge 
                          className={padrao.categoria === 'Regulatório' ? 
                            'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'
                          }
                        >
                          {padrao.categoria}
                        </Badge>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left">Parâmetro</th>
                            <th scope="col" className="px-4 py-2 text-left">Valor Mínimo</th>
                            <th scope="col" className="px-4 py-2 text-left">Valor Máximo</th>
                            <th scope="col" className="px-4 py-2 text-left">Unidade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {padrao.parametros.map((parametro, i) => (
                            <tr key={i} className="border-b">
                              <td className="px-4 py-2 font-medium">{parametro.nome}</td>
                              <td className="px-4 py-2">{parametro.minimo || "-"}</td>
                              <td className="px-4 py-2">{parametro.maximo || "-"}</td>
                              <td className="px-4 py-2">{parametro.unidade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-end mt-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="bg-gray-50 border-t py-3">
                  <Button size="sm" className="ml-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Padrão
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Novo Padrão</CardTitle>
                  <CardDescription>Defina um novo conjunto de parâmetros de qualidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="padrao-nome">Nome do Padrão</Label>
                      <Input id="padrao-nome" placeholder="Ex: Padrão Premium CBD" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="padrao-categoria">Categoria</Label>
                      <select id="padrao-categoria" className="border rounded-md px-3 py-1.5 w-full">
                        <option value="">Selecione a categoria</option>
                        <option value="regulatorio">Regulatório</option>
                        <option value="interno">Interno</option>
                        <option value="cliente">Específico para Cliente</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Parâmetros</Label>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Parâmetro
                        </Button>
                      </div>
                      
                      <div className="p-3 border rounded-md space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label htmlFor="param-nome-1" className="text-xs">Nome</Label>
                            <Input id="param-nome-1" placeholder="THC" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-min-1" className="text-xs">Valor Mínimo</Label>
                            <Input id="param-min-1" type="number" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-max-1" className="text-xs">Valor Máximo</Label>
                            <Input id="param-max-1" type="number" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-unit-1" className="text-xs">Unidade</Label>
                            <Input id="param-unit-1" placeholder="%" className="mt-1" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label htmlFor="param-nome-2" className="text-xs">Nome</Label>
                            <Input id="param-nome-2" placeholder="CBD" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-min-2" className="text-xs">Valor Mínimo</Label>
                            <Input id="param-min-2" type="number" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-max-2" className="text-xs">Valor Máximo</Label>
                            <Input id="param-max-2" type="number" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-unit-2" className="text-xs">Unidade</Label>
                            <Input id="param-unit-2" placeholder="%" className="mt-1" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label htmlFor="param-nome-3" className="text-xs">Nome</Label>
                            <Input id="param-nome-3" placeholder="Terpenos" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-min-3" className="text-xs">Valor Mínimo</Label>
                            <Input id="param-min-3" type="number" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-max-3" className="text-xs">Valor Máximo</Label>
                            <Input id="param-max-3" type="number" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="param-unit-3" className="text-xs">Unidade</Label>
                            <Input id="param-unit-3" placeholder="%" className="mt-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="padrao-descricao">Descrição</Label>
                      <textarea 
                        id="padrao-descricao" 
                        rows={3} 
                        className="border rounded-md px-3 py-1.5 w-full" 
                        placeholder="Descrição dos critérios e aplicação deste padrão..."
                      ></textarea>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-end py-3">
                  <Button variant="outline" className="mr-2">Cancelar</Button>
                  <Button>Salvar Padrão</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(QualidadePage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});