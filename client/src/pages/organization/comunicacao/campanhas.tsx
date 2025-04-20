import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Send,
  Plus,
  Search,
  Mail,
  BarChart2,
  Clock,
  Users,
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  Edit,
  Trash,
  Filter,
  Download,
  Copy
} from "lucide-react";

export default function CampanhasEmail() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dados de exemplo para campanhas (em uma implementação real, viriam da API)
  const campaigns = [
    {
      id: 1,
      title: "Newsletter Mensal - Abril 2025",
      status: "sent",
      sentDate: "05/04/2025",
      sentTime: "09:30",
      recipients: 358,
      opens: 198,
      clicks: 56,
      openRate: 55.3,
      clickRate: 15.6,
      tags: ["newsletter", "mensal"]
    },
    {
      id: 2,
      title: "Comunicado - Novos Produtos",
      status: "sent",
      sentDate: "15/04/2025",
      sentTime: "14:00",
      recipients: 422,
      opens: 245,
      clicks: 78,
      openRate: 58.1,
      clickRate: 18.5,
      tags: ["produtos", "lançamento"]
    },
    {
      id: 3,
      title: "Atualização de Políticas",
      status: "sent",
      sentDate: "10/04/2025",
      sentTime: "11:15",
      recipients: 512,
      opens: 328,
      clicks: 97,
      openRate: 64.1,
      clickRate: 18.9,
      tags: ["políticas", "atualizações"]
    },
    {
      id: 4,
      title: "Pesquisa de Satisfação",
      status: "draft",
      sentDate: "-",
      sentTime: "-",
      recipients: 0,
      opens: 0,
      clicks: 0,
      openRate: 0,
      clickRate: 0,
      tags: ["pesquisa", "feedback"]
    },
    {
      id: 5,
      title: "Evento de Lançamento",
      status: "scheduled",
      sentDate: "25/04/2025",
      sentTime: "08:00",
      recipients: 510,
      opens: 0,
      clicks: 0,
      openRate: 0,
      clickRate: 0,
      tags: ["evento", "lançamento"]
    },
    {
      id: 6,
      title: "Promoção de Verão",
      status: "draft",
      sentDate: "-",
      sentTime: "-",
      recipients: 0,
      opens: 0,
      clicks: 0,
      openRate: 0,
      clickRate: 0,
      tags: ["promoção", "verão"]
    }
  ];

  // Filtrar campanhas com base na pesquisa e filtro de status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchTerm === "" || 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas gerais de campanhas
  const stats = {
    totalCampaigns: campaigns.length,
    sentCampaigns: campaigns.filter(c => c.status === "sent").length,
    scheduledCampaigns: campaigns.filter(c => c.status === "scheduled").length,
    draftCampaigns: campaigns.filter(c => c.status === "draft").length,
    averageOpenRate: campaigns.filter(c => c.status === "sent").reduce((acc, curr) => acc + curr.openRate, 0) / 
      campaigns.filter(c => c.status === "sent").length,
    averageClickRate: campaigns.filter(c => c.status === "sent").reduce((acc, curr) => acc + curr.clickRate, 0) / 
      campaigns.filter(c => c.status === "sent").length,
    totalRecipients: campaigns.reduce((acc, curr) => acc + curr.recipients, 0)
  };

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Campanhas de Email</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie e acompanhe o desempenho das suas campanhas de email
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <div className="flex mt-1">
                <Badge variant="outline" className="mr-1">
                  <span className="text-green-600">{stats.sentCampaigns} enviadas</span>
                </Badge>
                <Badge variant="outline" className="mr-1">
                  <span className="text-blue-600">{stats.scheduledCampaigns} agendadas</span>
                </Badge>
                <Badge variant="outline">
                  <span className="text-gray-600">{stats.draftCampaigns} rascunhos</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa Média de Abertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageOpenRate.toFixed(1)}%</div>
              <Progress value={stats.averageOpenRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Baseado em campanhas enviadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa Média de Cliques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageClickRate.toFixed(1)}%</div>
              <Progress value={stats.averageClickRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Baseado em campanhas enviadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Destinatários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecipients}</div>
              <p className="text-xs text-muted-foreground mt-1">Em todas as campanhas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Campanhas</CardTitle>
            <CardDescription>
              Gerencie e monitore todas as suas campanhas de email
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar campanhas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="w-full md:w-[200px]">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Aberturas</TableHead>
                    <TableHead>Cliques</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.title}</TableCell>
                      <TableCell>
                        {campaign.status === "sent" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">Enviada</Badge>
                        )}
                        {campaign.status === "scheduled" && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">Agendada</Badge>
                        )}
                        {campaign.status === "draft" && (
                          <Badge variant="outline">Rascunho</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {campaign.sentDate !== "-" ? `${campaign.sentDate} às ${campaign.sentTime}` : "-"}
                      </TableCell>
                      <TableCell>{campaign.recipients}</TableCell>
                      <TableCell>
                        {campaign.status === "sent" ? (
                          <div className="flex items-center">
                            <span className="mr-2">{campaign.openRate}%</span>
                            <span className="text-xs text-muted-foreground">({campaign.opens})</span>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {campaign.status === "sent" ? (
                          <div className="flex items-center">
                            <span className="mr-2">{campaign.clickRate}%</span>
                            <span className="text-xs text-muted-foreground">({campaign.clicks})</span>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {campaign.status === "sent" && (
                            <Button variant="outline" size="sm">
                              <BarChart2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {campaign.status !== "sent" && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Campanha</CardTitle>
              <CardDescription>Compare o desempenho das suas campanhas enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <BarChart2 className="h-16 w-16 text-muted-foreground" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Gráfico de Desempenho</h3>
                  <p className="text-muted-foreground">
                    Visualize estatísticas detalhadas de desempenho para cada campanha enviada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Contatos</CardTitle>
              <CardDescription>Gerencie os contatos para suas campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Lista Principal</div>
                    <div className="text-xs text-muted-foreground">1245 contatos</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Clientes Premium</div>
                    <div className="text-xs text-muted-foreground">458 contatos</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Newsletter</div>
                    <div className="text-xs text-muted-foreground">782 contatos</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">Leads</div>
                    <div className="text-xs text-muted-foreground">349 contatos</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar
                  </Button>
                </div>

                <Button className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Lista de Contatos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}