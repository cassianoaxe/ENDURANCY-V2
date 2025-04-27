import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Adicionar mensagem de boas-vindas quando o chat é aberto pela primeira vez
      setMessages([
        {
          id: 'welcome',
          content: 'Olá! Sou o Endurancy Copilot. Como posso ajudar você hoje com a plataforma?',
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

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-screen w-96 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-4 border-b flex justify-between items-center bg-green-600 text-white">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Endurancy Copilot</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-green-700">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
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
          <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Copilot;