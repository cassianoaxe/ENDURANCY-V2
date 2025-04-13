'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Package, Box, AlertCircle, ChevronRight } from "lucide-react";
import { NovoItemEstoqueDialog } from "@/components/compras/NovoItemEstoqueDialog";

// Definição dos tipos de categorias de estoque
type CategoriaEstoque = {
  id: string;
  nome: string;
  descricao: string;
  quantidadeItens: number;
  alertas: number;
  icone: React.ReactNode;
};

export default function GestaoEstoque() {
  const [dialogNovoItemAberto, setDialogNovoItemAberto] = useState(false);
  const [categoriaAtual, setCategoriaAtual] = useState<string | null>(null);

  // Categorias de estoque mockadas
  const categoriasEstoque: CategoriaEstoque[] = [
    {
      id: "materia_prima_ativos",
      nome: "Matéria Prima - Ativos",
      descricao: "Gestão de estoque de princípios ativos",
      quantidadeItens: 15,
      alertas: 2,
      icone: <Package className="h-5 w-5 text-gray-500" />
    },
    {
      id: "materia_prima_excipientes",
      nome: "Matéria Prima - Excipientes",
      descricao: "Gestão de estoque de excipientes",
      quantidadeItens: 28,
      alertas: 1,
      icone: <Package className="h-5 w-5 text-gray-500" />
    },
    {
      id: "embalagens",
      nome: "Embalagens",
      descricao: "Gestão de estoque de embalagens primárias e secundárias",
      quantidadeItens: 45,
      alertas: 3,
      icone: <Box className="h-5 w-5 text-gray-500" />
    },
    {
      id: "rotulos",
      nome: "Rótulos",
      descricao: "Gestão de estoque de rótulos",
      quantidadeItens: 32,
      alertas: 0,
      icone: <Package className="h-5 w-5 text-gray-500" />
    },
    {
      id: "produto_acabado",
      nome: "Produto Acabado",
      descricao: "Gestão de estoque de produtos finalizados",
      quantidadeItens: 24,
      alertas: 1,
      icone: <Box className="h-5 w-5 text-gray-500" />
    },
    {
      id: "produto_quarentena",
      nome: "Produto em Quarentena",
      descricao: "Produtos aguardando liberação do Controle de Qualidade",
      quantidadeItens: 8,
      alertas: 4,
      icone: <AlertCircle className="h-5 w-5 text-gray-500" />
    },
    {
      id: "material_laboratorio",
      nome: "Material de Laboratório",
      descricao: "Gestão de estoque de materiais de laboratório",
      quantidadeItens: 56,
      alertas: 2,
      icone: <Package className="h-5 w-5 text-gray-500" />
    }
  ];

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h1>
            <p className="text-muted-foreground">
              Gerencie o estoque de matérias-primas, produtos e materiais
            </p>
          </div>
          <Button className="gap-2" onClick={() => setDialogNovoItemAberto(true)}>
            <Package className="h-4 w-4" />
            Novo Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoriasEstoque.map((categoria) => (
            <Card key={categoria.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    {categoria.icone}
                    <h3 className="text-lg font-semibold">{categoria.nome}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium">Items em estoque</p>
                    <p className="text-2xl font-bold">{categoria.quantidadeItens}</p>
                    
                    {categoria.alertas > 0 && (
                      <Badge variant="outline" className="mt-2 bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                        {categoria.alertas} {categoria.alertas === 1 ? 'alerta' : 'alertas'}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="mt-4 w-full justify-between" 
                    onClick={() => setCategoriaAtual(categoria.id)}
                  >
                    Gerenciar <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <NovoItemEstoqueDialog 
        open={dialogNovoItemAberto} 
        onOpenChange={setDialogNovoItemAberto}
        categoriaInicial={categoriaAtual}
      />
    </OrganizationLayout>
  );
}