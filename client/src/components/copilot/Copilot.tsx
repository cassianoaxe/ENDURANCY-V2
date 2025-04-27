import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Settings, PlusCircle, Search, BarChart3 } from 'lucide-react';
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
          <div className="flex-1 px-4 overflow-y-auto bg-gray-50">
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
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="bg-gray-400 hover:bg-gray-500">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="insights" className="h-[calc(100vh-150px)] flex flex-col p-4">
          <div className="flex-1 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Insights do MCP</h3>
              <p className="text-sm text-gray-600 mb-4">
                Análises inteligentes geradas pelo Multi-Context Processing com base nos dados da sua organização.
              </p>
            </div>
            
            {/* Card de Insights de Vendas */}
            <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-green-700">Tendências de Vendas</h4>
                  <p className="text-sm text-gray-600 mt-1">Últimos 30 dias</p>
                </div>
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Crescimento</span>
                  <span className="text-xs font-medium text-green-600">+12.5%</span>
                </div>
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
                <p className="text-amber-600 text-xs font-medium">Compras sugeridas:</p>
                <ul className="text-gray-600 text-xs mt-1 space-y-1">
                  <li>• Atualizar estoque de óleo de canabidiol</li>
                  <li>• Considerar novos fornecedores para cremes</li>
                </ul>
              </div>
              
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                Gerar pedido de compra
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ajuda" className="h-[calc(100vh-150px)] flex flex-col p-4">
          <div className="flex-1 overflow-y-auto">
            <h3 className="font-semibold mb-2">Comandos disponíveis</h3>
            <ul className="space-y-2 text-sm">
              <li className="p-2 bg-gray-100 rounded">
                <p className="font-medium">💬 "Criar paciente"</p>
                <p className="text-gray-600">Inicia o assistente para criação rápida de pacientes</p>
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <p className="font-medium">💬 "Buscar paciente [nome]"</p>
                <p className="text-gray-600">Ajuda a localizar pacientes por nome, CPF ou ID</p>
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <p className="font-medium">💬 "Análise de vendas"</p>
                <p className="text-gray-600">Mostra insights sobre desempenho de vendas recentes</p>
              </li>
              <li className="p-2 bg-gray-100 rounded">
                <p className="font-medium">💬 "Como faço para..."</p>
                <p className="text-gray-600">Pergunte qualquer procedimento na plataforma</p>
              </li>
            </ul>
            
            <h3 className="font-semibold mt-4 mb-2">Sobre o MCP</h3>
            <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
              Multi-Context Processing (MCP) é a tecnologia que permite ao Copilot entender e integrar informações de diferentes módulos da plataforma Endurancy para fornecer respostas mais precisas e contextualizadas.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Copilot;