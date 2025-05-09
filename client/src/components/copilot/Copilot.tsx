import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Send, Bot, Settings, PlusCircle, Search, BarChart3, 
  TrendingUp, DollarSign, HelpCircle, Ticket as TicketIcon,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type CopilotTab = 'chat' | 'insights' | 'ajuda';

const Copilot: React.FC<CopilotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<CopilotTab>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Adicionar mensagem de boas-vindas quando o chat é aberto pela primeira vez
      setMessages([
        {
          id: 'welcome',
          content: 'Olá! Sou o Copilot da Endurancy. Como posso ajudar você hoje?',
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Focar no input quando o chat é aberto
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Rolar para o último mensagem quando novas mensagens são adicionadas
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Adicionar atalho de teclado para limpar histórico (Ctrl+Shift+C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        if (messages.length > 0) {
          // Manter apenas a mensagem de boas-vindas
          setMessages([
            {
              id: 'welcome',
              content: 'Olá! Sou o Copilot da Endurancy. Como posso ajudar você hoje?',
              sender: 'assistant',
              timestamp: new Date(),
            },
          ]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Armazenar o valor atual antes de limpar o input
    const currentInputValue = inputValue;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentInputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      console.log('Enviando requisição para /api/ai/chat...');
      const response = await axios.post('/api/ai/chat', { message: currentInputValue });
      
      console.log('Resposta recebida:', response.data); // Log para debug
      
      // Se a resposta contém um campo 'response'
      if (response.data && typeof response.data.response === 'string') {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Resposta inválida da API:', response.data);
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Verificar se é um erro de axios para mostrar detalhes
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Dados:', error.response?.data);
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, tive um problema para processar sua solicitação. Por favor, tente novamente mais tarde.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para executar comandos especiais através do Copilot
  const executeCommand = async (command: string) => {
    setActiveTab('chat');
    
    const commandMessage: Message = {
      id: Date.now().toString(),
      content: command,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, commandMessage]);
    setIsLoading(true);
    
    // Pequeno atraso para melhorar a UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Aqui podemos fazer uma chamada especial à API indicando que é um comando especial
      const response = await axios.post('/api/ai/chat', { 
        message: command,
        isCommand: true, 
        commandType: getCommandType(command),
      });
      
      if (response.data && typeof response.data.response === 'string') {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao executar comando:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Não foi possível executar este comando no momento. Por favor, tente novamente mais tarde.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para identificar o tipo de comando
  const getCommandType = (command: string): string => {
    if (command.toLowerCase().includes('criar paciente')) return 'criar_paciente';
    if (command.toLowerCase().includes('buscar paciente')) return 'buscar_paciente';
    if (command.toLowerCase().includes('análise de vendas') || 
        command.toLowerCase().includes('vendas recentes')) return 'analise_vendas';
    return 'geral';
  };

  // Handlers para botões de atalho que usam diretamente os tipos de comando
  const handleCriarPaciente = async () => {
    setActiveTab('chat');
    
    const commandMessage: Message = {
      id: Date.now().toString(),
      content: "Criar Paciente",
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, commandMessage]);
    setIsLoading(true);
    
    try {
      // Chamada direta com o tipo de comando, sem depender da análise de texto
      const response = await axios.post('/api/ai/chat', { 
        message: "Como criar um novo paciente?",
        isCommand: true, 
        commandType: 'criar_paciente', // Tipo explícito
      });
      
      if (response.data && typeof response.data.response === 'string') {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao executar comando:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Não foi possível executar este comando no momento. Por favor, tente novamente mais tarde.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função semelhante para buscar paciente
  const handleBuscarPaciente = async () => {
    setActiveTab('chat');
    
    const commandMessage: Message = {
      id: Date.now().toString(),
      content: "Buscar Paciente",
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, commandMessage]);
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/ai/chat', { 
        message: "Como buscar um paciente?",
        isCommand: true, 
        commandType: 'buscar_paciente', // Tipo explícito
      });
      
      if (response.data && typeof response.data.response === 'string') {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao executar comando:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Não foi possível executar este comando no momento. Por favor, tente novamente mais tarde.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para análise de vendas
  const handleAnaliseVendas = async () => {
    setActiveTab('chat');
    
    const commandMessage: Message = {
      id: Date.now().toString(),
      content: "Análise de Vendas",
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, commandMessage]);
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/ai/chat', { 
        message: "Mostrar análise de vendas recentes",
        isCommand: true, 
        commandType: 'analise_vendas', // Tipo explícito
      });
      
      if (response.data && typeof response.data.response === 'string') {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao executar comando:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Não foi possível executar este comando no momento. Por favor, tente novamente mais tarde.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para sugerir comandos diretamente no chat
  const suggestCommand = (command: string) => {
    setInputValue(command);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Função para limpar o histórico de mensagens
  const clearChatHistory = () => {
    setMessages([
      {
        id: 'welcome',
        content: 'Olá! Sou o Copilot da Endurancy. Como posso ajudar você hoje?',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-screen w-96 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-4 border-b flex justify-between items-center bg-green-600 text-white">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Endurancy Copilot</h2>
          </div>
          <p className="text-xs text-gray-100">Powered by Claude MCP</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearChatHistory} 
            className="text-white hover:bg-green-700"
            title="Limpar histórico de conversa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-green-700">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CopilotTab)} className="w-full">
        <TabsList className="grid grid-cols-3 mx-4 my-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="ajuda">Ajuda</TabsTrigger>
        </TabsList>
        
        <div className="px-4 mb-2 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={handleCriarPaciente}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Criar Paciente</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleAnaliseVendas}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Análise de Vendas</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleBuscarPaciente}
          >
            <Search className="h-4 w-4" />
            <span>Buscar Paciente</span>
          </Button>
        </div>
        
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="flex-1 px-4 overflow-y-auto bg-gray-50 h-[calc(100vh-240px)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "mb-4 p-3 rounded-lg max-w-[80%]",
                  message.sender === 'user'
                    ? "bg-green-100 ml-auto text-right"
                    : "bg-white shadow-sm mr-auto"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {/* Adicionar botões de sugestão após respostas do assistente */}
                {message.sender === 'assistant' && message.id !== 'welcome' && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.content.toLowerCase().includes('paciente') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-green-700 hover:text-green-800 p-1 h-auto"
                        onClick={() => suggestCommand("Como cadastrar um novo paciente?")}
                      >
                        Cadastrar paciente
                      </Button>
                    )}
                    {message.content.toLowerCase().includes('venda') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-green-700 hover:text-green-800 p-1 h-auto"
                        onClick={() => suggestCommand("Mostrar detalhes das vendas")}
                      >
                        Ver detalhes
                      </Button>
                    )}
                    {!message.content.toLowerCase().includes('ajudar com mais alguma coisa') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-green-700 hover:text-green-800 p-1 h-auto"
                        onClick={() => suggestCommand("Preciso de mais ajuda")}
                      >
                        Mais ajuda
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Adicionar sugestões específicas para a mensagem de boas-vindas */}
                {message.id === 'welcome' && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-xs font-medium text-gray-500">Sugestões:</p>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs bg-white"
                        onClick={() => suggestCommand("Como usar o Endurancy?")}
                      >
                        Como usar o Endurancy?
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs bg-white"
                        onClick={() => suggestCommand("Quais módulos estão disponíveis?")}
                      >
                        Módulos disponíveis
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs bg-white"
                        onClick={() => suggestCommand("O que é MCP?")}
                      >
                        O que é MCP?
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-center my-4">
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
              </div>
            )}
            
            {/* Adicionar componente de "digitando..." quando o assistente estiver processando */}
            {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
              <div className="mb-4 p-3 rounded-lg max-w-[80%] bg-white shadow-sm mr-auto">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex flex-col space-y-2">
              {/* Sugestões contextuais baseadas no último input ou na conversa */}
              {messages.length > 0 && !isLoading && (
                <div className="flex flex-wrap gap-1 pb-2">
                  {messages[messages.length - 1].content.toLowerCase().includes('financeiro') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs p-1 h-7 text-gray-600"
                      onClick={() => suggestCommand("Como acessar o módulo financeiro?")}
                    >
                      Acessar módulo financeiro
                    </Button>
                  )}
                  {messages[messages.length - 1].content.toLowerCase().includes('relat') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs p-1 h-7 text-gray-600"
                      onClick={() => suggestCommand("Como gerar relatórios?")}
                    >
                      Gerar relatórios
                    </Button>
                  )}
                </div>
              )}
            
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2 flex-1">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={clearChatHistory} 
                    title="Limpar histórico"
                    className="h-9 w-9 text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="bg-gray-400 hover:bg-gray-500">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="insights" className="px-4 py-2 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {/* Mensagem de introdução */}
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-sm text-green-700">
                <span className="font-semibold">Insights personalizados</span> gerados automaticamente pelo Endurancy Copilot para ajudar na gestão da sua organização.
              </p>
            </div>
            
            {/* Card de Insights de Vendas */}
            <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-green-700">Vendas Mensais</h4>
                  <p className="text-sm text-gray-600 mt-1">Últimos 30 dias</p>
                </div>
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xl font-semibold">R$ 32.450,75</p>
                <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+12.5%</span>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Evolução de vendas</p>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="w-[65%] h-full bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <p className="text-gray-700 font-medium">Oportunidade Identificada:</p>
                <p className="text-gray-600 text-xs mt-1">
                  Os produtos da categoria "CBD Tópicos" tiveram um crescimento de 22% este mês.
                  Considere expandir o estoque desta categoria.
                </p>
              </div>
              
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                Ver análise completa
              </Button>
            </div>
            
            {/* Card de Insights de Pacientes */}
            <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-blue-700">Retenção de Pacientes</h4>
                  <p className="text-sm text-gray-600 mt-1">Análise trimestral</p>
                </div>
                <PlusCircle className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="mt-3 flex justify-between">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Novos</p>
                  <p className="font-medium text-blue-700">32</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Retorno</p>
                  <p className="font-medium text-green-700">78</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Inativos</p>
                  <p className="font-medium text-red-700">5</p>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <p className="text-gray-700 font-medium">Pacientes para contato:</p>
                <ul className="text-gray-600 text-xs mt-1 space-y-1">
                  <li>• Maria Silva - 60 dias sem consulta</li>
                  <li>• João Costa - Tratamento finalizado sem retorno</li>
                </ul>
              </div>
              
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                Gerenciar acompanhamentos
              </Button>
            </div>
            
            {/* Card de Insights de Estoque */}
            <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-amber-700">Alertas de Estoque</h4>
                  <p className="text-sm text-gray-600 mt-1">Itens que requerem atenção</p>
                </div>
                <Search className="h-5 w-5 text-amber-600" />
              </div>
              
              <div className="mt-3 text-sm">
                <p className="text-red-600 text-xs font-medium">Produtos próximos ao fim:</p>
                <ul className="text-gray-600 text-xs mt-1 space-y-1">
                  <li>• CBD Oil 10% - Restam 3 unidades</li>
                  <li>• Tincture Full Spectrum - Restam 5 unidades</li>
                </ul>
              </div>
              
              <div className="mt-3 text-sm">
                <p className="text-amber-600 text-xs font-medium">Produtos próximos da validade:</p>
                <ul className="text-gray-600 text-xs mt-1 space-y-1">
                  <li>• CBD Capsules Isolate - 45 dias para o vencimento</li>
                </ul>
              </div>
              
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                Gerenciar estoque
              </Button>
            </div>
            
            {/* Card de Insights Financeiros */}
            <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-indigo-700">Saúde Financeira</h4>
                  <p className="text-sm text-gray-600 mt-1">Relatório mensal</p>
                </div>
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Receitas</p>
                  <p className="font-medium text-green-700">R$ 48.320,50</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Despesas</p>
                  <p className="font-medium text-red-700">R$ 29.750,25</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Lucro</p>
                  <p className="font-medium text-indigo-700">R$ 18.570,25</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Margem</p>
                  <p className="font-medium text-indigo-700">38.4%</p>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <p className="text-gray-700 font-medium">Análise MCP:</p>
                <p className="text-gray-600 text-xs mt-1">
                  A margem de lucro aumentou 3.2% em relação ao mês anterior. Os custos com 
                  marketing apresentaram o maior aumento (12.5%), mas com retorno positivo 
                  de conversão.
                </p>
              </div>
              
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                Ver relatório financeiro
              </Button>
            </div>
            
            {/* Card de Insights de Tickets */}
            <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-purple-700">Suporte Técnico</h4>
                  <p className="text-sm text-gray-600 mt-1">Visão geral de tickets</p>
                </div>
                <TicketIcon className="h-5 w-5 text-purple-600" />
              </div>
              
              <div className="mt-3 flex justify-between">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Abertos</p>
                  <p className="font-medium text-purple-700">8</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Em progresso</p>
                  <p className="font-medium text-blue-700">5</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Resolvidos</p>
                  <p className="font-medium text-green-700">23</p>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <p className="text-gray-700 font-medium">Tickets prioritários:</p>
                <ul className="text-gray-600 text-xs mt-1 space-y-1">
                  <li>• #1245 - Problema de integração com ERP (Alta prioridade)</li>
                  <li>• #1253 - Error ao gerar relatório (Média prioridade)</li>
                </ul>
              </div>
              
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                Ver todos os tickets
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ajuda" className="px-4 py-2 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {/* Introdução */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Olá! 👋</span> Estou aqui para ajudar você a tirar o máximo proveito do Endurancy Copilot. Veja abaixo os comandos e dicas mais úteis!
              </p>
            </div>
            
            <h3 className="font-semibold mb-2">Comandos populares</h3>
            <ul className="space-y-2 text-sm">
              <li className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="font-medium flex items-center gap-1">
                  <PlusCircle className="h-4 w-4 text-green-600" />
                  "Criar paciente"
                </p>
                <p className="text-gray-600 mt-1">Inicia o assistente para criação rápida de pacientes e explica o processo passo a passo</p>
              </li>
              <li className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="font-medium flex items-center gap-1">
                  <Search className="h-4 w-4 text-blue-600" />
                  "Buscar paciente [nome]"
                </p>
                <p className="text-gray-600 mt-1">Ajuda a localizar pacientes por nome, CPF ou ID e mostra como acessar prontuários</p>
              </li>
              <li className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="font-medium flex items-center gap-1">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  "Análise de vendas"
                </p>
                <p className="text-gray-600 mt-1">Mostra insights sobre desempenho de vendas recentes e tendências importantes</p>
              </li>
              <li className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="font-medium flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-amber-600" />
                  "Como faço para..."
                </p>
                <p className="text-gray-600 mt-1">Pergunte qualquer procedimento na plataforma para obter instruções detalhadas</p>
              </li>
            </ul>
            
            <h3 className="font-semibold mt-5 mb-2">Atalhos de teclado</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="text-gray-700">Abrir/Fechar Copilot</p>
                <p className="font-mono bg-gray-200 px-2 py-1 rounded mt-1 text-xs inline-block">Ctrl + K</p>
              </div>
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="text-gray-700">Enviar mensagem</p>
                <p className="font-mono bg-gray-200 px-2 py-1 rounded mt-1 text-xs inline-block">Enter</p>
              </div>
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="text-gray-700">Limpar mensagens</p>
                <p className="font-mono bg-gray-200 px-2 py-1 rounded mt-1 text-xs inline-block">Ctrl + Shift + C</p>
              </div>
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="text-gray-700">Mudar de aba</p>
                <p className="font-mono bg-gray-200 px-2 py-1 rounded mt-1 text-xs inline-block">Alt + Tab</p>
              </div>
            </div>
            
            <h3 className="font-semibold mt-5 mb-2">O que é MCP?</h3>
            <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-sm">
              <p className="font-medium text-green-800 mb-2">Multi-Context Processing (MCP)</p>
              <p className="text-gray-700">
                É a tecnologia exclusiva do Endurancy Copilot que permite integrar informações de diferentes módulos (Financeiro, Pacientes, Estoque, etc.) para fornecer respostas mais precisas e contextualizadas.
              </p>
              <div className="mt-3 p-2 bg-white rounded border border-green-100">
                <p className="text-xs text-green-800 font-medium">Exemplo de MCP em ação:</p>
                <p className="text-xs text-gray-600 mt-1">
                  Ao analisar tendências de vendas, o Copilot correlaciona automaticamente dados de estoque, perfil de pacientes e sazonalidade para gerar recomendações mais eficazes.
                </p>
              </div>
            </div>
            
            <h3 className="font-semibold mt-5 mb-2">Acesso Beta</h3>
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm mb-4">
              <p className="text-gray-700">
                <span className="font-medium text-blue-700">Recurso em fase Beta</span> - O Endurancy Copilot está disponível gratuitamente para todos os planos durante o período de testes. Suas sugestões são fundamentais para aprimorarmos a experiência.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                Enviar feedback
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Copilot;