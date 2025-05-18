import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from '@/hooks/use-toast';
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

// Interface simplificada para pré-cadastros
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

export default function PreCadastrosTest() {
  const [preCadastros, setPreCadastros] = useState<PreCadastro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Carregar os dados ao montar o componente
  useEffect(() => {
    fetchPreCadastros();
  }, []);

  // Função para buscar os pré-cadastros
  const fetchPreCadastros = async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      const response = await fetch('/api-diagnostic/pre-cadastros', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao buscar pré-cadastros: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data && data.recentEntries && Array.isArray(data.recentEntries.rows)) {
        // Transformar dados da API no formato esperado pelo componente
        const formattedData = data.recentEntries.rows.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          email: item.email,
          organizacao: item.organizacao,
          tipo_organizacao: item.tipo_organizacao || '',
          telefone: item.telefone || '',
          cargo: item.cargo || '',
          interesse: item.interesse || '',
          comentarios: item.comentarios || '',
          modulos: item.modulos || [],
          aceita_termos: !!item.aceita_termos,
          status: item.status || 'novo',
          observacoes: item.observacoes || '',
          created_at: item.created_at || new Date().toISOString(),
          contatado_em: item.contatado_em,
          convertido_em: item.convertido_em
        }));
        
        setPreCadastros(formattedData);
        console.log("Pré-cadastros carregados:", formattedData.length);
      } else {
        console.error('Resposta da API não tem o formato esperado:', data);
        setErrorMessage('Formato de resposta inválido');
        setIsError(true);
      }
    } catch (error) {
      console.error('Erro ao buscar pré-cadastros:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para renderizar o status com badge colorido
  const renderStatus = (status: PreCadastro['status']) => {
    let statusIcon;
    let statusText;
    let variant: "default" | "outline" | "secondary" | "destructive" = "default";
    
    switch (status) {
      case 'novo':
        statusIcon = <Clock className="h-4 w-4" />;
        statusText = "Novo";
        variant = "outline";
        break;
      case 'contatado':
        statusIcon = <MessageSquare className="h-4 w-4" />;
        statusText = "Contatado";
        variant = "secondary";
        break;
      case 'convertido':
        statusIcon = <CheckCircle2 className="h-4 w-4" />;
        statusText = "Convertido";
        variant = "default";
        break;
      case 'descartado':
        statusIcon = <XCircle className="h-4 w-4" />;
        statusText = "Descartado";
        variant = "destructive";
        break;
    }
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {statusIcon}
        {statusText}
      </Badge>
    );
  };

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando pré-cadastros...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
        <p className="text-center mb-4">{errorMessage || 'Não foi possível buscar os pré-cadastros. Tente novamente mais tarde.'}</p>
        <Button onClick={fetchPreCadastros}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pré-cadastros</h1>
          <p className="text-muted-foreground">
            Visualização dos pré-cadastros recebidos para o lançamento do sistema
          </p>
        </div>
        <Button onClick={fetchPreCadastros}>Atualizar dados</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pré-cadastros</CardTitle>
          <CardDescription>
            {preCadastros.length} {preCadastros.length === 1 ? 'registro encontrado' : 'registros encontrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preCadastros.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Nenhum pré-cadastro encontrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Interesse</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preCadastros.map((cadastro) => (
                  <TableRow key={cadastro.id}>
                    <TableCell>
                      <div className="font-medium">{cadastro.nome}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {cadastro.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{cadastro.organizacao}</div>
                      {cadastro.tipo_organizacao && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {cadastro.tipo_organizacao}
                        </div>
                      )}
                      {cadastro.cargo && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> {cadastro.cargo}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {cadastro.telefone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" /> {cadastro.telefone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{cadastro.interesse}</div>
                      {cadastro.modulos && cadastro.modulos.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {cadastro.modulos.map((modulo, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {modulo}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(cadastro.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>{renderStatus(cadastro.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}