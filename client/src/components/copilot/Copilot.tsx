import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Bot, X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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

const Copilot: React.FC<CopilotProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: 'Olá! Eu sou o Endurancy Copilot. Como posso ajudar você hoje?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Sugestões de perguntas para o usuário
  const suggestions = [
    "Como posso cadastrar um novo paciente?",
    "Gere um relatório financeiro do último mês",
    "Quais são os módulos disponíveis no meu plano?",
    "Preciso de ajuda com o fluxo de prescrições"
  ];

  // Scroll para o final das mensagens quando uma nova é adicionada
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Foco no campo de input quando o Copilot é aberto
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Chamada para a API de chat
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });
      
      if (!response.ok) {
        throw new Error('Falha na comunicação com o assistente');
      }
      
      const data = await response.json();
      
      // Adicionar resposta do assistente
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.response || 'Desculpe, não consegui processar sua solicitação.',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Erro na comunicação",
        description: "Não foi possível conectar ao serviço de IA. Tente novamente mais tarde.",
        variant: "destructive"
      });
      
      // Mensagem de erro como resposta do assistente
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        content: "Desculpe, estou enfrentando dificuldades técnicas no momento. Por favor, tente novamente mais tarde.",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className={cn(
        "fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-lg z-40 w-96 max-w-full flex flex-col transition-transform duration-300 transform border-l border-gray-200 dark:border-gray-800",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-green-600 text-white">
        <div className="flex items-center">
          <Bot className="h-6 w-6 mr-2" />
          <h2 className="text-lg font-semibold">Endurancy Copilot</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-green-500 transition-colors"
          aria-label="Fechar Copilot"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={cn(
              "flex w-full max-w-[85%] rounded-lg p-3 animate-fadeIn",
              message.sender === 'user' 
                ? "bg-gray-100 dark:bg-gray-800 ml-auto" 
                : "bg-green-50 dark:bg-gray-700 mr-auto"
            )}
          >
            {message.sender === 'assistant' && (
              <Bot className="h-5 w-5 mr-2 text-green-600 dark:text-green-400 shrink-0 mt-1" />
            )}
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {message.content}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.sender === 'user' && (
              <div className="w-5 ml-2"></div> // Espaçador para manter alinhamento
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex w-full max-w-[85%] rounded-lg p-3 bg-green-50 dark:bg-gray-700 mr-auto">
            <Bot className="h-5 w-5 mr-2 text-green-600 dark:text-green-400 shrink-0 mt-1" />
            <div>
              <div className="flex space-x-2 items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Referência para rolar para o fim da lista */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Sugestões */}
      {messages.length < 3 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <Sparkles className="h-3 w-3 mr-1" /> Sugestões
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="text-xs text-left p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.length > 35 ? `${suggestion.substring(0, 35)}...` : suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Área de input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex space-x-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[60px] flex-1 resize-none"
            maxLength={500}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pressione Enter para enviar. Use Shift+Enter para nova linha.
        </p>
      </div>
    </div>
  );
};

export default Copilot;