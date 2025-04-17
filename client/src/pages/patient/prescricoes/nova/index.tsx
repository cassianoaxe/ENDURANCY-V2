'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Upload,
  Paperclip,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Camera,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Loader2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Medico {
  id: number;
  nome: string;
  especialidade: string;
  crm: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  concentracao: string;
}

const NovaPrescricaoPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState('');
  const [produtosSelecionados, setProdutosSelecionados] = useState<string[]>([]);
  const [descricao, setDescricao] = useState('');
  const [dataConsulta, setDataConsulta] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Verificar se o usuário está logado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Usuário não autenticado. Redirecionando para o login...");
      window.location.href = '/patient/login';
    }
  }, [authLoading, isAuthenticated]);
  
  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Em um ambiente real, faria chamadas API:
        // const medicoResponse = await axios.get('/api/patient/medicos');
        // const produtosResponse = await axios.get('/api/patient/produtos/prescricao');
        // setMedicos(medicoResponse.data);
        // setProdutos(produtosResponse.data);
        
        // Dados de exemplo para demonstração
        const medicosExemplo: Medico[] = [
          { id: 1, nome: "Dr. João Silva", especialidade: "Neurologia", crm: "CRM-SP 12345" },
          { id: 2, nome: "Dra. Maria Oliveira", especialidade: "Psiquiatria", crm: "CRM-SP 67890" },
          { id: 3, nome: "Dr. Carlos Santos", especialidade: "Clínica Médica", crm: "CRM-SP 54321" },
          { id: 4, nome: "Dra. Ana Costa", especialidade: "Endocrinologia", crm: "CRM-SP 09876" },
        ];
        
        const produtosExemplo: Produto[] = [
          { id: 1, nome: "CBD Oil 5%", descricao: "Óleo de CBD 5%", categoria: "Óleos", concentracao: "5% (1500mg)" },
          { id: 2, nome: "CBD Gummies", descricao: "Gomas de CBD", categoria: "Comestíveis", concentracao: "25mg / goma" },
          { id: 4, nome: "CBD Full Spectrum Oil", descricao: "Óleo full spectrum", categoria: "Óleos", concentracao: "10% (3000mg)" },
          { id: 5, nome: "Cápsulas de CBD", descricao: "Cápsulas de CBD", categoria: "Cápsulas", concentracao: "50mg / cápsula" },
          { id: 6, nome: "Spray Oral CBD", descricao: "Spray sublingual", categoria: "Sprays", concentracao: "3% (900mg)" },
        ];
        
        setMedicos(medicosExemplo);
        setProdutos(produtosExemplo);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível recuperar as informações necessárias. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Função para iniciar a câmera
  const iniciarCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setShowCamera(true);
        }
      } else {
        toast({
          title: "Câmera não disponível",
          description: "Seu dispositivo não suporta acesso à câmera.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
      toast({
        title: "Erro de acesso à câmera",
        description: "Não foi possível acessar sua câmera. Verifique as permissões.",
        variant: "destructive"
      });
    }
  };
  
  // Função para tirar foto
  const tirarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoDataUrl(dataUrl);
        
        // Parar stream de vídeo
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setShowCamera(false);
        
        // Converter dataURL para Blob e depois para File
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "prescricao.jpg", { type: "image/jpeg" });
            setSelectedFile(file);
          });
      }
    }
  };
  
  // Função para cancelar a câmera
  const cancelarCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setShowCamera(false);
    }
  };
  
  // Função para selecionar arquivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Verificar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Por favor, envie uma imagem (JPG/PNG) ou um arquivo PDF.",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar tamanho (limitar a 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Se for uma imagem, criar preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            setPhotoDataUrl(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Se for PDF, limpar preview de imagem
        setPhotoDataUrl('');
      }
    }
  };
  
  // Função para remover arquivo selecionado
  const removerArquivo = () => {
    setSelectedFile(null);
    setPhotoDataUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Função para alternar seleção de produto
  const toggleProdutoSelecionado = (produtoId: string) => {
    setProdutosSelecionados(atual => {
      if (atual.includes(produtoId)) {
        return atual.filter(id => id !== produtoId);
      } else {
        return [...atual, produtoId];
      }
    });
  };
  
  // Função para enviar prescrição
  const enviarPrescricao = async () => {
    // Validar formulário
    if (!medicoSelecionado) {
      toast({
        title: "Médico não selecionado",
        description: "Por favor, selecione o médico que emitiu a prescrição.",
        variant: "destructive"
      });
      return;
    }
    
    if (produtosSelecionados.length === 0) {
      toast({
        title: "Produtos não selecionados",
        description: "Por favor, selecione pelo menos um produto relacionado à prescrição.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedFile) {
      toast({
        title: "Prescrição não anexada",
        description: "Por favor, anexe uma foto ou arquivo PDF da sua prescrição médica.",
        variant: "destructive"
      });
      return;
    }
    
    if (!dataConsulta) {
      toast({
        title: "Data da consulta não informada",
        description: "Por favor, informe a data em que a prescrição foi emitida.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Simulação de upload com progresso
      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 15) + 5;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
          }
          setUploadProgress(progress);
        }, 500);
        
        return new Promise<void>(resolve => {
          setTimeout(() => {
            clearInterval(interval);
            setUploadProgress(100);
            resolve();
          }, 3000);
        });
      };
      
      // Em um ambiente real, seria uma chamada API com FormData
      /*
      const formData = new FormData();
      formData.append('medicoId', medicoSelecionado);
      formData.append('dataConsulta', dataConsulta);
      formData.append('descricao', descricao);
      formData.append('arquivo', selectedFile);
      produtosSelecionados.forEach(produtoId => {
        formData.append('produtos[]', produtoId);
      });
      
      await axios.post('/api/patient/prescricoes', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      */
      
      // Simulação de upload
      await simulateUpload();
      
      setShowSuccess(true);
      
      // Limpar formulário
      setMedicoSelecionado('');
      setProdutosSelecionados([]);
      setDescricao('');
      setDataConsulta('');
      setSelectedFile(null);
      setPhotoDataUrl('');
      
    } catch (error) {
      console.error("Erro ao enviar prescrição:", error);
      toast({
        title: "Erro ao enviar prescrição",
        description: "Não foi possível enviar sua prescrição. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Cabeçalho da página */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation('/patient/dashboard')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Enviar Nova Prescrição
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Envie uma foto ou escaneamento da sua prescrição médica para validação
          </p>
        </div>
        
        {/* Formulário da prescrição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Detalhes da Prescrição
            </CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios e anexe sua prescrição médica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Médico */}
            <div className="space-y-2">
              <Label htmlFor="medico">Médico que emitiu a prescrição <span className="text-red-500">*</span></Label>
              <Select value={medicoSelecionado} onValueChange={setMedicoSelecionado}>
                <SelectTrigger id="medico">
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {medicos.map((medico) => (
                    <SelectItem key={medico.id} value={medico.id.toString()}>
                      {medico.nome} - {medico.especialidade} ({medico.crm})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Data da consulta */}
            <div className="space-y-2">
              <Label htmlFor="data-consulta">Data da consulta <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  id="data-consulta"
                  type="date"
                  value={dataConsulta}
                  onChange={(e) => setDataConsulta(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Produtos relacionados */}
            <div className="space-y-2">
              <Label>Produtos prescritos <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {produtos.map((produto) => (
                  <div 
                    key={produto.id}
                    className={`p-3 rounded-md cursor-pointer border transition-colors flex items-start
                      ${produtosSelecionados.includes(produto.id.toString()) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggleProdutoSelecionado(produto.id.toString())}
                  >
                    <div className={`w-4 h-4 rounded-full mt-1 mr-2 flex-shrink-0
                      ${produtosSelecionados.includes(produto.id.toString()) 
                        ? 'bg-primary' 
                        : 'border border-gray-300'}`}
                    />
                    <div>
                      <div className="font-medium text-sm">{produto.nome}</div>
                      <div className="text-xs text-gray-500">{produto.concentracao}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upload da prescrição */}
            <div className="space-y-2">
              <Label>Anexar prescrição <span className="text-red-500">*</span></Label>
              
              {!selectedFile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm font-medium">Selecionar arquivo</p>
                    <p className="mt-1 text-xs text-gray-500">PDF, JPG ou PNG (máx. 5MB)</p>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                  
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={iniciarCamera}
                  >
                    <Camera className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm font-medium">Tirar foto</p>
                    <p className="mt-1 text-xs text-gray-500">Use a câmera do seu dispositivo</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 relative">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute right-2 top-2 bg-white"
                    onClick={removerArquivo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {photoDataUrl ? (
                    <div>
                      <img 
                        src={photoDataUrl} 
                        alt="Preview da prescrição" 
                        className="max-h-64 mx-auto rounded-md"
                      />
                      <p className="mt-2 text-center text-sm text-gray-500">
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Paperclip className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {selectedFile.type} • {(selectedFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Interface da câmera */}
            {showCamera && (
              <Dialog open={showCamera} onOpenChange={setShowCamera}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tirar foto da prescrição</DialogTitle>
                    <DialogDescription>
                      Certifique-se de que o documento esteja bem iluminado e legível.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative">
                    <video 
                      ref={videoRef} 
                      width="100%" 
                      height="auto" 
                      autoPlay 
                      playsInline 
                      className="rounded-md"
                    />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={cancelarCamera}>
                      Cancelar
                    </Button>
                    <Button onClick={tirarFoto}>
                      <Camera className="mr-2 h-4 w-4" />
                      Tirar Foto
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Adicione informações relevantes sobre sua prescrição..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/patient/dashboard')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={enviarPrescricao}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Prescrição
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Progresso de upload */}
        {isSubmitting && (
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Enviando prescrição...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
        
        {/* Dialog de sucesso */}
        <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Prescrição enviada com sucesso
              </AlertDialogTitle>
              <AlertDialogDescription>
                Sua prescrição foi enviada e está aguardando análise pela nossa equipe de farmacêuticos.
                Você receberá uma notificação quando a prescrição for aprovada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setShowSuccess(false);
                  setLocation('/patient/dashboard');
                }}
              >
                Voltar ao Dashboard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default NovaPrescricaoPage;