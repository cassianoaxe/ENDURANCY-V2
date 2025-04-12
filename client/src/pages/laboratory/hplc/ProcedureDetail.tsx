import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Loader2,
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  Hash,
  Clock,
  User,
  School,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interface para procedimentos HPLC
interface HplcProcedure {
  id: number;
  laboratoryId: number;
  title: string;
  documentNumber: string;
  version: string;
  effectiveDate: string;
  category: string;
  content: string;
  attachments?: any;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  relatedTrainings?: HplcTraining[];
}

// Interface para treinamentos
interface HplcTraining {
  id: number;
  userId: number;
  procedureId: number;
  trainingTitle: string;
  trainingType: string;
  startDate: string;
  completionDate?: string;
  status: string;
  userName?: string;
  trainerName?: string;
}

export default function ProcedureDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const procedureId = params.id ? parseInt(params.id) : null;
  
  // Consulta para buscar detalhes do procedimento
  const { data: procedure, isLoading, error } = useQuery({
    queryKey: [`/api/laboratory/hplc/procedures/${procedureId}`],
    enabled: !!procedureId,
    select: (data) => data as HplcProcedure
  });

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  // Formatar data e hora para exibição
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  // Renderizar status do treinamento com badge adequada
  const renderTrainingStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="mr-1 h-3 w-3" /> Agendado
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <RotateCw className="mr-1 h-3 w-3" /> Em Andamento
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Concluído
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="mr-1 h-3 w-3" /> Reprovado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Renderizar tipo de treinamento
  const renderTrainingType = (type: string) => {
    switch (type) {
      case "inicial":
        return "Inicial";
      case "recorrente":
        return "Recorrente";
      case "específico":
        return "Específico";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/laboratory/hplc/procedures")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Procedimentos
        </Button>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Erro ao Carregar Procedimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <h3 className="text-lg font-semibold">Procedimento não encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Não foi possível carregar os detalhes do procedimento solicitado.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : procedure ? (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-primary">
                        <Hash className="mr-1 h-3 w-3" /> {procedure.documentNumber}
                      </Badge>
                      <Badge variant="outline">
                        <Tag className="mr-1 h-3 w-3" /> {procedure.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{procedure.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center">
                          <Hash className="mr-1 h-4 w-4 text-muted-foreground" />
                          Versão: <span className="font-medium ml-1">{procedure.version}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          Data de Efetivação: <span className="font-medium ml-1">{formatDate(procedure.effectiveDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4 text-muted-foreground" />
                          Criado Por: <span className="font-medium ml-1">{procedure.createdByName || "Usuário"}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          Última Atualização: <span className="font-medium ml-1">{formatDateTime(procedure.updatedAt)}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Conteúdo do Procedimento</h3>
                  <div className="rounded-md border p-4 whitespace-pre-wrap bg-gray-50">
                    {procedure.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    <div className="flex items-center">
                      <School className="mr-2 h-5 w-5" />
                      Treinamentos Relacionados
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {procedure.relatedTrainings && procedure.relatedTrainings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Data Inicial</TableHead>
                        <TableHead>Data de Conclusão</TableHead>
                        <TableHead>Treinador</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {procedure.relatedTrainings.map((training) => (
                        <TableRow key={training.id}>
                          <TableCell>{training.userName || "N/A"}</TableCell>
                          <TableCell>{training.trainingTitle}</TableCell>
                          <TableCell>{renderTrainingType(training.trainingType)}</TableCell>
                          <TableCell>{formatDate(training.startDate)}</TableCell>
                          <TableCell>{training.completionDate ? formatDate(training.completionDate) : "Pendente"}</TableCell>
                          <TableCell>{training.trainerName || "N/A"}</TableCell>
                          <TableCell>{renderTrainingStatusBadge(training.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                    <School className="h-8 w-8 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Nenhum treinamento associado</h3>
                    <p className="text-sm text-muted-foreground">
                      Este procedimento ainda não possui treinamentos associados.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}