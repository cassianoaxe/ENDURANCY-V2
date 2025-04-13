'use client';

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  nome: z.string().min(3, "Nome do documento deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  versao: z.string().min(1, "Versão do documento é obrigatória"),
  nivelAcesso: z.enum(["público", "restrito"]),
});

type NovoDocumentoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NovoDocumentoDialog({ open, onOpenChange }: NovoDocumentoDialogProps) {
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      categoria: "",
      versao: "v1.0",
      nivelAcesso: "público",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!arquivoSelecionado) {
      alert("Por favor, selecione um arquivo.");
      return;
    }
    
    console.log(values, arquivoSelecionado);
    // Aqui você implementaria a lógica para adicionar o documento
    onOpenChange(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivoSelecionado(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Preencha as informações do documento e faça o upload do arquivo. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Documento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Política de Recursos Humanos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o conteúdo e a finalidade do documento" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Políticas">Políticas</SelectItem>
                        <SelectItem value="Formulários">Formulários</SelectItem>
                        <SelectItem value="Manuais">Manuais</SelectItem>
                        <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                        <SelectItem value="Legais">Legais</SelectItem>
                        <SelectItem value="Planilhas">Planilhas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="versao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versão *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: v1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="nivelAcesso"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Nível de Acesso *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="público" id="publico" />
                        <Label htmlFor="publico">Público</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="restrito" id="restrito" />
                        <Label htmlFor="restrito">Restrito</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Documentos públicos são acessíveis a todos os colaboradores. Documentos restritos são acessíveis apenas a departamentos específicos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mt-4">
              <Label>Upload do Arquivo *</Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                <div className="space-y-2 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div className="flex flex-col items-center text-sm">
                    <Label 
                      htmlFor="file-upload" 
                      className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                    >
                      <span>Clique para selecionar</span>
                      <Input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, XLSX, até 10MB
                    </p>
                  </div>
                  {arquivoSelecionado && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <FileText className="mr-2 h-4 w-4" />
                      {arquivoSelecionado.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {!arquivoSelecionado && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  É necessário selecionar um arquivo para continuar.
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Documento</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}