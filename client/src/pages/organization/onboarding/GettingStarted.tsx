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
  Clock, PlayCircle, FileText, GraduationCap, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dados do curso
const courseContent = [
  {
    id: 1,
    title: "Introdução à Plataforma",
    duration: "3 min",
    description: "Conheça os principais recursos da plataforma e como ela pode ajudar a sua organização.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Bem-vindo à Plataforma Endurancy</h2>
      
      <p>Neste vídeo, vamos dar uma visão geral da plataforma Endurancy e como ela pode transformar a gestão da sua organização.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Navegação básica pela plataforma</li>
        <li>Principais recursos e módulos</li>
        <li>Como acessar o suporte e documentação</li>
      </ul>
      
      <p>A Endurancy foi projetada para facilitar o gerenciamento completo de organizações de saúde, desde o cadastro de pacientes até o controle financeiro.</p>
      
      <p>Vamos começar explorando a interface principal...</p>
    `
  },
  {
    id: 2,
    title: "Configuração Inicial",
    duration: "4 min",
    description: "Configure sua conta e personalize a plataforma de acordo com as necessidades da sua organização.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Configuração Inicial da Sua Conta</h2>
      
      <p>Neste vídeo, vamos configurar sua conta e personalizar a plataforma para atender às necessidades específicas da sua organização.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Como configurar o perfil da organização</li>
        <li>Personalizações disponíveis na interface</li>
        <li>Configurações de segurança e acesso</li>
      </ul>
      
      <p>Uma configuração adequada é essencial para maximizar a eficiência e garantir que todos os processos estejam alinhados com o fluxo de trabalho da sua organização.</p>
      
      <p>Vamos começar acessando as configurações de perfil...</p>
    `
  },
  {
    id: 3,
    title: "Criação de Usuários",
    duration: "3 min",
    description: "Aprenda a adicionar e gerenciar usuários com diferentes níveis de acesso.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1",
    completed: false,
    transcript: `
      <h2>Gerenciamento de Usuários</h2>
      
      <p>Neste vídeo, vamos aprender como criar e gerenciar usuários na plataforma Endurancy, estabelecendo diferentes níveis de acesso para sua equipe.</p>
      
      <h3>O que você vai aprender:</h3>
      <ul>
        <li>Como criar novos usuários</li>
        <li>Definição de papéis e permissões</li>
        <li>Gerenciamento de acesso a recursos</li>
        <li>Boas práticas de segurança</li>
      </ul>
      
      <p>Um controle eficiente de usuários é fundamental para manter a segurança dos dados e garantir que cada membro da equipe tenha acesso apenas ao que precisa para realizar suas funções.</p>
      
      <p>Vamos começar acessando o módulo de administração de usuários...</p>
    `
  }
];

export default function GettingStarted() {
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
            <h1 className="text-2xl font-bold">Começando</h1>
            <p className="text-gray-500">Introdução à plataforma e conceitos básicos</p>
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
                  <span className="text-sm">Guia do Usuário</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Centro de Treinamento</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <Lightbulb className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Dicas e Truques</span>
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