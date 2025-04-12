import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileTextIcon, Download, Filter, Printer, BarChart3 } from "lucide-react";

export default function LaboratoryReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios do Laboratório</h2>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="samples">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="samples">Amostras</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="quality">Controle de Qualidade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="samples" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Amostras</CardTitle>
              <CardDescription>
                Resumo de amostras recebidas, analisadas e pendentes por período.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Amostras</CardTitle>
                      <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">248</div>
                      <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Amostras Processadas</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">187</div>
                      <p className="text-xs text-muted-foreground">75.4% do total</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tempo Médio de Processamento</CardTitle>
                      <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2.4 dias</div>
                      <p className="text-xs text-muted-foreground">-0.3 dias em relação ao mês anterior</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="font-medium">Dados demonstrativos de relatório</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Esta é uma visualização de demonstração. Em um ambiente de produção, os dados reais seriam exibidos aqui conforme filtros selecionados.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Testes</CardTitle>
              <CardDescription>
                Resumo dos testes realizados e seus resultados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4">
                  <div className="font-medium">Dados demonstrativos de testes</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta é uma visualização de demonstração. Em um ambiente de produção, os dados de testes e seus resultados seriam exibidos aqui.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="productivity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Produtividade</CardTitle>
              <CardDescription>
                Análise da produtividade do laboratório por analista e período.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4">
                  <div className="font-medium">Dados demonstrativos de produtividade</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta é uma visualização de demonstração. Em um ambiente de produção, os dados de produtividade seriam exibidos aqui.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Controle de Qualidade</CardTitle>
              <CardDescription>
                Indicadores de qualidade e conformidade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4">
                  <div className="font-medium">Dados demonstrativos de controle de qualidade</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Esta é uma visualização de demonstração. Em um ambiente de produção, os indicadores de qualidade seriam exibidos aqui.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}