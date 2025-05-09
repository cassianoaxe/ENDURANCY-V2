import React from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Beaker, 
  Shapes, 
  Settings, 
  ListFilter, 
  Users, 
  Building,
  BarChart2,
  ClipboardCheck,
  CloudRain,
  Thermometer,
  Database,
  Scale,
  FileText
} from 'lucide-react';

const ConfiguracaoPage = () => {
  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Configurações do Cultivo</h1>
          <Button variant="outline" className="gap-1" asChild>
            <a href="/organization/cultivation">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Dashboard</span>
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Configuração de Strains */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Beaker className="h-5 w-5 text-violet-500" />
                <span>Strains</span>
              </CardTitle>
              <CardDescription>
                Gerenciar variedades genéticas e suas características
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Cadastre, edite e gerencie as strains utilizadas no cultivo, com informações sobre teores de cannabinoides, tempos de floração e características.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a href="/organization/cultivation/configuracao/strains">
                  Gerenciar Strains
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Configuração de Tipos */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shapes className="h-5 w-5 text-emerald-500" />
                <span>Tipos de Plantas</span>
              </CardTitle>
              <CardDescription>
                Configurar categorias e classificações de plantas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Define os tipos básicos (Sativa, Indica, Ruderalis, Híbridos) e suas características genéricas para posterior associação com strains específicas.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a href="/organization/cultivation/configuracao/tipos">
                  Gerenciar Tipos
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Configuração de Estufas */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-amber-500" />
                <span>Estufas e Ambientes</span>
              </CardTitle>
              <CardDescription>
                Configurar espaços físicos de cultivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Gerencie estufas, salas de cultivo e outros ambientes, definindo capacidade, condições ambientais alvo e equipamentos instalados.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <a href="/organization/cultivation/estufas">
                  Gerenciar Estufas
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Configuração de Parâmetros Ambientais */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-blue-500" />
                <span>Parâmetros Ambientais</span>
              </CardTitle>
              <CardDescription>
                Definir condições ideais de cultivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Configure parâmetros ideais de temperatura, umidade, CO2, luz e irrigação para cada fase de crescimento e tipo de planta.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <Thermometer className="h-3 w-3 mr-1" />
                  <span>Temperatura</span>
                </div>
                <div className="flex items-center">
                  <CloudRain className="h-3 w-3 mr-1" />
                  <span>Umidade</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" disabled>
                Configurar Parâmetros
              </Button>
            </CardFooter>
          </Card>

          {/* Configuração de Fases de Crescimento */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-500" />
                <span>Fases de Crescimento</span>
              </CardTitle>
              <CardDescription>
                Definir critérios para mudança de fase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Configure as fases do ciclo de vida das plantas, desde germinação até colheita, com critérios para mudança de fase e alertas automáticos.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" disabled>
                Configurar Fases
              </Button>
            </CardFooter>
          </Card>

          {/* Configuração de Protocolos */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-pink-500" />
                <span>Protocolos de Cultivo</span>
              </CardTitle>
              <CardDescription>
                Definir rotinas e procedimentos padrão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Crie protocolos personalizados para cada fase de cultivo, incluindo nutrição, poda, treinamento de plantas e tratamentos preventivos.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" disabled>
                Gerenciar Protocolos
              </Button>
            </CardFooter>
          </Card>

          {/* Configuração de Nutrientes */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                <span>Nutrientes e Substratos</span>
              </CardTitle>
              <CardDescription>
                Gerenciar insumos para o cultivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Cadastre substratos, nutrientes e outros insumos utilizados no cultivo, com informações de dosagem, compatibilidade e estoque.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" disabled>
                Gerenciar Insumos
              </Button>
            </CardFooter>
          </Card>

          {/* Configuração de Testes e Análises */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5 text-orange-500" />
                <span>Testes e Análises</span>
              </CardTitle>
              <CardDescription>
                Configurar parâmetros de qualidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Configure métodos de análise, parâmetros de qualidade e limites aceitáveis para cannabinoides, terpenos e contaminantes.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" disabled>
                Configurar Análises
              </Button>
            </CardFooter>
          </Card>

          {/* Configuração de Rótulos e Documentação */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <span>Rótulos e Documentação</span>
              </CardTitle>
              <CardDescription>
                Configurar templates e documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Personalize rótulos, relatórios e documentos relacionados ao cultivo, colheita e rastreabilidade dos lotes de plantas.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" disabled>
                Configurar Documentos
              </Button>
            </CardFooter>
          </Card>

          {/* Configurações Gerais */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-500" />
                <span>Configurações Gerais</span>
              </CardTitle>
              <CardDescription>
                Ajustar preferências do módulo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Configure preferências gerais do módulo de cultivo, incluindo permissões de usuários, regras de nomenclatura e integração com outros módulos.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" disabled>
                Configurações Gerais
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(ConfiguracaoPage, {
  moduleType: "cultivation",
  moduleName: "Cultivo",
  moduleDescription: "Gerencie todo o processo de cultivo de plantas medicinais, desde a semeadura até a colheita.",
  modulePrice: 99.00
});