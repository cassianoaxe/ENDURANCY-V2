"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />
      <Header />
      <main className="ml-[240px] pt-16 flex-grow">
        {children}
      </main>
      <div className="ml-[240px]">
        <Footer />
      </div>
    </div>
  );
}