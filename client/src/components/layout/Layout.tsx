"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

// Importar o componente de transição de página
import PageTransitionWrapper from "../common/PageTransitionWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />
      <Header />
      <main className="ml-[240px] pt-16 flex-grow">
        {/* Aplicar o wrapper de transição para melhorar navegação entre páginas */}
        <PageTransitionWrapper>
          {children}
        </PageTransitionWrapper>
      </main>
      <div className="ml-[240px]">
        <Footer />
      </div>
    </div>
  );
}