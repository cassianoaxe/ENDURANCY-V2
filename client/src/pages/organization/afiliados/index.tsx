import React, { useState } from 'react';
import { bypassModuleAccess } from '@/components/modules/withModuleAccess';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Link, 
  Users, 
  Share2, 
  Wallet, 
  ArrowUp, 
  ArrowDown, 
  Copy,
  BarChart3,
  Settings,
  User,
  Award,
  Trophy,
  FileDown,
  ImageIcon,
  Mail,
  Facebook,
  Instagram,
  Smartphone
} from 'lucide-react';

const ProgramaAfiliados = () => {
  const [linkAfiliado, setLinkAfiliado] = useState('https://app.complypay.com.br/r/abc123def456');
  const [copiado, setCopiado] = useState(false);

  const copiarLink = () => {
    navigator.clipboard.writeText(linkAfiliado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Programa de Afiliados</h1>
            <p className="text-gray-600 mt-1">Indique novos associados e ganhe pontos para trocar por produtos e serviços</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Seu Nível de Afiliado</CardTitle>
            <CardDescription>Continue indicando para alcançar o próximo nível e obter mais benefícios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 rounded-full">
                <Award className="h-12 w-12 text-primary" />
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs font-medium rounded-full h-8 w-8 flex items-center justify-center">
                  2
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">Nível Prata</h3>
                    <p className="text-sm text-muted-foreground">1.500 / 3.000 pontos para o próximo nível</p>
                  </div>
                  <Badge className="mt-1 md:mt-0" variant="outline">
                    <span className="text-primary font-medium mr-1">+15%</span> de bonificação neste nível
                  </Badge>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Nível 1: Bronze</span>
                  <span>Nível 2: Prata</span>
                  <span>Nível 3: Ouro</span>
                  <span>Nível 4: Diamante</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-primary mr-2" />
                <div>
                  <p className="text-2xl font-bold">2.450</p>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+230 no último mês</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Indicações Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+3 no último mês</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">68%</p>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>+5% vs mês anterior</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comissão Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-green-500 mr-2" />
                <div>
                  <p className="text-2xl font-bold">R$ 125,00</p>
                  <Badge className="text-xs mt-1 bg-green-100 text-green-800">Disponível para resgate</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Atividade do Programa</CardTitle>
              <CardDescription>Acompanhe o desempenho do seu programa de afiliados</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="indicacoes">
                <TabsList className="mb-4">
                  <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
                  <TabsTrigger value="pontos">Pontos</TabsTrigger>
                  <TabsTrigger value="retiradas">Retiradas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="indicacoes">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Maria Silva</h3>
                            <p className="text-sm text-gray-500">Registrado em 02/05/2025</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500">Plano</p>
                          <p className="font-medium">Padrão</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pontos gerados</p>
                          <p className="font-medium">120</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <Badge className="bg-green-100 text-green-800">Pago</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">João Pereira</h3>
                            <p className="text-sm text-gray-500">Registrado em 28/04/2025</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500">Plano</p>
                          <p className="font-medium">Premium</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pontos gerados</p>
                          <p className="font-medium">250</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <Badge className="bg-green-100 text-green-800">Pago</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Ana Souza</h3>
                            <p className="text-sm text-gray-500">Registrado em 15/04/2025</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500">Plano</p>
                          <p className="font-medium">Básico</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pontos gerados</p>
                          <p className="font-medium">80</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <Badge className="bg-amber-100 text-amber-800">Aguardando</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pontos">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <ArrowUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Pontos por indicação</h3>
                            <p className="text-sm text-gray-500">Maria Silva - 02/05/2025</p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-600">+120 pontos</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <ArrowUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Pontos por indicação</h3>
                            <p className="text-sm text-gray-500">João Pereira - 28/04/2025</p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-600">+250 pontos</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <ArrowUp className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Pontos pendentes</h3>
                            <p className="text-sm text-gray-500">Ana Souza - 15/04/2025</p>
                          </div>
                        </div>
                        <p className="font-semibold text-amber-600">+80 pontos (pendente)</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <ArrowDown className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Resgate de pontos</h3>
                            <p className="text-sm text-gray-500">15/04/2025</p>
                          </div>
                        </div>
                        <p className="font-semibold text-red-600">-500 pontos</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="retiradas">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Resgate via PIX</h3>
                            <p className="text-sm text-gray-500">15/04/2025</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500">Pontos</p>
                          <p className="font-medium">500</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Valor</p>
                          <p className="font-medium">R$ 50,00</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Data de pagamento</p>
                          <p className="font-medium">15/04/2025</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Resgate via PIX</h3>
                            <p className="text-sm text-gray-500">10/03/2025</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-500">Pontos</p>
                          <p className="font-medium">700</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Valor</p>
                          <p className="font-medium">R$ 70,00</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Data de pagamento</p>
                          <p className="font-medium">10/03/2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Ver todas as atividades</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seu Link de Afiliado</CardTitle>
              <CardDescription>
                Compartilhe este link com novos possíveis associados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-afiliado">Link de Afiliado</Label>
                <div className="flex">
                  <Input 
                    id="link-afiliado"
                    readOnly
                    value={linkAfiliado}
                    className="rounded-r-none"
                  />
                  <Button 
                    onClick={copiarLink}
                    className="rounded-l-none"
                    variant={copiado ? "outline" : "default"}
                  >
                    {copiado ? (
                      <>
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        <span>Copiar</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <h3 className="font-medium">Compartilhar em:</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span>Twitter</span>
                  </Button>
                </div>
                <Button variant="outline" className="w-full">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </Button>
                <Button variant="outline" className="w-full">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                </Button>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-medium mb-2">Materiais Promocionais</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border rounded-md p-2">
                    <div className="flex items-center">
                      <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span>Banner para redes sociais</span>
                    </div>
                    <Button variant="ghost" size="sm">Baixar</Button>
                  </div>
                  <div className="flex items-center justify-between border rounded-md p-2">
                    <div className="flex items-center">
                      <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span>Folheto informativo (PDF)</span>
                    </div>
                    <Button variant="ghost" size="sm">Baixar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Regras do Programa</CardTitle>
            <CardDescription>
              Entenda como funciona o programa de afiliados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium">Convide Associados</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Compartilhe seu link de afiliado com potenciais associados. Eles precisam se registrar através do seu link para que a indicação seja contabilizada.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium">Ganhe Pontos</h3>
                </div>
                <p className="text-sm text-gray-600">
                  A cada associado que se registrar e confirmar o cadastro através do seu link, você recebe pontos de acordo com o plano escolhido por eles.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium">Resgate Benefícios</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Use seus pontos para obter descontos em produtos, serviços ou solicite a transferência do valor equivalente para sua conta bancária via PIX.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <p className="text-sm text-gray-500">Valor de conversão: 10 pontos = R$ 1,00</p>
            <Button variant="outline">Ver termos completos</Button>
          </CardFooter>
        </Card>
      </div>
    </OrganizationLayout>
  );
};

export default bypassModuleAccess(ProgramaAfiliados, {
  moduleType: "afiliados",
  moduleName: "Programa de Afiliados",
  moduleDescription: "Indique novos associados e ganhe pontos para trocar por produtos e serviços.",
  modulePrice: 49.00
});