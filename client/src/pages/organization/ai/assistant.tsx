import React, { useState } from 'react';
import { Send, BrainCircuit, Bot, MessageSquare, History, Sparkles } from 'lucide-react';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Interface para mensagens do chat
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Componente de Assistente Inteligente
const AIAssistantPage: React.FC = () => {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [activeModel, setActiveModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: 'Olá! Sou o assistente de IA da Endurancy. Como posso ajudar você hoje?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);

  // Referência para o final das mensagens (para auto-scroll)
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Função para enviar mensagem
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Simular resposta do assistente (em um cenário real, aqui seria feita uma chamada API)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: generateAssistantResponse(inputValue),
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Função para gerar uma resposta simulada com base no input do usuário
  const generateAssistantResponse = (input: string): string => {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('relatório') || inputLower.includes('relatorio')) {
      return 'Posso ajudar a gerar relatórios específicos para suas necessidades. Que tipo de relatório você precisa? Temos relatórios financeiros, de vendas, de pacientes e de produção disponíveis.';
    }
    
    if (inputLower.includes('paciente') || inputLower.includes('pacientes')) {
      return 'Para gerenciar pacientes, você pode acessar o módulo "Pacientes" no menu lateral esquerdo. Lá você poderá cadastrar novos pacientes, visualizar históricos e gerenciar prescrições.';
    }
    
    if (inputLower.includes('produto') || inputLower.includes('produtos')) {
      return 'O cadastro e gerenciamento de produtos pode ser feito no módulo "Estoque" ou "Catálogo de Produtos". Você precisa de informações específicas sobre como cadastrar, atualizar ou consultar produtos?';
    }
    
    if (inputLower.includes('financeiro') || inputLower.includes('finança') || inputLower.includes('financas')) {
      return 'O módulo financeiro permite controlar fluxo de caixa, contas a pagar e receber, emissão de notas fiscais e análise financeira. Você pode acessá-lo pelo menu lateral.';
    }
    
    if (inputLower.includes('ajuda') || inputLower.includes('help')) {
      return 'Estou aqui para ajudar com qualquer dúvida sobre o sistema Endurancy. Posso fornecer orientações sobre todos os módulos, explicar funcionalidades ou guiar você em processos específicos.';
    }
    
    return 'Entendi sua solicitação. Para atendê-la melhor, poderia fornecer mais detalhes sobre o que você precisa? Estou aqui para ajudar com qualquer aspecto do sistema Endurancy.';
  };
  
  // Auto-scroll quando novas mensagens são adicionadas
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Função para limpar o histórico
  const clearChatHistory = () => {
    setMessages([
      {
        id: 'welcome',
        content: 'Histórico limpo. Como posso ajudar você agora?',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
    
    toast({
      title: 'Histórico limpo',
      description: 'O histórico de conversa foi limpo com sucesso.',
    });
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Assistente Inteligente</h1>
        <p className="text-muted-foreground mb-8">Converse com nosso assistente de IA para obter ajuda, insights e automação de tarefas</p>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Painel principal de chat */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            <Card className="h-[calc(100vh-220px)]">
              <CardHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 bg-primary/10">
                      <Bot className="h-6 w-6 text-primary" />
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Assistente Endurancy</CardTitle>
                      <CardDescription>Powered by {activeModel}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearChatHistory}>
                    <History className="h-4 w-4 mr-2" />
                    Limpar conversa
                  </Button>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 h-[calc(100vh-340px)] p-4 bg-gray-50/50">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="mt-2 text-xs opacity-70 text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '600ms'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <CardFooter className="p-4 border-t">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </form>
              </CardFooter>
            </Card>
          </div>
          
          {/* Painel lateral */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <Card className="h-[calc(100vh-220px)]">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg">Configurações</CardTitle>
                <CardDescription>Ajuste as configurações do assistente</CardDescription>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Modelo de IA</h3>
                    <Tabs defaultValue="gpt-4" onValueChange={setActiveModel}>
                      <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="gpt-4">GPT-4</TabsTrigger>
                        <TabsTrigger value="claude">Claude</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Sugestões de comando</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setInputValue("Como gerar um relatório financeiro?")}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Relatório financeiro
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setInputValue("Como cadastrar um novo paciente?")}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Cadastrar paciente
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setInputValue("Explique o módulo de estoque")}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Módulo de estoque
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recursos disponíveis</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-primary/10">
                        <Sparkles className="h-3 w-3 mr-1" /> Processamento de texto
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10">
                        <Sparkles className="h-3 w-3 mr-1" /> Análise de dados
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10">
                        <Sparkles className="h-3 w-3 mr-1" /> Sugestões contextuais
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10">
                        <Sparkles className="h-3 w-3 mr-1" /> Resposta a perguntas
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
};

export default AIAssistantPage;