import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
// Removendo import do OrganizationLayout para evitar a renderização duplicada
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Image,
  Video,
  File,
  Folder,
  FolderPlus,
  Upload,
  Download,
  Share2,
  Trash,
  Search,
  Grid,
  List,
  Filter,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  Eye,
  Edit,
  Clock,
  Plus,
  RefreshCw
} from "lucide-react";

export default function ArquivosPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  // Dados simulados para arquivos (em uma implementação real, viriam da API)
  const files = [
    {
      id: 1,
      name: "Relatório Trimestral.pdf",
      type: "pdf",
      size: "2.5 MB",
      lastModified: "15/04/2025",
      owner: "Maria Silva",
      shared: true,
      tags: ["relatórios", "financeiro"]
    },
    {
      id: 2,
      name: "Logo da Empresa.png",
      type: "image",
      size: "843 KB",
      lastModified: "10/04/2025",
      owner: "João Costa",
      shared: false,
      tags: ["marketing", "branding"]
    },
    {
      id: 3,
      name: "Apresentação de Resultados.pptx",
      type: "presentation",
      size: "5.1 MB",
      lastModified: "08/04/2025",
      owner: "Ana Ribeiro",
      shared: true,
      tags: ["apresentações", "resultados"]
    },
    {
      id: 4,
      name: "Contrato de Fornecimento.docx",
      type: "document",
      size: "1.2 MB",
      lastModified: "05/04/2025",
      owner: "Carlos Santos",
      shared: true,
      tags: ["jurídico", "contratos"]
    },
    {
      id: 5,
      name: "Vídeo Institucional.mp4",
      type: "video",
      size: "45.8 MB",
      lastModified: "01/04/2025",
      owner: "Departamento de Marketing",
      shared: false,
      tags: ["marketing", "institucional"]
    },
    {
      id: 6,
      name: "Planilha de Custos.xlsx",
      type: "spreadsheet",
      size: "1.8 MB",
      lastModified: "28/03/2025",
      owner: "Departamento Financeiro",
      shared: true,
      tags: ["financeiro", "orçamento"]
    },
    {
      id: 7,
      name: "Manual do Produto.pdf",
      type: "pdf",
      size: "4.2 MB",
      lastModified: "25/03/2025",
      owner: "Departamento Técnico",
      shared: false,
      tags: ["produtos", "manuais"]
    },
    {
      id: 8,
      name: "Fotos do Evento.zip",
      type: "archive",
      size: "78.3 MB",
      lastModified: "20/03/2025",
      owner: "Departamento de Eventos",
      shared: true,
      tags: ["eventos", "fotos"]
    }
  ];

  // Filtrar arquivos com base na aba ativa e termo de pesquisa
  const getFilteredFiles = () => {
    return files.filter(file => {
      // Filtrar por texto
      const matchesSearch = searchTerm === "" || 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrar por tipo (aba)
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "documents" && (file.type === "pdf" || file.type === "document")) ||
        (activeTab === "images" && file.type === "image") ||
        (activeTab === "videos" && file.type === "video") ||
        (activeTab === "shared" && file.shared);
      
      return matchesSearch && matchesTab;
    });
  };

  const filteredFiles = getFilteredFiles();

  // Função para obter o ícone adequado para cada tipo de arquivo
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
      case "document":
        return <FileText className="h-10 w-10 text-blue-500" />;
      case "image":
        return <Image className="h-10 w-10 text-purple-500" />;
      case "video":
        return <Video className="h-10 w-10 text-red-500" />;
      case "presentation":
        return <FileText className="h-10 w-10 text-orange-500" />;
      case "spreadsheet":
        return <FileText className="h-10 w-10 text-green-500" />;
      case "archive":
        return <File className="h-10 w-10 text-gray-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  // Estatísticas de armazenamento
  const storageStats = {
    used: 256, // em MB
    total: 1024, // em MB
    percentage: 25
  };

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Arquivos e Mídias</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus documentos, imagens, vídeos e outros arquivos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FolderPlus className="mr-2 h-4 w-4" />
              Nova Pasta
            </Button>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Armazenamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Usado: {storageStats.used} MB</span>
                      <span>{storageStats.percentage}%</span>
                    </div>
                    <Progress value={storageStats.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {storageStats.used} MB de {storageStats.total} MB usados
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pastas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Folder className="mr-2 h-4 w-4 text-blue-500" />
                      Todos os Arquivos
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Folder className="mr-2 h-4 w-4 text-yellow-500" />
                      Documentos
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Folder className="mr-2 h-4 w-4 text-purple-500" />
                      Imagens
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Folder className="mr-2 h-4 w-4 text-red-500" />
                      Vídeos
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Folder className="mr-2 h-4 w-4 text-green-500" />
                      Marketing
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Folder className="mr-2 h-4 w-4 text-orange-500" />
                      Financeiro
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Share2 className="mr-2 h-4 w-4 text-indigo-500" />
                      Compartilhados Comigo
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Pasta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">relatórios</Badge>
                    <Badge variant="outline">financeiro</Badge>
                    <Badge variant="outline">marketing</Badge>
                    <Badge variant="outline">branding</Badge>
                    <Badge variant="outline">apresentações</Badge>
                    <Badge variant="outline">jurídico</Badge>
                    <Badge variant="outline">contratos</Badge>
                    <Badge variant="outline">produtos</Badge>
                    <Badge variant="outline">manuais</Badge>
                    <Badge variant="outline">eventos</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Meus Arquivos</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={viewMode === "grid" ? "default" : "outline"} 
                      size="icon"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === "list" ? "default" : "outline"} 
                      size="icon"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar arquivos..."
                        className="pl-8 w-[200px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid grid-cols-5">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                    <TabsTrigger value="images">Imagens</TabsTrigger>
                    <TabsTrigger value="videos">Vídeos</TabsTrigger>
                    <TabsTrigger value="shared">Compartilhados</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="space-y-4">
                    {filteredFiles.length > 0 ? (
                      viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {filteredFiles.map((file) => (
                            <Card key={file.id} className="overflow-hidden">
                              <div className="p-4 flex items-center justify-center bg-muted h-36">
                                {getFileIcon(file.type)}
                              </div>
                              <CardContent className="p-4">
                                <div className="truncate font-medium mb-1">{file.name}</div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{file.size}</span>
                                  <span>{file.lastModified}</span>
                                </div>
                              </CardContent>
                              <CardFooter className="p-2 flex justify-end border-t">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-3 text-left font-medium">Nome</th>
                                <th className="px-4 py-3 text-left font-medium">Tamanho</th>
                                <th className="px-4 py-3 text-left font-medium">Modificado</th>
                                <th className="px-4 py-3 text-left font-medium">Proprietário</th>
                                <th className="px-4 py-3 text-right font-medium">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredFiles.map((file) => (
                                <tr key={file.id} className="border-b">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      <div className="mr-2">
                                        {getFileIcon(file.type)}
                                      </div>
                                      <div>
                                        <div className="font-medium">{file.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {file.tags.map((tag, i) => (
                                            <span key={tag}>
                                              {tag}{i < file.tags.length - 1 ? ', ' : ''}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">{file.size}</td>
                                  <td className="px-4 py-3">{file.lastModified}</td>
                                  <td className="px-4 py-3">{file.owner}</td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end">
                                      <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                        <Share2 className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <File className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum arquivo encontrado</h3>
                        <p className="text-muted-foreground text-center mb-6">
                          Não foram encontrados arquivos com os filtros atuais.
                        </p>
                        <Button>
                          <Upload className="mr-2 h-4 w-4" />
                          Fazer Upload
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="border-t p-4 text-sm text-muted-foreground">
                {filteredFiles.length} arquivo(s) encontrado(s)
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
  );
}