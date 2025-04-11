import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  FileText,
  Download,
  Edit,
  Trash2,
  Package,
  Copy,
  CheckCircle,
  XCircle,
  FileImage,
  BarChart2,
  Tag,
  Image,
  List,
  Layers,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Tipos de dados
type ProductCategory =
  | "oleo"
  | "tintura"
  | "capsulas"
  | "topico"
  | "comestivel"
  | "materia_prima"
  | "outro";

type ProductStatus = "ativo" | "inativo" | "descontinuado" | "em_desenvolvimento";

type Product = {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description: string;
  category: ProductCategory;
  status: ProductStatus;
  isVisible: boolean;
  price: number;
  cost: number;
  taxRate: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  ingredients: string[];
  cannabinoids: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  images: string[];
  features: string[];
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    attributes: Record<string, string>;
    price: number;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
};

export default function CatalogoProdutosPage() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [detailsActiveTab, setDetailsActiveTab] = useState("geral");

  const { toast } = useToast();

  // Consulta de dados (simulado)
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      // Simulando dados para demonstração
      return [
        {
          id: "1",
          sku: "CBD-OIL-500-30",
          barcode: "7898765432109",
          name: "Óleo CBD 5% 30ml",
          description: "Óleo de CBD Full Spectrum 5% em óleo de coco fracionado, frasco de 30ml com conta-gotas.",
          category: "oleo",
          status: "ativo",
          isVisible: true,
          price: 189.90,
          cost: 65.75,
          taxRate: 18,
          weight: 68,
          dimensions: {
            length: 3.5,
            width: 3.5,
            height: 10,
          },
          ingredients: [
            "Óleo de coco fracionado",
            "Extrato de Cannabis full spectrum",
            "Terpenos naturais"
          ],
          cannabinoids: [
            {
              name: "CBD",
              amount: 5,
              unit: "%"
            },
            {
              name: "THC",
              amount: 0.2,
              unit: "%"
            }
          ],
          images: [
            "product-1-main.jpg",
            "product-1-angle.jpg",
            "product-1-packaging.jpg"
          ],
          features: [
            "Full Spectrum",
            "Sem glúten",
            "Vegano",
            "Testado em laboratório"
          ],
          variants: [
            {
              id: "v1",
              name: "30ml - 5%",
              sku: "CBD-OIL-500-30",
              attributes: {
                size: "30ml",
                concentration: "5%"
              },
              price: 189.90
            },
            {
              id: "v2",
              name: "50ml - 5%",
              sku: "CBD-OIL-500-50",
              attributes: {
                size: "50ml",
                concentration: "5%"
              },
              price: 289.90
            }
          ],
          documents: [
            {
              id: "doc1",
              name: "Certificado de Análise",
              type: "pdf",
              url: "/docs/coa-cbd-oil-5.pdf"
            },
            {
              id: "doc2",
              name: "Folha de Segurança",
              type: "pdf",
              url: "/docs/safety-cbd-oil.pdf"
            }
          ],
          createdAt: new Date("2025-02-15"),
          updatedAt: new Date("2025-03-20"),
          metadata: {
            recommendations: "Uso oral, 2-3 gotas, 2x ao dia",
            shelfLife: "24 meses"
          }
        },
        {
          id: "2",
          sku: "CBD-OIL-1000-30",
          barcode: "7898765432110",
          name: "Óleo CBD 10% 30ml",
          description: "Óleo de CBD Full Spectrum 10% em óleo de coco fracionado, frasco de 30ml com conta-gotas.",
          category: "oleo",
          status: "ativo",
          isVisible: true,
          price: 289.90,
          cost: 102.50,
          taxRate: 18,
          weight: 68,
          dimensions: {
            length: 3.5,
            width: 3.5,
            height: 10,
          },
          ingredients: [
            "Óleo de coco fracionado",
            "Extrato de Cannabis full spectrum",
            "Terpenos naturais"
          ],
          cannabinoids: [
            {
              name: "CBD",
              amount: 10,
              unit: "%"
            },
            {
              name: "THC",
              amount: 0.3,
              unit: "%"
            }
          ],
          images: [
            "product-2-main.jpg",
            "product-2-angle.jpg",
            "product-2-packaging.jpg"
          ],
          features: [
            "Full Spectrum",
            "Sem glúten",
            "Vegano",
            "Testado em laboratório"
          ],
          variants: [
            {
              id: "v1",
              name: "30ml - 10%",
              sku: "CBD-OIL-1000-30",
              attributes: {
                size: "30ml",
                concentration: "10%"
              },
              price: 289.90
            },
            {
              id: "v2",
              name: "50ml - 10%",
              sku: "CBD-OIL-1000-50",
              attributes: {
                size: "50ml",
                concentration: "10%"
              },
              price: 389.90
            }
          ],
          documents: [
            {
              id: "doc1",
              name: "Certificado de Análise",
              type: "pdf",
              url: "/docs/coa-cbd-oil-10.pdf"
            },
            {
              id: "doc2",
              name: "Folha de Segurança",
              type: "pdf",
              url: "/docs/safety-cbd-oil.pdf"
            }
          ],
          createdAt: new Date("2025-02-15"),
          updatedAt: new Date("2025-03-20"),
          metadata: {
            recommendations: "Uso oral, 1-2 gotas, 2x ao dia",
            shelfLife: "24 meses"
          }
        },
        {
          id: "3",
          sku: "CBD-TINCT-500-30",
          barcode: "7898765432111",
          name: "Tintura CBD 5% 30ml",
          description: "Tintura de CBD Isolado 5% em álcool de cereais, frasco de 30ml com conta-gotas.",
          category: "tintura",
          status: "ativo",
          isVisible: true,
          price: 159.90,
          cost: 52.30,
          taxRate: 18,
          weight: 65,
          dimensions: {
            length: 3.5,
            width: 3.5,
            height: 10,
          },
          ingredients: [
            "Álcool de cereais",
            "CBD isolado",
            "Aromatizante natural de menta"
          ],
          cannabinoids: [
            {
              name: "CBD",
              amount: 5,
              unit: "%"
            },
            {
              name: "THC",
              amount: 0,
              unit: "%"
            }
          ],
          images: [
            "product-3-main.jpg",
            "product-3-angle.jpg"
          ],
          features: [
            "CBD Isolado",
            "Sabor menta",
            "Sem THC",
            "Testado em laboratório"
          ],
          variants: [
            {
              id: "v1",
              name: "30ml - 5% - Menta",
              sku: "CBD-TINCT-500-30-MINT",
              attributes: {
                size: "30ml",
                concentration: "5%",
                flavor: "Menta"
              },
              price: 159.90
            },
            {
              id: "v2",
              name: "30ml - 5% - Neutro",
              sku: "CBD-TINCT-500-30-PLAIN",
              attributes: {
                size: "30ml",
                concentration: "5%",
                flavor: "Neutro"
              },
              price: 159.90
            }
          ],
          documents: [
            {
              id: "doc1",
              name: "Certificado de Análise",
              type: "pdf",
              url: "/docs/coa-cbd-tincture.pdf"
            }
          ],
          createdAt: new Date("2025-03-01"),
          updatedAt: new Date("2025-03-15"),
          metadata: {
            recommendations: "Uso sublingual, 3-5 gotas, 2x ao dia",
            shelfLife: "18 meses"
          }
        },
        {
          id: "4",
          sku: "CBD-CAPS-10-30",
          barcode: "7898765432112",
          name: "Cápsulas CBD 10mg 30un",
          description: "Cápsulas de CBD Isolado 10mg, frasco com 30 unidades.",
          category: "capsulas",
          status: "ativo",
          isVisible: true,
          price: 149.90,
          cost: 48.75,
          taxRate: 18,
          weight: 45,
          dimensions: {
            length: 5,
            width: 5,
            height: 10,
          },
          ingredients: [
            "CBD isolado",
            "Óleo de coco MCT",
            "Cápsula gelatinosa"
          ],
          cannabinoids: [
            {
              name: "CBD",
              amount: 10,
              unit: "mg"
            },
            {
              name: "THC",
              amount: 0,
              unit: "mg"
            }
          ],
          images: [
            "product-4-main.jpg",
            "product-4-angle.jpg"
          ],
          features: [
            "CBD Isolado",
            "Fácil dosagem",
            "Sem sabor",
            "Testado em laboratório"
          ],
          variants: [
            {
              id: "v1",
              name: "30 cápsulas - 10mg",
              sku: "CBD-CAPS-10-30",
              attributes: {
                quantity: "30",
                dosage: "10mg"
              },
              price: 149.90
            },
            {
              id: "v2",
              name: "60 cápsulas - 10mg",
              sku: "CBD-CAPS-10-60",
              attributes: {
                quantity: "60",
                dosage: "10mg"
              },
              price: 269.90
            }
          ],
          documents: [
            {
              id: "doc1",
              name: "Certificado de Análise",
              type: "pdf",
              url: "/docs/coa-cbd-capsules.pdf"
            }
          ],
          createdAt: new Date("2025-03-10"),
          updatedAt: new Date("2025-03-25"),
          metadata: {
            recommendations: "Consumir 1 cápsula pela manhã",
            shelfLife: "24 meses"
          }
        },
        {
          id: "5",
          sku: "CBD-BALSAM-500",
          barcode: "7898765432113",
          name: "Bálsamo CBD 500mg 50g",
          description: "Bálsamo tópico com 500mg de CBD e óleo essencial de canela e gengibre.",
          category: "topico",
          status: "ativo",
          isVisible: true,
          price: 129.90,
          cost: 42.80,
          taxRate: 18,
          weight: 58,
          dimensions: {
            length: 6,
            width: 6,
            height: 3,
          },
          ingredients: [
            "Manteiga de karité",
            "Óleo de coco",
            "CBD isolado",
            "Óleo essencial de canela",
            "Óleo essencial de gengibre"
          ],
          cannabinoids: [
            {
              name: "CBD",
              amount: 500,
              unit: "mg"
            },
            {
              name: "THC",
              amount: 0,
              unit: "mg"
            }
          ],
          images: [
            "product-5-main.jpg",
            "product-5-angle.jpg"
          ],
          features: [
            "Uso tópico",
            "Efeito aquecimento",
            "Fórmula natural",
            "Testado dermatologicamente"
          ],
          variants: [],
          documents: [
            {
              id: "doc1",
              name: "Certificado de Análise",
              type: "pdf",
              url: "/docs/coa-cbd-balsam.pdf"
            },
            {
              id: "doc2",
              name: "Testes Dermatológicos",
              type: "pdf",
              url: "/docs/dermatest-balsam.pdf"
            }
          ],
          createdAt: new Date("2025-03-20"),
          updatedAt: new Date("2025-04-01"),
          metadata: {
            recommendations: "Massagear na área afetada até 3x ao dia",
            shelfLife: "12 meses"
          }
        },
      ] as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const filteredProducts = React.useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Filtrar por categoria
    if (activeTab !== "todos") {
      filtered = filtered.filter((product) => product.category === activeTab);
    }

    // Pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          (product.barcode && product.barcode.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [products, activeTab, searchTerm]);

  // Estatísticas
  const stats = React.useMemo(() => {
    if (!products) return { 
      total: 0, 
      active: 0, 
      categories: 0 
    };
    
    const uniqueCategories = new Set(products.map(p => p.category));
    
    return {
      total: products.length,
      active: products.filter(p => p.status === "ativo").length,
      categories: uniqueCategories.size,
    };
  }, [products]);

  const getCategoryInfo = (category: ProductCategory) => {
    switch (category) {
      case "oleo":
        return {
          label: "Óleos",
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        };
      case "tintura":
        return {
          label: "Tinturas",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };
      case "capsulas":
        return {
          label: "Cápsulas",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        };
      case "topico":
        return {
          label: "Tópicos",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };
      case "comestivel":
        return {
          label: "Comestíveis",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        };
      case "materia_prima":
        return {
          label: "Matéria-Prima",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      case "outro":
        return {
          label: "Outros",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
      default:
        return {
          label: category,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const getStatusInfo = (status: ProductStatus) => {
    switch (status) {
      case "ativo":
        return {
          label: "Ativo",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        };
      case "inativo":
        return {
          label: "Inativo",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          icon: <XCircle className="h-4 w-4 mr-1" />,
        };
      case "descontinuado":
        return {
          label: "Descontinuado",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          icon: <XCircle className="h-4 w-4 mr-1" />,
        };
      case "em_desenvolvimento":
        return {
          label: "Em Desenvolvimento",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          icon: <Edit className="h-4 w-4 mr-1" />,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
        };
    }
  };

  const handleShowDetails = (product: Product) => {
    setCurrentProduct(product);
    setOpenDetailsModal(true);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar adição de produto
    toast({
      title: "Produto adicionado com sucesso",
      description: "O produto foi cadastrado no sistema.",
    });
    setOpenAddProduct(false);
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Catálogo de Produtos</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => setOpenAddProduct(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
            <Button variant="outline" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Todos os produtos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Produtos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Produtos em estado ativo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.categories}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Categorias de produtos
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Tabs
                defaultValue="todos"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="todos" className="text-xs md:text-sm">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="oleo" className="text-xs md:text-sm">
                    Óleos
                  </TabsTrigger>
                  <TabsTrigger value="tintura" className="text-xs md:text-sm">
                    Tinturas
                  </TabsTrigger>
                  <TabsTrigger value="capsulas" className="text-xs md:text-sm">
                    Cápsulas
                  </TabsTrigger>
                  <TabsTrigger value="topico" className="text-xs md:text-sm">
                    Tópicos
                  </TabsTrigger>
                  <TabsTrigger value="comestivel" className="text-xs md:text-sm">
                    Comestíveis
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center w-full md:w-auto space-x-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="w-full pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center w-full md:w-auto space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Filtros avançados"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">SKU</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Canabinoides</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const categoryInfo = getCategoryInfo(product.category);
                    const statusInfo = getStatusInfo(product.status);

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          <div>{product.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {product.description.substring(0, 60)}
                            {product.description.length > 60 ? "..." : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={categoryInfo.color}
                          >
                            {categoryInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusInfo.color}
                          >
                            <span className="flex items-center">
                              {statusInfo.icon}
                              {statusInfo.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {product.cannabinoids.map((cannabinoid, idx) => (
                              <div key={idx} className="text-xs">
                                {cannabinoid.name}: {cannabinoid.amount}
                                {cannabinoid.unit}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="link"
                            className="h-8 px-2"
                            onClick={() => handleShowDetails(product)}
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={openDetailsModal} onOpenChange={setOpenDetailsModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
            <DialogDescription>
              Informações completas sobre o produto {currentProduct?.name}
            </DialogDescription>
          </DialogHeader>

          {currentProduct && (
            <>
              <Tabs
                defaultValue="geral"
                value={detailsActiveTab}
                onValueChange={setDetailsActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="geral">Geral</TabsTrigger>
                  <TabsTrigger value="composicao">Composição</TabsTrigger>
                  <TabsTrigger value="variantes">Variantes</TabsTrigger>
                  <TabsTrigger value="imagens">Imagens</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">SKU</Label>
                      <div className="font-medium">{currentProduct.sku}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Código de Barras</Label>
                      <div>
                        {currentProduct.barcode || "N/A"}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div>
                        <Badge
                          variant="outline"
                          className={getStatusInfo(currentProduct.status).color}
                        >
                          <span className="flex items-center">
                            {getStatusInfo(currentProduct.status).icon}
                            {getStatusInfo(currentProduct.status).label}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Nome</Label>
                    <div className="font-medium">{currentProduct.name}</div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Descrição</Label>
                    <div>{currentProduct.description}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Categoria</Label>
                      <div>
                        <Badge
                          variant="outline"
                          className={getCategoryInfo(currentProduct.category).color}
                        >
                          {getCategoryInfo(currentProduct.category).label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Visibilidade</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={currentProduct.isVisible}
                          disabled
                        />
                        <span>
                          {currentProduct.isVisible ? "Visível" : "Não visível"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Preço</Label>
                      <div className="font-medium">
                        R$ {currentProduct.price.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Custo</Label>
                      <div>
                        R$ {currentProduct.cost.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Taxa de Imposto</Label>
                      <div>
                        {currentProduct.taxRate}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Peso</Label>
                      <div>
                        {currentProduct.weight}g
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Dimensões</Label>
                      <div>
                        {currentProduct.dimensions.length} x {currentProduct.dimensions.width} x {currentProduct.dimensions.height} cm
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Características</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentProduct.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Data de Criação</Label>
                      <div>
                        {new Date(currentProduct.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Última Atualização</Label>
                      <div>
                        {new Date(currentProduct.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="composicao" className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Ingredientes</Label>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      {currentProduct.ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Canabinoides</Label>
                    <div className="mt-2 space-y-2">
                      {currentProduct.cannabinoids.map((cannabinoid, idx) => (
                        <div key={idx} className="flex justify-between border-b pb-2">
                          <span className="font-medium">{cannabinoid.name}</span>
                          <span>
                            {cannabinoid.amount}{cannabinoid.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Recomendações de Uso</Label>
                    <div className="mt-1">
                      {currentProduct.metadata.recommendations}
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Validade</Label>
                    <div className="mt-1">
                      {currentProduct.metadata.shelfLife}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="variantes" className="space-y-4">
                  {currentProduct.variants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Este produto não possui variantes.
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Atributos</TableHead>
                            <TableHead className="text-right">Preço</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentProduct.variants.map((variant) => (
                            <TableRow key={variant.id}>
                              <TableCell className="font-medium">
                                {variant.name}
                              </TableCell>
                              <TableCell>{variant.sku}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(variant.attributes).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs">
                                      {key}: {value}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                R$ {variant.price.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="imagens" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentProduct.images.length === 0 ? (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        Este produto não possui imagens.
                      </div>
                    ) : (
                      currentProduct.images.map((image, idx) => (
                        <div key={idx} className="border rounded-md p-2 flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-md h-40 w-full flex items-center justify-center mb-2">
                            <Image className="h-12 w-12 text-gray-400" />
                          </div>
                          <div className="text-sm truncate w-full text-center">
                            {image}
                          </div>
                          <div className="mt-2 flex space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Image className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documentos" className="space-y-4">
                  {currentProduct.documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Este produto não possui documentos.
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentProduct.documents.map((document) => (
                            <TableRow key={document.id}>
                              <TableCell className="font-medium">
                                {document.name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {document.type.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button size="sm" variant="outline" className="h-8">
                                    Visualizar
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-8">
                                    Download
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setOpenDetailsModal(false)}>
              Fechar
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center">
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </Button>
              <Button variant="outline" className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" className="flex items-center text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Produto */}
      <Dialog open={openAddProduct} onOpenChange={setOpenAddProduct}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar um novo produto
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="Ex: CBD-OIL-500-30" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="barcode">Código de Barras (opcional)</Label>
                  <Input id="barcode" placeholder="Ex: 7898765432109" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input id="name" placeholder="Ex: Óleo CBD 5% 30ml" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição detalhada do produto"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oleo">Óleos</SelectItem>
                      <SelectItem value="tintura">Tinturas</SelectItem>
                      <SelectItem value="capsulas">Cápsulas</SelectItem>
                      <SelectItem value="topico">Tópicos</SelectItem>
                      <SelectItem value="comestivel">Comestíveis</SelectItem>
                      <SelectItem value="materia_prima">Matéria-Prima</SelectItem>
                      <SelectItem value="outro">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select required defaultValue="ativo">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                      <SelectItem value="descontinuado">Descontinuado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cost">Custo (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="taxRate">Taxa de Imposto (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="weight">Peso (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dimensions">Dimensões (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      placeholder="Comp."
                      required
                    />
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      placeholder="Larg."
                      required
                    />
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="Alt."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="isVisible" defaultChecked />
                <Label htmlFor="isVisible">Produto visível</Label>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ingredients">Ingredientes (um por linha)</Label>
                <Textarea
                  id="ingredients"
                  placeholder="Digite um ingrediente por linha"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cbd">CBD (%)</Label>
                  <Input
                    id="cbd"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="thc">THC (%)</Label>
                  <Input
                    id="thc"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cbg">CBG (opcional)</Label>
                  <Input
                    id="cbg"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="recommendations">Recomendações de Uso</Label>
                <Input
                  id="recommendations"
                  placeholder="Ex: Uso oral, 2-3 gotas, 2x ao dia"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="shelfLife">Validade</Label>
                <Input
                  id="shelfLife"
                  placeholder="Ex: 24 meses"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddProduct(false)}>
                Cancelar
              </Button>
              <Button type="submit">Cadastrar Produto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}