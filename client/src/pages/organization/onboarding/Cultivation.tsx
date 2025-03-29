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
  Leaf, FlowerIcon, Sprout, ArrowDownToLine
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dados do curso
const courseContent = [
  {
    id: 1,
    title: "Princípios do Cultivo",
    duration: "6 min",
    description: "Aprenda os conceitos fundamentais do cultivo e controle de qualidade.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Princípios do Cultivo</h2>
      
      <p>Neste vídeo, vamos explorar os conceitos fundamentais do cultivo controlado e como eles são implementados na plataforma Endurancy.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Princípios básicos de horticultura controlada</li>
        <li>Fatores que influenciam o crescimento das plantas</li>
        <li>Como monitorar condições ambientais ideais</li>
        <li>Melhores práticas para garantir qualidade consistente</li>
      </ul>
      
      <p>O cultivo controlado é uma ciência e uma arte, envolvendo o manejo cuidadoso de múltiplas variáveis ambientais para produzir plantas saudáveis e produtos de alta qualidade.</p>
      
      <p>Vamos começar analisando como configurar seu ambiente de cultivo...</p>
    `
  },
  {
    id: 2,
    title: "Configuração de Ambiente",
    duration: "8 min",
    description: "Configure o ambiente ideal para cultivo com monitoramento avançado.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Configuração de Ambiente de Cultivo</h2>
      
      <p>Neste vídeo, vamos aprender como configurar e monitorar o ambiente de cultivo ideal para maximizar a qualidade e o rendimento.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Como configurar sensores de ambiente</li>
        <li>Monitoramento de temperatura, umidade e CO2</li>
        <li>Ajustes de intensidade luminosa e fotoperíodo</li>
        <li>Alertas e automação de condições ambientais</li>
      </ul>
      
      <p>Um ambiente de cultivo bem monitorado é fundamental para manter a consistência e a qualidade do produto final. A plataforma Endurancy oferece ferramentas avançadas para automatizar e registrar todos os parâmetros essenciais.</p>
      
      <p>Vamos explorar a interface de monitoramento ambiental...</p>
    `
  },
  {
    id: 3,
    title: "Ciclo de Crescimento",
    duration: "5 min",
    description: "Acompanhe todo o ciclo de vida das plantas, da semente à colheita.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Gerenciamento do Ciclo de Crescimento</h2>
      
      <p>Neste vídeo, vamos aprender como gerenciar e monitorar o ciclo completo de crescimento das plantas, da propagação à colheita.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Registro de etapas de crescimento</li>
        <li>Monitoramento de fases vegetativa e floração</li>
        <li>Programação de nutrição e irrigação por fase</li>
        <li>Planejamento de colheita e pós-colheita</li>
      </ul>
      
      <p>O acompanhamento adequado do ciclo de crescimento permite intervenções precisas em momentos críticos, maximizando a qualidade e a eficiência produtiva.</p>
      
      <p>Vamos começar explorando o módulo de ciclo de vida na plataforma...</p>
    `
  },
  {
    id: 4,
    title: "Rastreabilidade de Lotes",
    duration: "6 min",
    description: "Implemente um sistema completo de rastreabilidade para conformidade regulatória.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Rastreabilidade Completa de Lotes</h2>
      
      <p>Neste vídeo, vamos explorar como implementar um sistema robusto de rastreabilidade de lotes na plataforma Endurancy, garantindo conformidade regulatória e qualidade consistente.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Criação e gestão de lotes de produção</li>
        <li>Registros de insumos e procedimentos</li>
        <li>Rastreabilidade do cultivo ao produto final</li>
        <li>Geração de relatórios para órgãos reguladores</li>
      </ul>
      
      <p>Um sistema de rastreabilidade eficaz não é apenas uma exigência regulatória, mas também uma ferramenta valiosa para identificar e resolver problemas de qualidade, além de construir confiança com clientes e parceiros.</p>
      
      <p>Vamos explorar as ferramentas de rastreabilidade da plataforma...</p>
    `
  }
];

export default function Cultivation() {
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
            <h1 className="text-2xl font-bold">Módulo Cultivo</h1>
            <p className="text-gray-500">Gestão completa do processo de cultivo</p>
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
                  <span className="text-sm">Guia de Cultivo Avançado</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <ArrowDownToLine className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Planilhas de Registro</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <Leaf className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Biblioteca de Referências</span>
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