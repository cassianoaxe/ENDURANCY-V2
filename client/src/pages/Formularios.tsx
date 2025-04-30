import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, FileText, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Formularios() {
  // Navegação direta para a página de cadastro
  const navigateBack = () => {
    window.location.href = '/cadastro';
  };

  // Navegação para o editor de formulários
  const goToEditor = (id?: number) => {
    if (id) {
      window.location.href = `/formularios/editor/${id}`;
    } else {
      window.location.href = '/formularios/editor';
    }
  };

  // Dados de exemplo dos formulários
  const formularios = [
    { id: 1, nome: "Cadastro de Associado", tipoOrg: "Associação", campos: 12, status: "ativo" },
    { id: 2, nome: "Solicitação de Produto", tipoOrg: "Associação", campos: 8, status: "ativo" },
    { id: 3, nome: "Cadastro de Médico", tipoOrg: "Ambos", campos: 15, status: "ativo" },
    { id: 4, nome: "Pedido de Análise", tipoOrg: "Empresa", campos: 10, status: "inativo" },
    { id: 5, nome: "Ficha de Avaliação", tipoOrg: "Associação", campos: 20, status: "ativo" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Formulários</h1>
          <p className="text-gray-600">Crie e gerencie formulários para diferentes tipos de organizações</p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="mb-6 gap-2" 
        onClick={navigateBack}
      >
        <ArrowLeft size={16} />
        Voltar para Cadastro
      </Button>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="text" 
            placeholder="Buscar formulário..." 
            className="pl-10"
          />
        </div>
        <Button className="gap-2" onClick={() => goToEditor()}>
          <Plus size={16} />
          Novo Formulário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulários Disponíveis</CardTitle>
          <CardDescription>
            Formulários configurados para diferentes tipos de organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo de Organização</TableHead>
                <TableHead>Qtd. Campos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formularios.map(form => (
                <TableRow key={form.id}>
                  <TableCell>{form.id}</TableCell>
                  <TableCell className="font-medium">{form.nome}</TableCell>
                  <TableCell>{form.tipoOrg}</TableCell>
                  <TableCell>{form.campos}</TableCell>
                  <TableCell>
                    {form.status === 'ativo' ? (
                      <Badge className="bg-green-50 text-green-600 border-green-200">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => goToEditor(form.id)}>
                      <FileText size={14} />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}