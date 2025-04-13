"use client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Beaker, Flask, Microscope, LineChart, Users, 
  Book, ShieldCheck, Leaf, Receipt, FileText, 
  BarChart3 
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  // Exibimos uma página inicial com informações sobre o sistema
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 text-primary">Endurancy Medical HPLC</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Plataforma integrada para gerenciamento de laboratórios de análise de cannabis medicinal
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="updates">Atualizações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Gestão Laboratorial</CardTitle>
                  <Beaker className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gerenciamento completo de análises laboratoriais, incluindo amostras, testes e laudos.
                </p>
                <div className="mt-4">
                  <Link href="/laboratory/dashboard">
                    <Button className="w-full">Acessar</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Equipamentos</CardTitle>
                  <Microscope className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cadastro, manutenção e controle de todos os equipamentos do laboratório.
                </p>
                <div className="mt-4">
                  <Link href="/laboratory/equipment">
                    <Button className="w-full">Acessar</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Módulo HPLC</CardTitle>
                  <Flask className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gerenciamento específico para equipamentos de HPLC, incluindo consumíveis e métodos.
                </p>
                <div className="mt-4">
                  <Link href="/laboratory/hplc/dashboard">
                    <Button className="w-full">Acessar</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="modules" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-primary" />
                  <CardTitle>Equipamentos</CardTitle>
                </div>
                <CardDescription>Gerenciamento de equipamentos laboratoriais</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Cadastro de equipamentos
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Controle de manutenções
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Gestão de certificados
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/laboratory/equipment">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver módulo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Flask className="h-5 w-5 text-primary" />
                  <CardTitle>HPLC</CardTitle>
                </div>
                <CardDescription>Gestão de análises por cromatografia</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Consumíveis e reagentes
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Validação de métodos
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Registro de corridas
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/laboratory/hplc/dashboard">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver módulo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Gestão de Pessoal</CardTitle>
                </div>
                <CardDescription>Controle de pessoal e treinamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Registro de treinamentos
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Certificações de operadores
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Em breve</Badge>
                    Agenda de trabalho
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/laboratory/personnel">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver módulo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  <CardTitle>Procedimentos</CardTitle>
                </div>
                <CardDescription>Documentação técnica e POPs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Biblioteca de POPs
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Novo</Badge>
                    Controle de versões
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Em breve</Badge>
                    Revisão colaborativa
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/laboratory/procedures">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver módulo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  <CardTitle>Amostras</CardTitle>
                </div>
                <CardDescription>Recebimento e processamento de amostras</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Ativo</Badge>
                    Registro de amostras
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Ativo</Badge>
                    Rastreamento de status
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Ativo</Badge>
                    Histórico de análises
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/laboratory/samples">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver módulo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  <CardTitle>Laudos</CardTitle>
                </div>
                <CardDescription>Emissão e gestão de laudos técnicos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Ativo</Badge>
                    Geração de laudos
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Ativo</Badge>
                    Assinatura digital
                  </li>
                  <li className="flex items-center">
                    <Badge variant="outline" className="mr-2">Em breve</Badge>
                    Integração com ANVISA
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/laboratory/reports">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver módulo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="updates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Atualizações Recentes</CardTitle>
              <CardDescription>Últimas novidades e melhorias no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Módulo de Equipamentos</h3>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Novo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Implementamos o sistema completo de gestão de equipamentos laboratoriais, permitindo o cadastro, 
                    controle de manutenções e certificados.
                  </p>
                  <p className="text-xs text-muted-foreground">Atualizado em 13/04/2025</p>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">HPLC - Gestão de Consumíveis</h3>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Novo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Novo sistema de controle de consumíveis para HPLC, incluindo colunas, solventes, reagentes,
                    padrões e outros materiais necessários para análises.
                  </p>
                  <p className="text-xs text-muted-foreground">Atualizado em 13/04/2025</p>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Autenticação Aprimorada</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Melhoria</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Melhorias no sistema de autenticação para suportar múltiplos tipos de perfis de laboratório
                    (laboratory e labor), facilitando o acesso aos módulos.
                  </p>
                  <p className="text-xs text-muted-foreground">Atualizado em 13/04/2025</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Documentação Técnica</h3>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Documentação</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Nova documentação técnica disponível para o módulo de laboratório, incluindo 
                    descrições detalhadas das APIs, modelos de dados e fluxos de trabalho.
                  </p>
                  <p className="text-xs text-muted-foreground">Atualizado em 13/04/2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="border-t pt-8 text-center text-muted-foreground text-sm">
        <p>© 2025 Endurancy Medical - Todos os direitos reservados</p>
        <p className="mt-1">Versão 2.4.0</p>
      </div>
    </div>
  );
}
