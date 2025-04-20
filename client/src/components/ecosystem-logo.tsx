"use client";
import React from "react";
import { Leaf, Sprout, FlaskConical, Activity, Microscope, PenTool, Users, FileCheck } from "lucide-react";

export function EcosystemLogo() {
  return (
    <div className="relative w-full h-[400px] mx-auto flex items-center justify-center">
      {/* Círculo externo */}
      <div className="absolute rounded-full h-[320px] w-[320px] border-4 border-primary/20 flex items-center justify-center bg-gradient-to-br from-primary/5 to-green-50">
        {/* Círculo central com logo */}
        <div className="absolute flex flex-col items-center justify-center bg-white rounded-full h-32 w-32 shadow-lg z-10 border-4 border-primary/10">
          <div className="bg-primary/5 p-4 rounded-full flex items-center justify-center">
            <Leaf className="h-10 w-10 text-green-600" />
          </div>
          <div className="text-center font-bold text-md mt-1 text-primary">Endurancy</div>
        </div>
        
        {/* Ícones ao redor */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-md">
          <Sprout className="h-6 w-6 text-green-600" />
        </div>
        
        <div className="absolute top-1/4 right-4 bg-white p-3 rounded-full shadow-md">
          <Microscope className="h-6 w-6 text-indigo-600" />
        </div>
        
        <div className="absolute top-1/2 right-4 transform translate-y-[-50%] bg-white p-3 rounded-full shadow-md">
          <FlaskConical className="h-6 w-6 text-purple-600" />
        </div>
        
        <div className="absolute bottom-1/4 right-4 bg-white p-3 rounded-full shadow-md">
          <Activity className="h-6 w-6 text-red-600" />
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full shadow-md">
          <PenTool className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="absolute bottom-1/4 left-4 bg-white p-3 rounded-full shadow-md">
          <FileCheck className="h-6 w-6 text-amber-600" />
        </div>
        
        <div className="absolute top-1/2 left-4 transform translate-y-[-50%] bg-white p-3 rounded-full shadow-md">
          <Users className="h-6 w-6 text-cyan-600" />
        </div>
        
        <div className="absolute top-1/4 left-4 bg-white p-3 rounded-full shadow-md">
          <Leaf className="h-6 w-6 text-emerald-600" />
        </div>
      </div>
      
      {/* Linhas conectoras radiais */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 200 40 L 200 134" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 280 80 L 220 134" stroke="rgba(79, 70, 229, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 320 200 L 226 200" stroke="rgba(147, 51, 234, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 280 320 L 220 266" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 200 360 L 200 266" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 120 320 L 180 266" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 80 200 L 174 200" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 120 80 L 180 134" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
      </svg>
      
      {/* Texto descritivo */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">Ecossistema integrado para cannabis medicinal</p>
      </div>
    </div>
  );
}