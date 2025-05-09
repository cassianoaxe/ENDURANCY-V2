import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shapes, ArrowLeft, Save, Download, Upload, Trash2, 
  Edit, CheckCircle2, EyeOff, Plus
} from 'lucide-react';

const TiposPlantaList = [
  { 
    id: 1, 
    name: "Cannabis Sativa",
    description: "Plantas mais altas, com folhas finas e estrutura mais aberta. Geralmente associadas a efeitos energéticos e criativos.",
    vegetative_time: "4-8 semanas",
    flowering_time: "10-16 semanas",
    height: "150-300cm",
    status: "Ativo",
    characteristics: [
      "Folhas finas e alongadas",
      "Estrutura alta e menos densa",
      "Internódios mais longos",
      "Maior período de floração",
      "Mais adequada para climas quentes e tropicais"
    ]
  },
  { 
    id: 2, 
    name: "Cannabis Indica",
    description: "Plantas mais baixas e compactas, com folhas largas e densa folhagem. Geralmente associadas a efeitos relaxantes e sedativos.",
    vegetative_time: "3-6 semanas",
    flowering_time: "6-9 semanas",
    height: "60-150cm",
    status: "Ativo",
    characteristics: [
      "Folhas largas e curtas",
      "Estrutura baixa e compacta",
      "Internódios curtos",
      "Período de floração menor",
      "Mais adequada para climas frios e secos"
    ]
  },
  { 
    id: 3, 
    name: "Cannabis Ruderalis",
    description: "Plantas autoflorum com ciclo de vida mais curto. Mais resistentes e não dependem de fotoperíodo para floração.",
    vegetative_time: "2-3 semanas",
    flowering_time: "5-7 semanas",
    height: "40-80cm",
    status: "Ativo",
    characteristics: [
      "Porte pequeno e resistente",
      "Ciclo de vida acelerado",
      "Floração automática (independente de fotoperíodo)",
      "Maior resistência a pragas e condições adversas",
      "Geralmente menor potência, mas mais estável"
    ]
  },
  { 
    id: 4, 
    name: "Híbridos",
    description: "Cruzamentos entre sativa, indica e/ou ruderalis, combinando características e benefícios de múltiplas variedades.",
    vegetative_time: "3-7 semanas",
    flowering_time: "7-12 semanas",
    height: "80-200cm",
    status: "Ativo",
    characteristics: [
      "Características mistas das plantas parentais",
      "Potencial para vigor híbrido",
      "Maior flexibilidade de cultivo",
      "Efeitos mais balanceados",
      "Adaptabilidade a diferentes ambientes"
    ]
  },
  { 
    id: 5, 
    name: "Industrial (CBD)",
    description: "Variedades com baixo teor de THC e alto teor de CBD, cultivadas principalmente para fins medicinais.",
    vegetative_time: "3-6 semanas",
    flowering_time: "7-10 semanas",
    height: "100-200cm",
    status: "Ativo",
    characteristics: [
      "Baixo teor de THC (<0.3% na maioria dos casos)",
      "Alto teor de CBD e outros canabinóides não-psicoativos",
      "Estrutura semelhante ao cânhamo industrial",
      "Adequada para cultivo em grande escala",
      "Conformidade com regulamentações médicas"
    ]
  }
];

const TiposConfigPage = () => {
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vegetative_time: '',
    flowering_time: '',
    height: '',
    status: 'Ativo',
    characteristics: ['']
  });

  const handleSelectTipo = (tipo) => {
    setSelectedTipo(tipo);
    setFormData({
      name: tipo.name,
      description: tipo.description,
      vegetative_time: tipo.vegetative_time,
      flowering_time: tipo.flowering_time,
      height: tipo.height,
      status: tipo.status,
      characteristics: [...tipo.characteristics]
    });
    setEditMode(false);
  };

  const handleNewTipo = () => {
    setSelectedTipo(null);
    setFormData({
      name: '',
      description: '',
      vegetative_time: '',
      flowering_time: '',
      height: '',
      status: 'Ativo',
      characteristics: ['']
    });
    setEditMode(true);
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCharacteristicChange = (index, value) => {
    const newCharacteristics = [...formData.characteristics];
    newCharacteristics[index] = value;
    setFormData(prev => ({
      ...prev,
      characteristics: newCharacteristics
    }));
  };

  const addCharacteristic = () => {
    setFormData(prev => ({
      ...prev,
      characteristics: [...prev.characteristics, '']
    }));
  };

  const removeCharacteristic = (index) => {
    const newCharacteristics = [...formData.characteristics];
    newCharacteristics.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      characteristics: newCharacteristics
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      status: checked ? 'Ativo' : 'Inativo'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally save the data to the backend
    setEditMode(false);
    // If it was a new tipo, you might want to set selectedTipo to the newly created tipo
    if (!selectedTipo) {
      setSelectedTipo({
        id: TiposPlantaList.length + 1,
        ...formData
      });
    }
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-800">Tipos de Plantas</h1>
            <Badge className="ml-2">{TiposPlantaList.length} tipos</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" asChild>
              <a href="/organization/cultivation/configuracao">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </a>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-1" onClick={handleNewTipo}>
              <Shapes className="h-4 w-4" />
              <span>Novo Tipo</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categorias Cadastradas</CardTitle>
                <CardDescription>Classificações disponíveis no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {TiposPlantaList.map((tipo) => (
                    <div 
                      key={tipo.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedTipo?.id === tipo.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => handleSelectTipo(tipo)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{tipo.name}</h3>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {tipo.description.substring(0, 60)}...
                          </p>
                        </div>
                        <Badge className={`
                          ${tipo.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {tipo.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Upload className="h-4 w-4" />
                  <span>Importar</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>
                    {editMode 
                      ? (selectedTipo ? `Editar ${selectedTipo.name}` : 'Novo Tipo') 
                      : (selectedTipo ? selectedTipo.name : 'Detalhes do Tipo')}
                  </CardTitle>
                  <CardDescription>
                    {editMode 
                      ? 'Edite as informações desta categoria' 
                      : 'Visualize informações detalhadas'}
                  </CardDescription>
                </div>
                {selectedTipo && !editMode && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={handleEditMode}>
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {!selectedTipo && !editMode ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <Shapes className="h-8 w-8 mb-2 text-gray-400" />
                    <p>Selecione um tipo para ver os detalhes</p>
                    <p className="text-sm mt-1">ou</p>
                    <Button variant="link" className="mt-1" onClick={handleNewTipo}>
                      Cadastre um novo tipo
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Tipo</Label>
                        <Input 
                          id="name" 
                          name="name"
                          value={formData.name} 
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="Ex: Cannabis Sativa"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea 
                          id="description" 
                          name="description"
                          value={formData.description} 
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="Descreva as características principais desta categoria"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vegetative_time">Tempo Vegetativo</Label>
                          <Input 
                            id="vegetative_time" 
                            name="vegetative_time"
                            value={formData.vegetative_time} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Ex: 4-8 semanas"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="flowering_time">Tempo de Floração</Label>
                          <Input 
                            id="flowering_time" 
                            name="flowering_time"
                            value={formData.flowering_time} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Ex: 8-10 semanas"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Altura Média</Label>
                          <Input 
                            id="height" 
                            name="height"
                            value={formData.height} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Ex: 100-150cm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Características Principais</Label>
                          {editMode && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={addCharacteristic}
                              className="gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Adicionar</span>
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {formData.characteristics.map((characteristic, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={characteristic}
                                onChange={(e) => handleCharacteristicChange(index, e.target.value)}
                                disabled={!editMode}
                                placeholder={`Característica ${index + 1}`}
                              />
                              {editMode && formData.characteristics.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => removeCharacteristic(index)}
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="status" 
                            checked={formData.status === 'Ativo'}
                            onCheckedChange={handleSwitchChange}
                            disabled={!editMode}
                          />
                          <Label htmlFor="status" className="cursor-pointer">
                            {formData.status === 'Ativo' ? (
                              <span className="flex items-center text-green-600 font-medium">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Ativo
                              </span>
                            ) : (
                              <span className="flex items-center text-gray-600 font-medium">
                                <EyeOff className="h-4 w-4 mr-1" />
                                Inativo
                              </span>
                            )}
                          </Label>
                        </div>
                      </div>
                    </div>

                    {editMode && (
                      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            if (selectedTipo) {
                              handleSelectTipo(selectedTipo);
                            } else {
                              setEditMode(false);
                              setSelectedTipo(null);
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="gap-1 bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4" />
                          <span>Salvar</span>
                        </Button>
                      </div>
                    )}
                  </form>
                )}
              </CardContent>
              {selectedTipo && !editMode && (
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-xs text-gray-500">
                    {`ID: ${selectedTipo.id} • Atualizado: 01/05/2025`}
                  </div>
                  <Button variant="destructive" size="sm" className="gap-1">
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(TiposConfigPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});