import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Award, 
  Gift, 
  Settings, 
  FileText, 
  BarChart4, 
  Percent, 
  Building, 
  BarChart3,
  ArrowUpRight
} from "lucide-react";

const SuperAdminAfiliadosPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [programFilter, setProgramFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("month");

  // Dados simulados para demonstração
  const programs = [
    { 
      id: 1, 
      name: "Programa Associações", 
      activeUsers: 248, 
      totalPoints: 156750, 
      pointsRedeemed: 89250, 
      conversionRate: 32.5,
      type: "association"
    },
    { 
      id: 2, 
      name: "Programa Empresas", 
      activeUsers: 183, 
      totalPoints: 129800, 
      pointsRedeemed: 73400, 
      conversionRate: 28.7,
      type: "company"
    },
    { 
      id: 3, 
      name: "Programa ComplyPay SaaS", 
      activeUsers: 97, 
      totalPoints: 83200, 
      pointsRedeemed: 41300, 
      conversionRate: 43.2,
      type: "saas"
    }
  ];

  const topOrganizations = [
    { id: 1, name: "Abrace Associação", program: "association", points: 8750, referrals: 17 },
    { id: 2, name: "Canabidiol Brasil", program: "company", points: 6420, referrals: 12 },
    { id: 3, name: "Medical Cannabis Co.", program: "company", points: 5930, referrals: 10 },
    { id: 4, name: "Tech Solutions Inc.", program: "saas", points: 5480, referrals: 9 },
    { id: 5, name: "Ame+", program: "association", points: 4920, referrals: 8 },
  ];

  const recentRedemptions = [
    { id: 1, organization: "Canabidiol Brasil", program: "company", reward: "Desconto Premium (25%)", points: 2000, date: "03/05/2025" },
    { id: 2, organization: "Tech Solutions Inc.", program: "saas", reward: "Implementação Personalizada", points: 3500, date: "02/05/2025" },
    { id: 3, organization: "Abrace Associação", program: "association", reward: "Módulo Exclusivo de Relatórios", points: 1500, date: "01/05/2025" },
    { id: 4, organization: "Medical Cannabis Co.", program: "company", reward: "Suporte Prioritário (6 meses)", points: 1800, date: "30/04/2025" },
    { id: 5, organization: "DevPrime Software", program: "saas", reward: "Curso de Administração Avançada", points: 1200, date: "29/04/2025" },
  ];

  // Total de pontos e estatísticas do sistema
  const totalSystemPoints = programs.reduce((sum, program) => sum + program.totalPoints, 0);
  const totalRedeemedPoints = programs.reduce((sum, program) => sum + program.pointsRedeemed, 0);
  const totalActiveUsers = programs.reduce((sum, program) => sum + program.activeUsers, 0);
  const averageConversionRate = programs.reduce((sum, program) => sum + program.conversionRate, 0) / programs.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Programa de Afiliados - Administração</h1>
        <p className="text-muted-foreground">
          Gerencie todos os programas de afiliados da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total de Pontos</CardTitle>
            <CardDescription>Emitidos no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{totalSystemPoints.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pontos Resgatados</CardTitle>
            <CardDescription>Total de resgates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{totalRedeemedPoints.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Usuários Ativos</CardTitle>
            <CardDescription>Em todos os programas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalActiveUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Taxa de Conversão</CardTitle>
            <CardDescription>Média global</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Percent className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{averageConversionRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="programs">Programas</TabsTrigger>
          <TabsTrigger value="organizations">Organizações</TabsTrigger>
          <TabsTrigger value="rewards">Resgates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho dos Programas</CardTitle>
                <CardDescription>
                  Comparativo entre os três tipos de programas de afiliados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart4 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Gráfico comparativo de programas</p>
                    <p className="text-sm">(Dados visuais seriam exibidos aqui)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Organizações</CardTitle>
                <CardDescription>
                  Organizações com mais pontos acumulados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organização</TableHead>
                      <TableHead>Programa</TableHead>
                      <TableHead className="text-right">Pontos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topOrganizations.slice(0, 5).map(org => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>
                          {org.program === "association" ? "Associações" :
                           org.program === "company" ? "Empresas" : "SaaS"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{org.points.toLocaleString()}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ver Relatório Completo
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Recentes</CardTitle>
              <CardDescription>
                Dados dos últimos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Novos participantes</span>
                    <span className="font-medium">87</span>
                  </div>
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>12% maior que mês anterior</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pontos emitidos</span>
                    <span className="font-medium">23.450</span>
                  </div>
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>8% maior que mês anterior</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor economizado</span>
                    <span className="font-medium">R$ 47.320,00</span>
                  </div>
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>15% maior que mês anterior</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="flex justify-between">
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrar por tipo de programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os programas</SelectItem>
                <SelectItem value="association">Programa Associações</SelectItem>
                <SelectItem value="company">Programa Empresas</SelectItem>
                <SelectItem value="saas">Programa ComplyPay SaaS</SelectItem>
              </SelectContent>
            </Select>
            
            <Button>
              <Settings className="mr-2 h-4 w-4" /> Configurações
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {programs.filter(p => programFilter === "all" || p.type === programFilter).map(program => (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{program.name}</CardTitle>
                      <CardDescription>
                        {program.type === "association" ? "Programa para associações de pacientes" :
                         program.type === "company" ? "Programa para empresas e fornecedores" :
                         "Programa para clientes da plataforma SaaS"}
                      </CardDescription>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      {program.type === "association" ? 
                        <Users className="h-6 w-6 text-primary" /> :
                       program.type === "company" ? 
                        <Building className="h-6 w-6 text-primary" /> :
                        <BarChart3 className="h-6 w-6 text-primary" />
                      }
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                      <p className="text-xl font-medium">{program.activeUsers}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total de Pontos</p>
                      <p className="text-xl font-medium">{program.totalPoints.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Pontos Resgatados</p>
                      <p className="text-xl font-medium">{program.pointsRedeemed.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-xl font-medium">{program.conversionRate}%</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" /> Relatório Detalhado
                  </Button>
                  <Button>
                    <Settings className="mr-2 h-4 w-4" /> Gerenciar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <div className="flex justify-between">
            <Input 
              placeholder="Buscar organização..." 
              className="max-w-xs"
            />
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Exportar Dados
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organização</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Indicações</TableHead>
                    <TableHead>Pontos Acumulados</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topOrganizations.map(org => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>
                        {org.program === "association" ? "Associações" :
                         org.program === "company" ? "Empresas" : "SaaS"}
                      </TableCell>
                      <TableCell>{org.referrals}</TableCell>
                      <TableCell>{org.points.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-between">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
            
            <Button>
              <Settings className="mr-2 h-4 w-4" /> Gerenciar Benefícios
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organização</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Benefício Resgatado</TableHead>
                    <TableHead>Pontos Utilizados</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRedemptions.map(redemption => (
                    <TableRow key={redemption.id}>
                      <TableCell className="font-medium">{redemption.organization}</TableCell>
                      <TableCell>
                        {redemption.program === "association" ? "Associações" :
                         redemption.program === "company" ? "Empresas" : "SaaS"}
                      </TableCell>
                      <TableCell>{redemption.reward}</TableCell>
                      <TableCell>{redemption.points.toLocaleString()}</TableCell>
                      <TableCell>{redemption.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminAfiliadosPage;