import { useState, useRef, useEffect } from 'react';
import { Send, Settings, X, User, BarChart3, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function Copilot({ isOpen, onClose }: CopilotProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Copilot da Endurancy. Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rolagem para a mensagem mais recente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Enviar mensagem para a API
      const response = await axios.post('/api/ai/chat', {
        message: inputMessage,
        history: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });
      
      // Adicionar resposta do assistente
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message || 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Adicionar mensagem de erro como resposta do assistente
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua mensagem.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Overlay para fechar o copilot ao clicar fora */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Painel deslizante do copilot */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background z-50 shadow-xl
          transition-transform duration-300 ease-in-out 
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-bold">Endurancy Copilot</h2>
              <p className="text-xs text-muted-foreground">Powered by Claude MCP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                toast({
                  title: 'Configurações',
                  description: 'As configurações do Copilot estarão disponíveis em breve.',
                });
              }}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger 
                value="chat" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Insights
              </TabsTrigger>
              <TabsTrigger 
                value="ajuda" 
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Ajuda
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Conteúdo das abas */}
          <TabsContent value="chat" className="flex flex-col h-[calc(100vh-120px)]">
            {/* Ações rápidas */}
            <div className="p-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => {
                    setInputMessage('Como criar um novo paciente?');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                >
                  <User className="h-4 w-4" />
                  Criar Paciente
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => {
                    setInputMessage('Como analisar o relatório de vendas?');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  Análise de Vendas
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => {
                    setInputMessage('Como buscar um paciente específico?');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                  Buscar Paciente
                </Button>
              </div>
            </div>
            
            {/* Área de mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-75"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Área de input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="flex-1 min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="p-4">
            <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] text-center">
              <div className="mb-4 p-3 rounded-full bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Insights</h3>
              <p className="text-muted-foreground">
                Insights baseados em dados estarão disponíveis em breve. Fique ligado para análises e recomendações personalizadas.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="ajuda" className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Como posso ajudar você?</h3>
              
              <div className="space-y-2">
                <h4 className="font-medium">Pergunte sobre:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Como criar um novo paciente ou produto</li>
                  <li>Como acessar relatórios específicos</li>
                  <li>Explicações sobre funcionalidades da plataforma</li>
                  <li>Dicas de uso e melhores práticas</li>
                  <li>Solução de problemas comuns</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Comandos úteis:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Explique:</strong> "Explique como funciona o módulo financeiro"
                  </li>
                  <li>
                    <strong>Mostre:</strong> "Mostre como criar uma nova prescrição"
                  </li>
                  <li>
                    <strong>Ajuda:</strong> "Preciso de ajuda com importação de dados"
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}