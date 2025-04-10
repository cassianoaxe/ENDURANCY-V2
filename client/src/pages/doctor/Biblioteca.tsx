import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  BookOpen, 
  FileText, 
  Download, 
  Star, 
  Video, 
  Newspaper, 
  BookCopy,
  ChevronRight,
  Filter,
  Bookmark,
  BookmarkCheck,
  Clock
} from 'lucide-react';

// Dados de artigos científicos
const artigos = [
  {
    id: 1,
    title: "Aplicações terapêuticas da Cannabis medicinal em condições neurológicas",
    author: "Silva, M.A.; Oliveira, J.P.",
    journal: "Revista Brasileira de Neurologia",
    year: 2024,
    abstract: "Este artigo revisa as evidências clínicas atuais sobre o uso da Cannabis medicinal em condições neurológicas como epilepsia, esclerose múltipla e doença de Parkinson.",
    tags: ["neurologia", "cannabis medicinal", "epilepsia"],
    saved: true
  },
  {
    id: 2,
    title: "Canabidiol no tratamento da dor crônica: revisão sistemática",
    author: "Andrade, P.S.; Martins, L.F.",
    journal: "Journal of Pain Research",
    year: 2023,
    abstract: "Esta revisão sistemática analisa os estudos clínicos sobre a eficácia do canabidiol (CBD) no tratamento da dor crônica de diferentes etiologias.",
    tags: ["dor crônica", "canabidiol", "CBD"],
    saved: false
  },
  {
    id: 3,
    title: "Interações medicamentosas entre canabinoides e medicamentos convencionais",
    author: "Ferreira, C.R.; Gomes, A.B.",
    journal: "Clinical Pharmacology & Therapeutics",
    year: 2023,
    abstract: "Este estudo investiga as potenciais interações medicamentosas entre canabinoides e medicamentos convencionais, com foco nas vias metabólicas e implicações clínicas.",
    tags: ["interações medicamentosas", "canabinoides", "farmacologia"],
    saved: true
  },
  {
    id: 4,
    title: "Cannabis medicinal na oncologia: alívio de sintomas e potencial antitumoral",
    author: "Santos, L.M.; Costa, R.S.",
    journal: "European Journal of Cancer",
    year: 2024,
    abstract: "Este artigo discute o papel da Cannabis medicinal no manejo de sintomas em pacientes oncológicos e as evidências emergentes sobre potenciais efeitos antitumorais de canabinoides.",
    tags: ["oncologia", "cannabis medicinal", "dor oncológica"],
    saved: false
  },
];

// Dados de guias clínicos
const guias = [
  {
    id: 1,
    title: "Guia Prático para Prescrição de Cannabis Medicinal",
    author: "Conselho Brasileiro de Cannabis Medicinal",
    year: 2024,
    type: "Guia clínico",
    pages: 64,
    abstract: "Guia completo com orientações práticas para prescrição de Cannabis medicinal, incluindo dosagens, formulações e acompanhamento clínico.",
    tags: ["prescrição", "guia clínico", "dosagem"],
    saved: true
  },
  {
    id: 2,
    title: "Protocolo de Dosagem de Canabidiol em Epilepsias Refratárias",
    author: "Academia Brasileira de Neurologia",
    year: 2023,
    type: "Protocolo",
    pages: 32,
    abstract: "Protocolo detalhado para dosagem e acompanhamento do tratamento com canabidiol em pacientes com epilepsias refratárias.",
    tags: ["epilepsia", "canabidiol", "dosagem"],
    saved: false
  },
];

// Dados de vídeos
const videos = [
  {
    id: 1,
    title: "Sistema Endocanabinoide: Bases Fisiológicas",
    author: "Dr. Ricardo Ferreira",
    duration: "45 min",
    year: 2024,
    abstract: "Aula completa sobre o sistema endocanabinoide, receptores e funções fisiológicas.",
    tags: ["sistema endocanabinoide", "fisiologia", "aula"],
    saved: false
  },
  {
    id: 2,
    title: "Casos Clínicos: Cannabis em Dor Crônica",
    author: "Dra. Maria Oliveira",
    duration: "52 min",
    year: 2023,
    abstract: "Discussão de casos clínicos reais sobre o uso de Cannabis medicinal no tratamento da dor crônica.",
    tags: ["dor crônica", "casos clínicos", "tratamento"],
    saved: true
  },
];

export default function Biblioteca() {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  
  // Filtrar artigos com base na pesquisa e na opção "salvos"
  const filteredArtigos = artigos.filter(artigo => {
    const matchesSearch = searchQuery === '' || 
      artigo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artigo.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artigo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && (!savedOnly || artigo.saved);
  });
  
  // Filtrar guias com base na pesquisa e na opção "salvos"
  const filteredGuias = guias.filter(guia => {
    const matchesSearch = searchQuery === '' || 
      guia.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guia.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guia.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && (!savedOnly || guia.saved);
  });
  
  // Filtrar vídeos com base na pesquisa e na opção "salvos"
  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && (!savedOnly || video.saved);
  });
  
  // Função para alternar um item como salvo/não salvo
  const toggleSaved = (type: string, id: number) => {
    if (type === 'artigo') {
      const updatedArtigos = artigos.map(artigo => 
        artigo.id === id ? { ...artigo, saved: !artigo.saved } : artigo
      );
      // Normalmente aqui atualizaríamos o estado global ou faríamos uma chamada API
      // Para este exemplo, apenas atualizamos os dados locais
    } else if (type === 'guia') {
      const updatedGuias = guias.map(guia => 
        guia.id === id ? { ...guia, saved: !guia.saved } : guia
      );
    } else if (type === 'video') {
      const updatedVideos = videos.map(video => 
        video.id === id ? { ...video, saved: !video.saved } : video
      );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        <div className="flex gap-2">
          <Button 
            variant={savedOnly ? "default" : "outline"} 
            size="sm"
            onClick={() => setSavedOnly(!savedOnly)}
            className="gap-2"
          >
            {savedOnly ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {savedOnly ? "Mostrando Salvos" : "Todos os Itens"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input 
          type="search" 
          placeholder="Pesquisar por título, conteúdo ou tags..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="artigos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="artigos" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Artigos Científicos
          </TabsTrigger>
          <TabsTrigger value="guias" className="gap-2">
            <BookCopy className="h-4 w-4" />
            Guias e Protocolos
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            Vídeos e Webinars
          </TabsTrigger>
          <TabsTrigger value="salvos" className="gap-2">
            <BookmarkCheck className="h-4 w-4" />
            Itens Salvos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="artigos">
          <div className="space-y-4">
            {filteredArtigos.length > 0 ? (
              filteredArtigos.map((artigo) => (
                <Card key={artigo.id} className="hover:bg-gray-50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{artigo.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{artigo.author}</span>
                          <span>•</span>
                          <span>{artigo.journal}, {artigo.year}</span>
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleSaved('artigo', artigo.id)}
                      >
                        {artigo.saved ? (
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{artigo.abstract}</p>
                    <div className="flex gap-2 mt-3">
                      {artigo.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>Relevância alta</span>
                    </div>
                    <Button size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>Nenhum artigo encontrado com estes critérios de busca.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="guias">
          <div className="space-y-4">
            {filteredGuias.length > 0 ? (
              filteredGuias.map((guia) => (
                <Card key={guia.id} className="hover:bg-gray-50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{guia.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{guia.author}</span>
                          <span>•</span>
                          <span>{guia.year}</span>
                          <span>•</span>
                          <span>{guia.pages} páginas</span>
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleSaved('guia', guia.id)}
                      >
                        {guia.saved ? (
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{guia.abstract}</p>
                    <div className="flex gap-2 mt-3">
                      {guia.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 text-blue-500 mr-1" />
                      <span>{guia.type}</span>
                    </div>
                    <Button size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>Nenhum guia ou protocolo encontrado com estes critérios de busca.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="videos">
          <div className="space-y-4">
            {filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <Card key={video.id} className="hover:bg-gray-50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{video.author}</span>
                          <span>•</span>
                          <span>{video.year}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{video.duration}</span>
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleSaved('video', video.id)}
                      >
                        {video.saved ? (
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{video.abstract}</p>
                    <div className="flex gap-2 mt-3">
                      {video.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Video className="h-4 w-4 text-red-500 mr-1" />
                      <span>Vídeo educativo</span>
                    </div>
                    <Button size="sm" className="gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Assistir
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Video className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>Nenhum vídeo encontrado com estes critérios de busca.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="salvos">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                Artigos Salvos
              </h2>
              <div className="space-y-3">
                {artigos.filter(a => a.saved).length > 0 ? (
                  artigos.filter(a => a.saved).map((artigo) => (
                    <div key={artigo.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h3 className="font-medium">{artigo.title}</h3>
                        <p className="text-sm text-gray-500">{artigo.author} • {artigo.journal}, {artigo.year}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleSaved('artigo', artigo.id)}>
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum artigo salvo.</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookCopy className="h-5 w-5 text-primary" />
                Guias e Protocolos Salvos
              </h2>
              <div className="space-y-3">
                {guias.filter(g => g.saved).length > 0 ? (
                  guias.filter(g => g.saved).map((guia) => (
                    <div key={guia.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h3 className="font-medium">{guia.title}</h3>
                        <p className="text-sm text-gray-500">{guia.author} • {guia.year}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleSaved('guia', guia.id)}>
                          <BookmarkedIcon className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum guia salvo.</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Vídeos Salvos
              </h2>
              <div className="space-y-3">
                {videos.filter(v => v.saved).length > 0 ? (
                  videos.filter(v => v.saved).map((video) => (
                    <div key={video.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h3 className="font-medium">{video.title}</h3>
                        <p className="text-sm text-gray-500">{video.author} • {video.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleSaved('video', video.id)}>
                          <BookmarkedIcon className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum vídeo salvo.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}