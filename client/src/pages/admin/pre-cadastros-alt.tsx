import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  Building2, 
  User, 
  Mail, 
  Calendar,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// useToast pode gerar um erro na compilação, então substituí por um alerta simples

// Interface para os pré-cadastros
interface PreCadastro {
  id: number;
  nome: string;
  email: string;
  organizacao: string;
  tipo_organizacao?: string;
  telefone?: string;
  cargo?: string;
  interesse?: string;
  comentarios?: string;
  modulos?: string[];
  aceita_termos: boolean;
  status: 'novo' | 'contatado' | 'convertido' | 'descartado';
  observacoes?: string;
  created_at: string;
  contatado_em?: string;
  convertido_em?: string;
}

export default function PreCadastrosAlt() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [preCadastros, setPreCadastros] = useState<PreCadastro[]>([]);
  const [activeTab, setActiveTab] = useState('todos');

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchData();
  }, []);

  // Função para buscar dados
  const fetchData = async () => {
    setLoading(true);
    setError(false);
    
    try {
      console.log('Buscando pré-cadastros da API...');
      const response = await fetch('/api-diagnostic/pre-cadastros', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro de servidor: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API:', data);
      
      // Extrair os dados dos pré-cadastros
      if (data && data.recentEntries && Array.isArray(data.recentEntries.rows)) {
        const cadastros = data.recentEntries.rows.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          email: item.email,
          organizacao: item.organizacao,
          tipo_organizacao: item.tipo_organizacao,
          telefone: item.telefone,
          cargo: item.cargo,
          interesse: item.interesse,
          comentarios: item.comentarios,
          modulos: item.modulos,
          aceita_termos: item.aceita_termos,
          status: item.status || 'novo',
          observacoes: item.observacoes,
          created_at: item.created_at,
          contatado_em: item.contatado_em,
          convertido_em: item.convertido_em
        }));
        
        setPreCadastros(cadastros);
        toast({
          title: "Dados carregados",
          description: `${cadastros.length} pré-cadastros encontrados`,
        });
      } else {
        throw new Error('Formato de dados inválido');
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(true);
      toast({
        title: "Erro ao carregar dados",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h2 className="text-xl font-medium mt-4">Carregando pré-cadastros...</h2>
        </div>
      </div>
    );
  }

  if (error && preCadastros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
        <p className="mb-4">Não foi possível buscar os pré-cadastros. Tente novamente mais tarde.</p>
        <Button onClick={fetchData}>Tentar novamente</Button>
      </div>
    );
  }

  // Filtrar os cadastros de acordo com a tab ativa
  const filteredCadastros = activeTab === 'todos' 
    ? preCadastros 
    : preCadastros.filter(item => item.status === activeTab);

  // Contagem de cadastros por status
  const counts = {
    todos: preCadastros.length,
    novo: preCadastros.filter(item => item.status === 'novo').length,
    contatado: preCadastros.filter(item => item.status === 'contatado').length,
    convertido: preCadastros.filter(item => item.status === 'convertido').length,
    descartado: preCadastros.filter(item => item.status === 'descartado').length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pré-cadastros</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize os pré-cadastros recebidos para o sistema
          </p>
        </div>
        <Button onClick={fetchData}>Atualizar dados</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('todos')}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              Todos 
              <Badge className="ml-2">{counts.todos}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('novo')}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Novos
              </div>
              <Badge variant="outline" className="ml-2">{counts.novo}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('contatado')}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contatados
              </div>
              <Badge variant="secondary" className="ml-2">{counts.contatado}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('convertido')}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Convertidos
              </div>
              <Badge className="ml-2">{counts.convertido}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab('descartado')}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Descartados
              </div>
              <Badge variant="destructive" className="ml-2">{counts.descartado}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'todos' ? 'Todos os pré-cadastros' : 
             activeTab === 'novo' ? 'Novos pré-cadastros' :
             activeTab === 'contatado' ? 'Pré-cadastros contatados' :
             activeTab === 'convertido' ? 'Pré-cadastros convertidos' : 
             'Pré-cadastros descartados'}
          </CardTitle>
          <CardDescription>
            {filteredCadastros.length} {filteredCadastros.length === 1 ? 'registro' : 'registros'} encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Nome/Email</th>
                  <th className="text-left p-2">Organização</th>
                  <th className="text-left p-2">Contato</th>
                  <th className="text-left p-2">Interesse</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCadastros.map((cadastro) => (
                  <tr key={cadastro.id} className="border-t hover:bg-muted/50">
                    <td className="p-2">
                      <div className="font-medium">{cadastro.nome}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cadastro.email}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{cadastro.organizacao}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {cadastro.tipo_organizacao}
                        {cadastro.cargo && (
                          <>
                            <span className="mx-1">•</span>
                            <User className="h-3 w-3" />
                            {cadastro.cargo}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {cadastro.telefone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {cadastro.telefone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Não informado</span>
                      )}
                    </td>
                    <td className="p-2">
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {cadastro.interesse}
                        </Badge>
                        {cadastro.modulos && cadastro.modulos.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {cadastro.modulos.map((modulo, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {modulo}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(cadastro.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-2">
                      {cadastro.status === 'novo' && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Novo
                        </Badge>
                      )}
                      {cadastro.status === 'contatado' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          Contatado
                        </Badge>
                      )}
                      {cadastro.status === 'convertido' && (
                        <Badge className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Convertido
                        </Badge>
                      )}
                      {cadastro.status === 'descartado' && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          Descartado
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}