'use client';

// Este componente foi removido pois o recurso de tour guiado ficou tecnologicamente defasado.
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface PatrimonioTourProps {
  isOpen: boolean;
  onClose: () => void;
  startStep?: 'dashboard' | 'ativos' | 'instalacoes' | 'manutencoes' | 'depreciacao';
}

// Interface para os passos do tour
interface TourStep {
  selector: string;
  title: string;
  description: string;
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  spotlightPadding?: number;
  condition?: () => boolean;
  action?: () => Promise<void>;
}

export default function PatrimonioTour(_props: PatrimonioTourProps) {
  // Este componente foi removido pois o recurso de tour guiado ficou tecnologicamente defasado.
  return null;
}