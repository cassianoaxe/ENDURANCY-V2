import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export default function PreCadastroSucesso() {
  // Rolagem para o topo quando o componente carrega
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img 
            src="/logo-endurancy.png" 
            alt="Endurancy" 
            className="h-16 mx-auto mb-6"
          />
          
          <div className="bg-green-100 text-green-800 py-3 px-4 rounded-lg inline-flex items-center mb-8">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Pré-cadastro realizado com sucesso!</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Agradecemos seu interesse no Sistema Endurancy
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Entraremos em contato quando o beta estiver disponível para acesso em 30 de julho.
            Fique atento(a) ao seu e-mail para as próximas etapas.
          </p>
        </div>
        
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-center">Próximos passos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Lançamento beta - 30 de julho de 2025</h3>
                  <p className="text-gray-600 mt-1">Você receberá um email com as instruções para acesso ao sistema.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Lançamento oficial - Novembro 2025</h3>
                  <p className="text-gray-600 mt-1">Apresentação oficial do Sistema Endurancy na Expocannabis.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center">
            <div className="flex-1 mb-6 lg:mb-0 lg:mr-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Conheça nossas outras soluções
              </h2>
              <p className="text-gray-600 mb-4">
                A ComplySolutions oferece um ecossistema completo de soluções para o mercado de pesquisa clínica e canabidiol.
              </p>
              <Button 
                onClick={() => window.open("https://complysolutions.com.br", "_blank")}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Visitar ComplySolutions.com.br
              </Button>
            </div>
            <div className="flex-shrink-0 flex justify-center">
              <img
                src="/complysoft-logo.png"
                alt="ComplySoft"
                className="h-12"
                onError={(e) => {
                  // Fallback para texto caso a imagem não carregue
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const textNode = document.createElement('div');
                    textNode.className = 'text-2xl font-bold';
                    textNode.textContent = 'ComplySoft';
                    parent.appendChild(textNode);
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="mr-4"
          >
            Voltar para a página inicial
          </Button>
          <Button 
            onClick={() => window.location.href = "/roadmap"}
          >
            Ver Roadmap do Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}