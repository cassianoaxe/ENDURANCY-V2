import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  AlertCircle, 
  CheckCircle, 
  ChevronUp, 
  ClipboardList, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  Shield, 
  ShieldAlert 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Schema para o formulário de nova auditoria
const auditFormSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  type: z.string().min(1, {
    message: "Selecione um tipo de auditoria.",
  }),
  dueDate: z.string().min(1, {
    message: "Selecione uma data de vencimento.",
  }),
  priority: z.string().min(1, {
    message: "Selecione uma prioridade.",
  }),
  description: z.string().optional(),
});

type AuditFormValues = z.infer<typeof auditFormSchema>;

// Tipos para os dados do dashboard
type ComplianceStatus = 'compliant' | 'non-compliant' | 'in-progress' | 'not-applicable';

interface Document {
  id: number;
  title: string;
  type: string;
  status: 'Vigente' | 'Revogada' | 'Em Consulta' | 'Suspensa';
  lastUpdate: string;
  nextReview: string;
}

interface Audit {
  id: number;
  title: string;
  type: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  description?: string;
}

interface Task {
  id: number;
  title: string;
  dueDate: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  relatedDoc?: string;
}

interface Compliance {
  id: number;
  category: string;
  requirement: string;
  status: ComplianceStatus;
  lastChecked: string;
  responsiblePerson: string;
}

export default function RegulatorioDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  // Dados de demonstração
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      title: 'RDC 658/2022 - Boas Práticas de Fabricação',
      type: 'RDC',
      status: 'Vigente',
      lastUpdate: '2022-06-10',
      nextReview: '2023-06-10',
    },
    {
      id: 2,
      title: 'RDC 16/2014 - Sistema de Controle de Qualidade',
      type: 'RDC',
      status: 'Vigente',
      lastUpdate: '2021-08-15',
      nextReview: '2023-08-15',
    },
    {
      id: 3,
      title: 'RDC 301/2019 - Diretrizes de BPF para Medicamentos',
      type: 'RDC',
      status: 'Vigente',
      lastUpdate: '2022-03-22',
      nextReview: '2023-03-22',
    },
    {
      id: 4,
      title: 'RDC 430/2020 - Boas Práticas de Distribuição',
      type: 'RDC',
      status: 'Vigente',
      lastUpdate: '2022-01-30',
      nextReview: '2023-01-30',
    },
  ]);

  const [audits, setAudits] = useState<Audit[]>([
    {
      id: 1,
      title: 'Auditoria Interna de BPF',
      type: 'Interna',
      dueDate: '2023-06-15',
      status: 'in-progress',
      priority: 'high',
      progress: 65,
      description: 'Auditoria interna para verificar conformidade com as Boas Práticas de Fabricação'
    },
    {
      id: 2,
      title: 'Auditoria de Fornecedor XYZ',
      type: 'Fornecedor',
      dueDate: '2023-07-20',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      description: 'Auditoria para qualificação do fornecedor XYZ'
    },
    {
      id: 3,
      title: 'Auto-inspeção de Controle de Qualidade',
      type: 'Auto-inspeção',
      dueDate: '2023-04-30',
      status: 'overdue',
      priority: 'high',
      progress: 25,
      description: 'Auto-inspeção para verificar processos de controle de qualidade'
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Atualizar POP de Liberação de Lotes',
      dueDate: '2023-05-25',
      assignedTo: 'Carlos Silva',
      status: 'in-progress',
      relatedDoc: 'RDC 658/2022'
    },
    {
      id: 2,
      title: 'Revisar documentação de validação',
      dueDate: '2023-06-10',
      assignedTo: 'Ana Rodrigues',
      status: 'pending',
      relatedDoc: 'RDC 16/2014'
    },
    {
      id: 3,
      title: 'Implementar checklist de BPF',
      dueDate: '2023-05-15',
      assignedTo: 'Marcelo Costa',
      status: 'completed',
      relatedDoc: 'RDC 301/2019'
    },
    {
      id: 4,
      title: 'Treinamento sobre nova RDC',
      dueDate: '2023-06-30',
      assignedTo: 'Júlia Martins',
      status: 'pending'
    },
  ]);

  const [compliance, setCompliance] = useState<Compliance[]>([
    {
      id: 1,
      category: 'Sistema de Qualidade',
      requirement: 'Manual da Qualidade Atualizado',
      status: 'compliant',
      lastChecked: '2023-04-15',
      responsiblePerson: 'Carlos Silva'
    },
    {
      id: 2,
      category: 'Instalações',
      requirement: 'Áreas controladas conforme especificações',
      status: 'in-progress',
      lastChecked: '2023-04-20',
      responsiblePerson: 'Ana Rodrigues'
    },
    {
      id: 3,
      category: 'Equipamentos',
      requirement: 'Calibração de instrumentos críticos',
      status: 'non-compliant',
      lastChecked: '2023-04-10',
      responsiblePerson: 'Marcelo Costa'
    },
    {
      id: 4,
      category: 'Documentação',
      requirement: 'Controle de documentos e registros',
      status: 'compliant',
      lastChecked: '2023-04-18',
      responsiblePerson: 'Júlia Martins'
    },
    {
      id: 5,
      category: 'Pessoal',
      requirement: 'Treinamento em BPF',
      status: 'in-progress',
      lastChecked: '2023-04-22',
      responsiblePerson: 'Roberto Alves'
    },
  ]);

  // Formulário para nova auditoria
  const auditForm = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      title: '',
      type: '',
      dueDate: '',
      priority: '',
      description: '',
    },
  });

  // Função para adicionar nova auditoria
  const onSubmitAudit = (data: AuditFormValues) => {
    const newAudit: Audit = {
      id: audits.length + 1,
      title: data.title,
      type: data.type,
      dueDate: data.dueDate,
      status: 'pending',
      priority: data.priority as 'low' | 'medium' | 'high',
      progress: 0,
      description: data.description
    };

    setAudits([...audits, newAudit]);
    setIsAuditDialogOpen(false);
    auditForm.reset();

    toast({
      title: "Auditoria criada",
      description: "A nova auditoria foi adicionada com sucesso.",
    });
  };

  // Formulário para nova tarefa
  const taskFormSchema = z.object({
    title: z.string().min(3, {
      message: "O título deve ter pelo menos 3 caracteres.",
    }),
    dueDate: z.string().min(1, {
      message: "Selecione uma data de vencimento.",
    }),
    assignedTo: z.string().min(2, {
      message: "Informe o responsável pela tarefa.",
    }),
    relatedDoc: z.string().optional(),
  });

  type TaskFormValues = z.infer<typeof taskFormSchema>;

  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      assignedTo: '',
      relatedDoc: '',
    },
  });

  // Função para adicionar nova tarefa
  const onSubmitTask = (data: TaskFormValues) => {
    const newTask: Task = {
      id: tasks.length + 1,
      title: data.title,
      dueDate: data.dueDate,
      assignedTo: data.assignedTo,
      status: 'pending',
      relatedDoc: data.relatedDoc
    };

    setTasks([...tasks, newTask]);
    setIsTaskDialogOpen(false);
    taskForm.reset();

    toast({
      title: "Tarefa criada",
      description: "A nova tarefa foi adicionada com sucesso.",
    });
  };

  // Calcular estatísticas para o resumo
  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(doc => doc.status === 'Vigente').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => 
    task.status === 'pending' && new Date(task.dueDate) < new Date()
  ).length;
  const complianceRate = Math.round(
    (compliance.filter(item => item.status === 'compliant').length / compliance.length) * 100
  );

  // Filtrar itens baseados na busca
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredAudits = audits.filter(audit => 
    audit.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função para atualizar status de conformidade
  const updateComplianceStatus = (id: number, newStatus: ComplianceStatus) => {
    setCompliance(prev => 
      prev.map(item => 
        item.id === id 
          ? {...item, status: newStatus, lastChecked: new Date().toISOString().split('T')[0]} 
          : item
      )
    );

    toast({
      title: "Status atualizado",
      description: "O status de conformidade foi atualizado com sucesso.",
    });
  };

  // Função para atualizar status de tarefa
  const updateTaskStatus = (id: number, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? {...task, status: newStatus} : task
      )
    );

    toast({
      title: "Status atualizado",
      description: `A tarefa foi marcada como ${
        newStatus === 'pending' ? 'pendente' : 
        newStatus === 'in-progress' ? 'em andamento' : 'concluída'
      }.`,
    });
  };

  // Função para atualizar progresso de auditoria
  const updateAuditProgress = (id: number, newProgress: number) => {
    setAudits(prev => 
      prev.map(audit => {
        if (audit.id === id) {
          const newStatus = 
            newProgress === 100 ? 'completed' : 
            newProgress > 0 ? 'in-progress' : 'pending';
          
          return {
            ...audit, 
            progress: newProgress, 
            status: newStatus as Audit['status']
          };
        }
        return audit;
      })
    );

    toast({
      title: "Progresso atualizado",
      description: "O progresso da auditoria foi atualizado com sucesso.",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">
            Dashboard Regulatório
          </h1>
          <p className="text-gray-600">
            Visão geral da conformidade regulatória e atividades pendentes
          </p>
        </div>

        <div className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar documentos, auditorias, tarefas..."
              className="pl-9 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-lg mb-1">Documentos</h3>
            <div className="text-3xl font-bold">{activeDocuments}/{totalDocuments}</div>
            <p className="text-sm text-gray-500">Documentos ativos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <ClipboardList className="h-8 w-8 text-amber-600 mb-2" />
            <h3 className="font-medium text-lg mb-1">Tarefas</h3>
            <div className="text-3xl font-bold">{pendingTasks}</div>
            <p className="text-sm text-gray-500">
              {overdueTasks > 0 && <span className="text-red-500">{overdueTasks} atrasadas</span>}
              {overdueTasks === 0 && "Nenhuma atrasada"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <ShieldAlert className="h-8 w-8 text-indigo-600 mb-2" />
            <h3 className="font-medium text-lg mb-1">Auditorias</h3>
            <div className="text-3xl font-bold">{audits.length}</div>
            <p className="text-sm text-gray-500">
              {audits.filter(a => a.status === 'overdue').length} atrasadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Shield className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-medium text-lg mb-1">Conformidade</h3>
            <div className="text-3xl font-bold">{complianceRate}%</div>
            <Progress value={complianceRate} className="w-full mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs para as diferentes seções */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
        </TabsList>
        
        {/* Tab de Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Documentos Regulatórios</CardTitle>
                <Button onClick={() => window.location.href = '/laboratory/regulatorio'}>
                  Ver Todos
                </Button>
              </div>
              <CardDescription>
                Documentos normativos e regulatórios relevantes para o laboratório
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nenhum documento encontrado.</p>
                    </div>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <div 
                        key={doc.id} 
                        className="p-4 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/laboratory/regulatorio/rdc-${doc.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-sm text-gray-500">{doc.type}</p>
                          </div>
                          <Badge className={`
                            ${doc.status === 'Vigente' ? 'bg-green-100 text-green-800' : 
                              doc.status === 'Revogada' ? 'bg-red-100 text-red-800' : 
                              doc.status === 'Em Consulta' ? 'bg-blue-100 text-blue-800' : 
                              'bg-amber-100 text-amber-800'}
                          `}>
                            {doc.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-between mt-2">
                          <span>Última atualização: {new Date(doc.lastUpdate).toLocaleDateString('pt-BR')}</span>
                          <span>Próxima revisão: {new Date(doc.nextReview).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de Auditorias */}
        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Auditorias e Inspeções</CardTitle>
                <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Auditoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Auditoria</DialogTitle>
                    </DialogHeader>
                    <Form {...auditForm}>
                      <form onSubmit={auditForm.handleSubmit(onSubmitAudit)} className="space-y-4">
                        <FormField
                          control={auditForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input placeholder="Título da auditoria" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={auditForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Interna">Interna</SelectItem>
                                  <SelectItem value="Externa">Externa</SelectItem>
                                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                                  <SelectItem value="Auto-inspeção">Auto-inspeção</SelectItem>
                                  <SelectItem value="Anvisa">Anvisa</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={auditForm.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Vencimento</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={auditForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prioridade</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a prioridade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Baixa</SelectItem>
                                  <SelectItem value="medium">Média</SelectItem>
                                  <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={auditForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Input placeholder="Descrição da auditoria" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Adicionar</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Auditorias internas, externas e auto-inspeções programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {filteredAudits.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nenhuma auditoria encontrada.</p>
                    </div>
                  ) : (
                    filteredAudits.map((audit) => (
                      <div key={audit.id} className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{audit.title}</h3>
                            <p className="text-sm text-gray-500">{audit.type}</p>
                          </div>
                          <Badge className={`
                            ${audit.priority === 'high' ? 'bg-red-100 text-red-800' : 
                              audit.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                              'bg-green-100 text-green-800'}
                          `}>
                            {audit.priority === 'high' ? 'Alta' : 
                             audit.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Vencimento: {new Date(audit.dueDate).toLocaleDateString('pt-BR')}</span>
                          
                          <Badge className={`
                            ${audit.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              audit.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              audit.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {audit.status === 'completed' ? 'Concluída' : 
                             audit.status === 'in-progress' ? 'Em andamento' : 
                             audit.status === 'overdue' ? 'Atrasada' : 'Pendente'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progresso</span>
                            <span>{audit.progress}%</span>
                          </div>
                          <Progress value={audit.progress} className="w-full" />
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-3">
                          <Select 
                            defaultValue={audit.progress.toString()} 
                            onValueChange={(val) => updateAuditProgress(audit.id, parseInt(val))}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Atualizar progresso" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0% (Não iniciada)</SelectItem>
                              <SelectItem value="25">25% (Iniciada)</SelectItem>
                              <SelectItem value="50">50% (Metade concluída)</SelectItem>
                              <SelectItem value="75">75% (Avançada)</SelectItem>
                              <SelectItem value="100">100% (Concluída)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de Tarefas */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Tarefas Pendentes</CardTitle>
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                    </DialogHeader>
                    <Form {...taskForm}>
                      <form onSubmit={taskForm.handleSubmit(onSubmitTask)} className="space-y-4">
                        <FormField
                          control={taskForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input placeholder="Título da tarefa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={taskForm.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Vencimento</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={taskForm.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsável</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do responsável" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={taskForm.control}
                          name="relatedDoc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Documento Relacionado</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o documento (opcional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Nenhum</SelectItem>
                                  {documents.map(doc => (
                                    <SelectItem key={doc.id} value={doc.title}>
                                      {doc.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Documento regulatório relacionado a esta tarefa (opcional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Adicionar</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Tarefas relacionadas a requisitos regulatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div key={task.id} className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>Responsável: {task.assignedTo}</span>
                              <Separator orientation="vertical" className="h-3" />
                              <span>Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          <Badge className={`
                            ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              new Date(task.dueDate) < new Date() ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {task.status === 'completed' ? 'Concluída' : 
                             task.status === 'in-progress' ? 'Em andamento' : 
                             new Date(task.dueDate) < new Date() ? 'Atrasada' : 'Pendente'}
                          </Badge>
                        </div>
                        
                        {task.relatedDoc && (
                          <div className="mt-2 text-xs text-blue-600">
                            Documento: {task.relatedDoc}
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2 mt-3">
                          <Select 
                            defaultValue={task.status} 
                            onValueChange={(val) => updateTaskStatus(
                              task.id, 
                              val as 'pending' | 'in-progress' | 'completed'
                            )}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Atualizar status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="in-progress">Em andamento</SelectItem>
                              <SelectItem value="completed">Concluída</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de Conformidade */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Status de Conformidade</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Conforme</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Em andamento</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Não conforme</span>
                  </div>
                </div>
              </div>
              <CardDescription>
                Status de conformidade com requisitos regulatórios chave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {compliance.map((item) => (
                    <div key={item.id} className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{item.requirement}</h3>
                          <p className="text-sm text-gray-500">
                            Categoria: {item.category} | Responsável: {item.responsiblePerson}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {item.status === 'compliant' && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {item.status === 'in-progress' && (
                            <Clock className="h-5 w-5 text-amber-600" />
                          )}
                          {item.status === 'non-compliant' && (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                          {item.status === 'not-applicable' && (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 flex items-center mt-2">
                        <span>Última verificação: {new Date(item.lastChecked).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-3">
                        <Select 
                          defaultValue={item.status} 
                          onValueChange={(val) => updateComplianceStatus(
                            item.id, 
                            val as ComplianceStatus
                          )}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Atualizar status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compliant">Conforme</SelectItem>
                            <SelectItem value="in-progress">Em andamento</SelectItem>
                            <SelectItem value="non-compliant">Não conforme</SelectItem>
                            <SelectItem value="not-applicable">Não aplicável</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Relatório gerado",
                    description: "O relatório de conformidade foi gerado e pode ser baixado.",
                  });
                }}
              >
                Gerar Relatório de Conformidade
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}