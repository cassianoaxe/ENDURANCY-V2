import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Plus, Trash2, Settings, Layout, Eye, FileText, ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Componente para arrastar e soltar campos
const DraggableField = ({ field, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-3 mb-2 bg-white border rounded-md shadow-sm cursor-move hover:border-primary">
      <div className="flex items-center">
        <div className="p-2 mr-3 text-white bg-primary rounded">
          {field.type === 'text' && <FileText className="w-4 h-4" />}
          {field.type === 'textarea' && <ClipboardList className="w-4 h-4" />}
          {field.type === 'select' && <Layout className="w-4 h-4" />}
          {field.type === 'checkbox' && <Settings className="w-4 h-4" />}
        </div>
        <div>
          <p className="font-medium">{field.label}</p>
          <p className="text-xs text-gray-500">{field.type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {field.required && <Badge variant="outline">Obrigatório</Badge>}
        <Button variant="ghost" size="icon" onClick={() => onDelete(field.id)}>
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </Button>
      </div>
    </div>
  );
};

export default function NovoFormulario() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("editor");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFields, setFormFields] = useState([
    { id: 1, type: 'text', label: 'Nome Completo', placeholder: 'Digite seu nome completo', required: true },
    { id: 2, type: 'text', label: 'Email', placeholder: 'Digite seu email', required: true },
    { id: 3, type: 'select', label: 'Tipo de Organização', options: ['Associação', 'Clínica', 'Hospital', 'Outro'], required: true },
    { id: 4, type: 'textarea', label: 'Descrição', placeholder: 'Descreva sua organização', required: false },
    { id: 5, type: 'checkbox', label: 'Aceito os termos e condições', required: true }
  ]);
  
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState("");
  
  const [isPublic, setIsPublic] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [notifyAdmin, setNotifyAdmin] = useState(true);
  
  // Função para adicionar um novo campo
  const addField = () => {
    if (!newFieldLabel) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do campo é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    const newId = formFields.length > 0 ? Math.max(...formFields.map(f => f.id)) + 1 : 1;
    
    const newField = {
      id: newId,
      type: newFieldType,
      label: newFieldLabel,
      placeholder: newFieldPlaceholder,
      required: newFieldRequired
    };
    
    if (newFieldType === 'select' && newFieldOptions) {
      newField.options = newFieldOptions.split(',').map(opt => opt.trim());
    }
    
    setFormFields([...formFields, newField]);
    
    // Limpar o formulário
    setNewFieldType("text");
    setNewFieldLabel("");
    setNewFieldPlaceholder("");
    setNewFieldRequired(false);
    setNewFieldOptions("");
    
    toast({
      title: "Campo adicionado",
      description: `O campo "${newFieldLabel}" foi adicionado com sucesso`,
    });
  };
  
  // Função para excluir um campo
  const deleteField = (id) => {
    setFormFields(formFields.filter(field => field.id !== id));
    
    toast({
      title: "Campo removido",
      description: "O campo foi removido com sucesso",
    });
  };
  
  // Função para salvar o formulário
  const saveForm = () => {
    if (!formTitle) {
      toast({
        title: "Campo obrigatório",
        description: "O título do formulário é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    if (formFields.length === 0) {
      toast({
        title: "Nenhum campo adicionado",
        description: "Adicione pelo menos um campo ao formulário",
        variant: "destructive",
      });
      return;
    }
    
    // Aqui você implementaria a lógica para salvar o formulário no servidor
    console.log('Formulário a ser salvo:', {
      title: formTitle,
      description: formDescription,
      fields: formFields,
      isPublic,
      requiresApproval,
      notifyAdmin
    });
    
    toast({
      title: "Formulário salvo",
      description: "O formulário foi criado com sucesso",
    });
    
    // Redirecionar para a lista de formulários
    window.history.pushState({}, '', '/cadastro/formularios');
    window.dispatchEvent(new Event('popstate'));
  };
  
  // Navegação para voltar à lista de formulários
  const goBack = () => {
    window.history.pushState({}, '', '/cadastro/formularios');
    window.dispatchEvent(new Event('popstate'));
  };
  
  // Renderização dinâmica dos campos no preview
  const renderPreviewField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2 mb-4" key={field.id}>
            <Label htmlFor={`field-${field.id}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input 
              id={`field-${field.id}`} 
              placeholder={field.placeholder} 
              disabled={currentTab === "preview"}
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="space-y-2 mb-4" key={field.id}>
            <Label htmlFor={`field-${field.id}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea 
              id={`field-${field.id}`} 
              placeholder={field.placeholder} 
              disabled={currentTab === "preview"}
            />
          </div>
        );
      case 'select':
        return (
          <div className="space-y-2 mb-4" key={field.id}>
            <Label htmlFor={`field-${field.id}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select disabled={currentTab === "preview"}>
              <SelectTrigger id={`field-${field.id}`}>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 mb-4" key={field.id}>
            <Switch id={`field-${field.id}`} disabled={currentTab === "preview"} />
            <Label htmlFor={`field-${field.id}`}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Novo Formulário</h1>
            <p className="text-gray-600">Crie um novo formulário de cadastro</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={goBack}>Cancelar</Button>
          <Button onClick={saveForm} className="gap-1.5">
            <Save className="h-4 w-4" /> Salvar Formulário
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="editor" value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="mb-4 grid grid-cols-3 w-[400px]">
          <TabsTrigger value="editor" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> Visualização
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5">
            <Settings className="h-4 w-4" /> Configurações
          </TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Propriedades do formulário - sempre mostrado à esquerda */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Propriedades do Formulário</CardTitle>
              <CardDescription>Configure as informações básicas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-title">Título do Formulário</Label>
                <Input 
                  id="form-title" 
                  placeholder="Ex: Cadastro de Organização" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="form-description">Descrição</Label>
                <Textarea 
                  id="form-description" 
                  placeholder="Descreva o propósito deste formulário" 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="form-type">Tipo de Formulário</Label>
                <Select defaultValue="organization">
                  <SelectTrigger id="form-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organization">Cadastro de Organização</SelectItem>
                    <SelectItem value="patient">Cadastro de Paciente</SelectItem>
                    <SelectItem value="doctor">Cadastro de Médico</SelectItem>
                    <SelectItem value="custom">Formulário Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Conteúdo principal baseado na aba selecionada */}
          <div className="lg:col-span-2">
            {/* Tab de Editor */}
            <TabsContent value="editor" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Painel de campos disponíveis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Adicionar Campo</CardTitle>
                    <CardDescription>Configure e adicione um novo campo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="field-type">Tipo de Campo</Label>
                      <Select value={newFieldType} onValueChange={setNewFieldType}>
                        <SelectTrigger id="field-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="textarea">Área de Texto</SelectItem>
                          <SelectItem value="select">Lista de Seleção</SelectItem>
                          <SelectItem value="checkbox">Caixa de Seleção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="field-label">Nome do Campo</Label>
                      <Input 
                        id="field-label" 
                        placeholder="Ex: Nome Completo" 
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                      />
                    </div>
                    
                    {newFieldType !== 'checkbox' && (
                      <div className="space-y-2">
                        <Label htmlFor="field-placeholder">Texto de Exemplo</Label>
                        <Input 
                          id="field-placeholder" 
                          placeholder="Ex: Digite seu nome completo" 
                          value={newFieldPlaceholder}
                          onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                        />
                      </div>
                    )}
                    
                    {newFieldType === 'select' && (
                      <div className="space-y-2">
                        <Label htmlFor="field-options">Opções (separadas por vírgula)</Label>
                        <Input 
                          id="field-options" 
                          placeholder="Ex: Opção 1, Opção 2, Opção 3" 
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch 
                        id="field-required" 
                        checked={newFieldRequired}
                        onCheckedChange={setNewFieldRequired}
                      />
                      <Label htmlFor="field-required">Campo Obrigatório</Label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={addField} className="w-full gap-1.5">
                      <Plus className="h-4 w-4" /> Adicionar Campo
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Painel de campos existentes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campos do Formulário</CardTitle>
                    <CardDescription>
                      {formFields.length === 0 
                        ? 'Nenhum campo adicionado' 
                        : `${formFields.length} campo(s) configurado(s)`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                    {formFields.map(field => (
                      <DraggableField 
                        key={field.id} 
                        field={field} 
                        onDelete={deleteField} 
                      />
                    ))}
                    
                    {formFields.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mb-2 opacity-20" />
                        <p>Nenhum campo adicionado</p>
                        <p className="text-sm mt-1">Adicione campos usando o painel ao lado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Tab de Preview */}
            <TabsContent value="preview" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{formTitle || "Título do Formulário"}</CardTitle>
                  <CardDescription>{formDescription || "Descrição do formulário"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-2">
                    {formFields.map(field => renderPreviewField(field))}
                    
                    {formFields.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Este formulário não possui campos</p>
                      </div>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button disabled>Enviar Formulário</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Tab de Configurações */}
            <TabsContent value="settings" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Formulário</CardTitle>
                  <CardDescription>Defina como o formulário será processado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="is-public" className="text-base">Formulário Público</Label>
                        <p className="text-sm text-muted-foreground">
                          Permitir acesso sem autenticação
                        </p>
                      </div>
                      <Switch 
                        id="is-public" 
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requires-approval" className="text-base">Exigir Aprovação</Label>
                        <p className="text-sm text-muted-foreground">
                          Os cadastros precisam ser aprovados manualmente
                        </p>
                      </div>
                      <Switch 
                        id="requires-approval" 
                        checked={requiresApproval}
                        onCheckedChange={setRequiresApproval}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-admin" className="text-base">Notificar Administradores</Label>
                        <p className="text-sm text-muted-foreground">
                          Enviar email quando novos cadastros forem realizados
                        </p>
                      </div>
                      <Switch 
                        id="notify-admin" 
                        checked={notifyAdmin}
                        onCheckedChange={setNotifyAdmin}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="success-message">Mensagem de Sucesso</Label>
                      <Textarea 
                        id="success-message" 
                        placeholder="Mensagem exibida após o envio do formulário" 
                        defaultValue="Cadastro realizado com sucesso! Em breve entraremos em contato."
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="redirect-url">URL de Redirecionamento (opcional)</Label>
                      <Input 
                        id="redirect-url" 
                        placeholder="Ex: /cadastro-sucesso" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe em branco para manter o usuário na página atual com mensagem de sucesso
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}