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
  Beaker, ArrowLeft, Save, Download, Upload, Trash2, 
  Edit, BarChart2, Eye, EyeOff, CheckCircle2, Copy
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StrainsList = [
  { 
    id: 1, 
    name: "Charlotte's Angel", 
    type: "Híbrido (Sativa dominante)",
    thc_min: 0.5,
    thc_max: 1.0,
    cbd_min: 10.0,
    cbd_max: 15.0,
    flowering_time: "9-10 semanas",
    status: "Ativo",
    description: "Variedade rica em CBD desenvolvida para uso medicinal, com efeitos mínimos psicoativos devido ao baixo teor de THC.",
    cultivation_notes: "Prefere ambiente com baixa umidade e boa circulação de ar. Responde bem à técnica LST (Low Stress Training).",
    genetics: "CBD Genetics x Red Angel"
  },
  { 
    id: 2, 
    name: "Northern Lights", 
    type: "Indica",
    thc_min: 16.0,
    thc_max: 21.0,
    cbd_min: 0.1,
    cbd_max: 0.2,
    flowering_time: "7-8 semanas",
    status: "Ativo",
    description: "Clássica variedade Indica conhecida por seus efeitos relaxantes e sabor doce e picante.",
    cultivation_notes: "Cresce bem em espaços compactos. Resistente a pragas e fungos. Ideal para iniciantes.",
    genetics: "Afghan x Thai"
  },
  { 
    id: 3, 
    name: "Jack Herer", 
    type: "Sativa",
    thc_min: 18.0,
    thc_max: 24.0,
    cbd_min: 0.2,
    cbd_max: 0.4,
    flowering_time: "8-10 semanas",
    status: "Ativo",
    description: "Strain equilibrado e potente, nomeado em homenagem ao ativista canábico.",
    cultivation_notes: "Cresce vigorosamente em altura. Requer podas regulares. Boa para técnica SCROG.",
    genetics: "Skunk x Northern Lights x Haze"
  }
];

const StrainsConfigPage = () => {
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Sativa',
    thc_min: 0,
    thc_max: 0,
    cbd_min: 0,
    cbd_max: 0,
    flowering_time: '',
    status: 'Ativo',
    description: '',
    cultivation_notes: '',
    genetics: ''
  });

  const handleSelectStrain = (strain) => {
    setSelectedStrain(strain);
    setFormData({
      name: strain.name,
      type: strain.type,
      thc_min: strain.thc_min,
      thc_max: strain.thc_max,
      cbd_min: strain.cbd_min,
      cbd_max: strain.cbd_max,
      flowering_time: strain.flowering_time,
      status: strain.status,
      description: strain.description,
      cultivation_notes: strain.cultivation_notes,
      genetics: strain.genetics
    });
    setEditMode(false);
  };

  const handleNewStrain = () => {
    setSelectedStrain(null);
    setFormData({
      name: '',
      type: 'Sativa',
      thc_min: 0,
      thc_max: 0,
      cbd_min: 0,
      cbd_max: 0,
      flowering_time: '',
      status: 'Ativo',
      description: '',
      cultivation_notes: '',
      genetics: ''
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

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    // If it was a new strain, you might want to set selectedStrain to the newly created strain
    if (!selectedStrain) {
      setSelectedStrain({
        id: StrainsList.length + 1,
        ...formData
      });
    }
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Strains</h1>
            <Badge className="ml-2">{StrainsList.length} strains</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" asChild>
              <a href="/organization/cultivation/configuracao">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </a>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-1" onClick={handleNewStrain}>
              <Beaker className="h-4 w-4" />
              <span>Nova Strain</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Strains</CardTitle>
                <CardDescription>Selecione para visualizar detalhes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {StrainsList.map((strain) => (
                    <div 
                      key={strain.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedStrain?.id === strain.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => handleSelectStrain(strain)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{strain.name}</h3>
                          <p className="text-xs text-gray-500">{strain.type}</p>
                        </div>
                        <Badge className={`
                          ${strain.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {strain.status}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        <span>THC: {strain.thc_min}-{strain.thc_max}%</span>
                        <span className="mx-2">•</span>
                        <span>CBD: {strain.cbd_min}-{strain.cbd_max}%</span>
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
                      ? (selectedStrain ? `Editar ${selectedStrain.name}` : 'Nova Strain') 
                      : (selectedStrain ? selectedStrain.name : 'Detalhes da Strain')}
                  </CardTitle>
                  <CardDescription>
                    {editMode 
                      ? 'Edite as informações da strain' 
                      : 'Visualize informações detalhadas'}
                  </CardDescription>
                </div>
                {selectedStrain && !editMode && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <BarChart2 className="h-4 w-4" />
                      <span>Desempenho</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={handleEditMode}>
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {!selectedStrain && !editMode ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <Beaker className="h-8 w-8 mb-2 text-gray-400" />
                    <p>Selecione uma strain para ver os detalhes</p>
                    <p className="text-sm mt-1">ou</p>
                    <Button variant="link" className="mt-1" onClick={handleNewStrain}>
                      Cadastre uma nova strain
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Strain</Label>
                          <Input 
                            id="name" 
                            name="name"
                            value={formData.name} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Ex: Charlotte's Angel"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo</Label>
                          <Select 
                            disabled={!editMode}
                            value={formData.type}
                            onValueChange={(value) => handleSelectChange('type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sativa">Sativa</SelectItem>
                              <SelectItem value="Indica">Indica</SelectItem>
                              <SelectItem value="Ruderalis">Ruderalis</SelectItem>
                              <SelectItem value="Híbrido (Sativa dominante)">Híbrido (Sativa dominante)</SelectItem>
                              <SelectItem value="Híbrido (Indica dominante)">Híbrido (Indica dominante)</SelectItem>
                              <SelectItem value="Industrial (CBD)">Industrial (CBD)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="thc_min">THC Min (%)</Label>
                          <Input 
                            id="thc_min" 
                            name="thc_min"
                            type="number"
                            step="0.1"
                            value={formData.thc_min} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            min="0"
                            max="35"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thc_max">THC Max (%)</Label>
                          <Input 
                            id="thc_max" 
                            name="thc_max"
                            type="number"
                            step="0.1"
                            value={formData.thc_max} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            min="0"
                            max="35"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cbd_min">CBD Min (%)</Label>
                          <Input 
                            id="cbd_min" 
                            name="cbd_min"
                            type="number"
                            step="0.1"
                            value={formData.cbd_min} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            min="0"
                            max="25"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cbd_max">CBD Max (%)</Label>
                          <Input 
                            id="cbd_max" 
                            name="cbd_max"
                            type="number"
                            step="0.1"
                            value={formData.cbd_max} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            min="0"
                            max="25"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                          <Label htmlFor="genetics">Genética</Label>
                          <Input 
                            id="genetics" 
                            name="genetics"
                            value={formData.genetics} 
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Ex: Skunk x Northern Lights"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea 
                          id="description" 
                          name="description"
                          value={formData.description} 
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="Descreva as características principais desta strain"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cultivation_notes">Notas de Cultivo</Label>
                        <Textarea 
                          id="cultivation_notes" 
                          name="cultivation_notes"
                          value={formData.cultivation_notes} 
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="Dicas e requisitos específicos para o cultivo"
                          rows={3}
                        />
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
                            if (selectedStrain) {
                              handleSelectStrain(selectedStrain);
                            } else {
                              setEditMode(false);
                              setSelectedStrain(null);
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
              {selectedStrain && !editMode && (
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Copy className="h-4 w-4" />
                    <span>Duplicar</span>
                  </Button>
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

export default bypassModuleAccess(StrainsConfigPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});