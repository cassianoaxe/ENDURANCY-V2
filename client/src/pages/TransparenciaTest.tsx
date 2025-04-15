import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const TransparenciaTest = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Teste do Portal de Transparência</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portal de Transparência - Abrace</CardTitle>
            <CardDescription>ID da Organização: 1</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Links Diretos</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/organization/transparencia/1">
                      <Button variant="outline" className="w-full justify-start">
                        Portal Completo (Sobre)
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization/transparencia/1/documentos">
                      <Button variant="outline" className="w-full justify-start">
                        Aba Documentos
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization/transparencia/1/certificacoes">
                      <Button variant="outline" className="w-full justify-start">
                        Aba Certificações
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization/transparencia/1/membros">
                      <Button variant="outline" className="w-full justify-start">
                        Aba Membros
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization/transparencia/1/financeiro">
                      <Button variant="outline" className="w-full justify-start">
                        Aba Financeiro
                      </Button>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portal de Transparência - Hempmeds</CardTitle>
            <CardDescription>ID da Organização: 32</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Links Diretos</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/organization/transparencia/32">
                      <Button variant="outline" className="w-full justify-start">
                        Portal Completo (Sobre)
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization/transparencia/32/documentos">
                      <Button variant="outline" className="w-full justify-start">
                        Aba Documentos
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization/transparencia/32/certificacoes">
                      <Button variant="outline" className="w-full justify-start">
                        Aba Certificações
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization/transparencia/32/membros">
                      <Button variant="outline" className="w-full justify-start">
                        Aba Membros
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/organization/transparencia/32/financeiro">
                      <Button variant="outline" className="w-full justify-start">
                        Aba Financeiro
                      </Button>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransparenciaTest;