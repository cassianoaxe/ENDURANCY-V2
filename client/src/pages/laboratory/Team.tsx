import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UsersIcon, UserPlus, Search, Filter, MailIcon, PhoneIcon, MessageSquareIcon } from "lucide-react";

// Dados fictícios para demonstração
const teamMembers = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Diretora de Laboratório",
    department: "Administração",
    email: "ana.silva@exemplo.com",
    phone: "+55 (11) 98765-4321",
    avatar: "",
    status: "online"
  },
  {
    id: 2,
    name: "Carlos Mendes",
    role: "Analista Químico Sênior",
    department: "Análise",
    email: "carlos.mendes@exemplo.com",
    phone: "+55 (11) 98765-4322",
    avatar: "",
    status: "offline"
  },
  {
    id: 3,
    name: "Juliana Costa",
    role: "Técnica de Laboratório",
    department: "Análise",
    email: "juliana.costa@exemplo.com",
    phone: "+55 (11) 98765-4323",
    avatar: "",
    status: "online"
  },
  {
    id: 4,
    name: "Pedro Almeida",
    role: "Analista de Qualidade",
    department: "Qualidade",
    email: "pedro.almeida@exemplo.com",
    phone: "+55 (11) 98765-4324",
    avatar: "",
    status: "away"
  },
  {
    id: 5,
    name: "Mariana Santos",
    role: "Recepcionista de Amostras",
    department: "Recepção",
    email: "mariana.santos@exemplo.com",
    phone: "+55 (11) 98765-4325",
    avatar: "",
    status: "offline"
  },
  {
    id: 6,
    name: "Fernando Oliveira",
    role: "Especialista em HPLC",
    department: "Análise",
    email: "fernando.oliveira@exemplo.com",
    phone: "+55 (11) 98765-4326",
    avatar: "",
    status: "online"
  }
];

export default function LaboratoryTeam() {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  
  // Filtragem simples baseada no termo de busca e departamento selecionado
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = currentTab === "all" || member.department.toLowerCase() === currentTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Equipe do Laboratório</h2>
        
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro da Equipe</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo membro da equipe do laboratório.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input id="name" className="col-span-3" placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Cargo</Label>
                <Input id="role" className="col-span-3" placeholder="Cargo ou função" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Departamento</Label>
                <Input id="department" className="col-span-3" placeholder="Departamento" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" className="col-span-3" placeholder="Email profissional" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Telefone</Label>
                <Input id="phone" className="col-span-3" placeholder="Número de telefone" />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou cargo..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="Administração">Administração</TabsTrigger>
          <TabsTrigger value="Análise">Análise</TabsTrigger>
          <TabsTrigger value="Qualidade">Qualidade</TabsTrigger>
          <TabsTrigger value="Recepção">Recepção</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(member.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">{member.department}</Badge>
                    </div>
                    <div className="flex items-center text-sm">
                      <MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Mensagem
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-10">
              <UsersIcon className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Nenhum membro encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tente ajustar os filtros ou termos de busca.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* As outras abas mostrarão o mesmo conteúdo, pois já estamos filtrando baseado na aba selecionada */}
        <TabsContent value="Administração" className="mt-6">
          {/* O conteúdo já é filtrado pela lógica acima */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                {/* Mesmos componentes de cartão */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(member.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">{member.department}</Badge>
                    </div>
                    <div className="flex items-center text-sm">
                      <MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Mensagem
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="Análise" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                {/* Mesmos componentes repetidos */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(member.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">{member.department}</Badge>
                    </div>
                    <div className="flex items-center text-sm">
                      <MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Mensagem
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="Qualidade" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                {/* Mesmos componentes repetidos */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(member.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">{member.department}</Badge>
                    </div>
                    <div className="flex items-center text-sm">
                      <MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Mensagem
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="Recepção" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                {/* Mesmos componentes repetidos */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12 border-2 border-white">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(member.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">{member.department}</Badge>
                    </div>
                    <div className="flex items-center text-sm">
                      <MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Mensagem
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}