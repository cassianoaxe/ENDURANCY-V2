import React, { useState } from 'react';
import { X, Settings, Send, User, Bot, Plus, Search, BarChart } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CopilotDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const CopilotDialog: React.FC<CopilotDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou o Copilot da Endurancy. Como posso ajudar você hoje?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Enviar para a API do módulo de IA
      const response = await apiRequest('/api/ai/process', {
        method: 'POST',
        data: {
          query: userMessage.content,
          contextTypes: ['all']
        }
      });
      
      if (response.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response || 'Desculpe, não consegui processar sua solicitação.',
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        toast({
          title: 'Erro ao processar mensagem',
          description: response.error || 'Ocorreu um erro ao processar sua mensagem.',
          variant: 'destructive',
        });
        
        // Adicionar mensagem de erro como resposta do bot
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Desculpe, não consegui processar sua solicitação neste momento.',
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      toast({
        title: 'Erro de comunicação',
        description: 'Não foi possível se comunicar com o servidor.',
        variant: 'destructive',
      });
      
      // Adicionar mensagem de erro como resposta do bot
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, estou enfrentando dificuldades técnicas neste momento.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] p-0 gap-0 overflow-hidden h-[600px] max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black">
              <Bot className="text-white w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Endurancy Copilot</h2>
              <p className="text-xs text-muted-foreground">Powered by Claude MCP</p>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => {}} className="mr-2">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="grid grid-cols-3 px-4 py-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="ajuda">Ajuda</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden px-0 py-0 m-0">
            <div className="grid grid-cols-2 gap-2 p-3 border-b">
              <Button variant="outline" className="flex items-center gap-1 h-9 text-sm">
                <Plus className="h-4 w-4" />
                <span>Criar Paciente</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-1 h-9 text-sm">
                <BarChart className="h-4 w-4" />
                <span>Análise de Vendas</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-1 h-9 text-sm col-span-2">
                <Search className="h-4 w-4" />
                <span>Buscar Paciente</span>
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!msg.isUser && (
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-black text-white">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        msg.isUser
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.isUser && (
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-black text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form 
              onSubmit={handleSendMessage}
              className="p-3 border-t flex items-center gap-2"
            >
              <Input
                className="flex-1"
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="insights" className="px-4 py-3 m-0 flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-medium mb-2">Análise de Desempenho</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe métricas-chave e obtenha insights sobre o desempenho da sua organização.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-medium mb-2">Recomendações</h3>
                <p className="text-sm text-muted-foreground">
                  O Copilot analisará dados da sua organização para fornecer recomendações personalizadas.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-medium mb-2">Em breve</h3>
                <p className="text-sm text-muted-foreground">
                  Mais recursos de análise e insights estarão disponíveis em breve.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ajuda" className="px-4 py-3 m-0 flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-medium mb-2">Como usar o Copilot</h3>
                <p className="text-sm text-muted-foreground">
                  O Endurancy Copilot é um assistente inteligente que pode ajudar você com várias tarefas na plataforma.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-medium mb-2">Perguntas frequentes</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                  <li>Como criar um novo paciente?</li>
                  <li>Como acessar relatórios financeiros?</li>
                  <li>Como configurar permissões de usuário?</li>
                </ul>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <h3 className="font-medium mb-2">Comandos úteis</h3>
                <p className="text-sm text-muted-foreground">
                  Experimente perguntar ao Copilot sobre qualquer funcionalidade da plataforma ou solicitar ajuda em processos específicos.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CopilotDialog;