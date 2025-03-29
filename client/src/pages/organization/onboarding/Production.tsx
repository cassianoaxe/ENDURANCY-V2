import React, { useState } from 'react';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, CheckCircle, Play, Pause, ArrowRight,
  Clock, PlayCircle, FileText, GraduationCap, Lightbulb,
  PackageSearch, BarChart3, ClipboardCheck, LineChart, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dados do curso
const courseContent = [
  {
    id: 1,
    title: "Introdução à Produção",
    duration: "5 min",
    description: "Visão geral dos processos de produção e fluxo de trabalho.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Introdução à Produção</h2>
      
      <p>Neste vídeo, vamos explorar uma visão geral dos processos de produção e como gerenciá-los eficientemente na plataforma Endurancy.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Fundamentos do módulo de produção</li>
        <li>Fluxo de trabalho e etapas principais</li>
        <li>Interação com outros módulos da plataforma</li>
        <li>Principais métricas de acompanhamento</li>
      </ul>
      
      <p>O módulo de produção é o coração operacional da plataforma, conectando o cultivo ao produto final e garantindo a rastreabilidade completa de todo o processo.</p>
      
      <p>Vamos começar explorando a interface do módulo de produção...</p>
    `
  },
  {
    id: 2,
    title: "Planejamento de Produção",
    duration: "8 min",
    description: "Aprenda a planejar e organizar os ciclos de produção de forma eficiente.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Planejamento Eficiente de Produção</h2>
      
      <p>Neste vídeo, vamos aprender como planejar e organizar os ciclos de produção para maximizar a eficiência e minimizar desperdícios.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Criação de calendários de produção</li>
        <li>Alocação de recursos e materiais</li>
        <li>Previsão de demanda e capacidade</li>
        <li>Gestão de gargalos produtivos</li>
      </ul>
      
      <p>Um planejamento de produção bem estruturado é fundamental para garantir operações sem interrupções e otimizar a utilização de recursos.</p>
      
      <p>Vamos explorar as ferramentas de planejamento na plataforma...</p>
    `
  },
  {
    id: 3,
    title: "Controle de Qualidade",
    duration: "7 min",
    description: "Implementação de protocolos de controle de qualidade em todas as etapas de produção.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Controle de Qualidade na Produção</h2>
      
      <p>Neste vídeo, vamos aprender como implementar e gerenciar protocolos robustos de controle de qualidade em todo o processo produtivo.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Definição de pontos críticos de controle</li>
        <li>Criação de formulários de inspeção</li>
        <li>Implementação de testes de qualidade</li>
        <li>Análise e relatórios de não conformidades</li>
      </ul>
      
      <p>Um controle de qualidade eficaz não é apenas uma necessidade regulatória, mas também um diferencial competitivo que garante a satisfação dos clientes e a reputação da marca.</p>
      
      <p>Vamos explorar as ferramentas de controle de qualidade da plataforma...</p>
    `
  },
  {
    id: 4,
    title: "Análise de Dados Produtivos",
    duration: "10 min",
    description: "Utilize análises de dados para identificar oportunidades de melhoria contínua.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Análise de Dados e Melhoria Contínua</h2>
      
      <p>Neste vídeo, vamos explorar como utilizar os dados gerados no processo produtivo para identificar tendências, resolver problemas e implementar melhorias contínuas.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Interpretação de métricas de produção</li>
        <li>Análise de eficiência e rendimento</li>
        <li>Identificação de perdas e desperdícios</li>
        <li>Implementação de ciclos de melhoria</li>
      </ul>
      
      <p>A análise de dados é uma ferramenta poderosa para transformar informações em ações concretas que melhoram continuamente a eficiência operacional e a qualidade dos produtos.</p>
      
      <p>Vamos explorar os painéis analíticos da plataforma...</p>
    `
  }
];

export default function Production() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [activeTab, setActiveTab] = useState("video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Cálculo de progresso geral do curso
  const completedLessons = courseContent.filter(lesson => lesson.completed).length;
  const totalProgress = Math.round((completedLessons / courseContent.length) * 100);
  
  // Lição atual
  const lesson = courseContent.find(l => l.id === currentLesson) || courseContent[0];
  
  // Funções de navegação
  const goToNextLesson = () => {
    if (currentLesson < courseContent.length) {
      setCurrentLesson(currentLesson + 1);
      setActiveTab("video");
      setIsPlaying(false);
      setProgress(0);
    } else {
      // Redirecionar para a página de conclusão ou de volta para onboarding
      window.location.href = "/organization/onboarding";
    }
  };
  
  const goToPreviousLesson = () => {
    if (currentLesson > 1) {
      setCurrentLesson(currentLesson - 1);
      setActiveTab("video");
      setIsPlaying(false);
      setProgress(0);
    }
  };
  
  const markAsCompleted = () => {
    // Atualizar o estado local primeiro
    const updatedCourseContent = courseContent.map(item => 
      item.id === currentLesson ? { ...item, completed: true } : item
    );
    
    // Em uma aplicação real, você enviaria isso para o backend
    console.log("Marcando lição como concluída:", currentLesson);
    
    // Seguir para a próxima lição
    goToNextLesson();
  };
  
  const simulateProgress = () => {
    // Simulação de progresso do vídeo
    if (isPlaying && progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          return newProgress;
        });
      }, 300); // Aumentar a cada 300ms para simular um vídeo
      
      return () => clearTimeout(timer);
    }
  };
  
  // Efeito para simular progresso de vídeo
  React.useEffect(() => {
    const cleanup = simulateProgress();
    return cleanup;
  }, [isPlaying, progress]);
  
  // Marcar automaticamente como concluído quando o progresso chegar a 100%
  React.useEffect(() => {
    if (progress >= 100 && !lesson.completed) {
      const updatedCourseContent = courseContent.map(item => 
        item.id === currentLesson ? { ...item, completed: true } : item
      );
      // Em uma aplicação real, você enviaria isso para o backend
    }
  }, [progress, lesson.completed, currentLesson]);

  return (
    <OrganizationLayout>
      <div className="container px-6 py-4">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.location.href = "/organization/onboarding"}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Módulo Produção</h1>
            <p className="text-gray-500">Controle do processo produtivo</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da esquerda: lista de lições */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Lições</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {completedLessons}/{courseContent.length} concluídas
                    </span>
                    <span className="w-10 text-xs font-medium">{totalProgress}%</span>
                  </div>
                </div>
                <Progress value={totalProgress} className="h-1.5" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-px">
                  {courseContent.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50",
                        currentLesson === lesson.id && "bg-gray-50"
                      )}
                      onClick={() => setCurrentLesson(lesson.id)}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full border",
                        lesson.completed 
                          ? "bg-green-50 border-green-500 text-green-500" 
                          : "bg-white border-gray-200 text-gray-400"
                      )}>
                        {lesson.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-medium",
                          lesson.completed ? "text-green-600" : ""
                        )}>
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-3 border-t">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => window.location.href = "/organization/onboarding"}
                >
                  Voltar para Onboarding
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Recursos Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Manual de Boas Práticas</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <Download className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Checklists de Qualidade</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <LineChart className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Modelos de Relatórios</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna central e direita: conteúdo da lição atual */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{lesson.duration}</span>
                  </div>
                </div>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardContent className="p-0">
                  <TabsList className="p-0 bg-gray-100 rounded-none border-b w-full justify-start gap-0">
                    <TabsTrigger 
                      value="video" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 py-2 px-4"
                    >
                      Vídeo
                    </TabsTrigger>
                    <TabsTrigger 
                      value="transcript" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 py-2 px-4"
                    >
                      Transcrição
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="video" className="p-4 mt-0">
                    {/* Player de Vídeo Simulado */}
                    <div className="aspect-video bg-gray-900 rounded-md relative overflow-hidden mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="h-16 w-16 text-white opacity-50" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-white"
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <div className="flex-1">
                            <Progress value={progress} className="h-1" />
                          </div>
                          <span className="text-xs text-white">
                            {Math.floor(progress * 0.03)}:{(Math.floor(progress * 0.6) % 60).toString().padStart(2, '0')} / {lesson.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={goToPreviousLesson}
                        disabled={currentLesson === 1}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Anterior</span>
                      </Button>
                      
                      <Button 
                        className="flex items-center gap-1"
                        onClick={() => markAsCompleted()}
                      >
                        <span>Marcar como concluído</span>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={goToNextLesson}
                        disabled={currentLesson === courseContent.length}
                      >
                        <span>Próximo</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="transcript" className="p-4 mt-0">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: lesson.transcript }}
                    />
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={goToPreviousLesson}
                        disabled={currentLesson === 1}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Anterior</span>
                      </Button>
                      
                      <Button 
                        className="flex items-center gap-1"
                        onClick={() => markAsCompleted()}
                      >
                        <span>Marcar como concluído</span>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={goToNextLesson}
                        disabled={currentLesson === courseContent.length}
                      >
                        <span>Próximo</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}