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

  const executeCommand = (command: string) => {
    setActiveTab('chat');
    
    const commandMessage: Message = {
      id: Date.now().toString(),
      content: command,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, commandMessage]);
    
    const processingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: `Processando comando: ${command}...`,
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, processingMessage]);
  };

  const handleCriarPaciente = () => {
    executeCommand("Quero criar um novo paciente");
  };

  const handleBuscarPaciente = () => {
    executeCommand("Quero buscar um paciente");
  };

  const handleAnaliseVendas = () => {
    executeCommand("Mostrar análise de vendas");
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
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-center my-4">
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t">
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
          </form>
        </TabsContent>
        
        <TabsContent value="insights" className="h-[calc(100vh-150px)] flex flex-col p-4">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center p-4 bg-gray-100 rounded-lg max-w-xs">
              <h3 className="font-semibold mb-2">Insights em desenvolvimento</h3>
              <p className="text-sm text-gray-600">
                Aqui você verá análises inteligentes de dados como tendências de vendas, sugestões de melhorias e outras recomendações personalizadas baseadas no MCP.
              </p>
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