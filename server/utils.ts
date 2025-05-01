import { ZodError } from "zod";

/**
 * Converte os erros do Zod para mensagens legíveis
 * @param error Objeto de erro do Zod
 * @returns Um objeto com as mensagens de erro em formato legível
 */
export function zodErrorToReadableMessages(error: ZodError) {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join(".");
    const key = path || "geral";
    
    acc[key] = acc[key] || [];
    acc[key].push(err.message);
    
    return acc;
  }, {} as Record<string, string[]>);
}

/**
 * Verifica se uma string é um JSON válido
 * @param str String para verificar
 * @returns boolean indicando se é um JSON válido
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Formata um valor monetário para exibição
 * @param value Valor a ser formatado
 * @param currency Símbolo da moeda (padrão: R$)
 * @returns String formatada como valor monetário
 */
export function formatCurrency(value: number, currency: string = "R$"): string {
  return `${currency} ${value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/**
 * Formata data para o formato brasileiro
 * @param date Data para formatar
 * @returns Data formatada como dd/mm/yyyy
 */
export function formatDateBR(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Gera um slug a partir de uma string
 * @param str String para converter em slug
 * @returns String formatada como slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Trunca um texto para um tamanho máximo
 * @param text Texto para truncar
 * @param maxLength Tamanho máximo
 * @returns Texto truncado com "..." ao final se necessário
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Gera um código aleatório com letras e números
 * @param length Tamanho do código
 * @returns String com código aleatório
 */
export function generateRandomCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Verifica se um CPF é válido
 * @param cpf String com o CPF a ser validado
 * @returns boolean indicando se o CPF é válido
 */
export function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

/**
 * Verifica se um CNPJ é válido
 * @param cnpj String com o CNPJ a ser validado
 * @returns boolean indicando se o CNPJ é válido
 */
export function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

/**
 * Middleware para verificar se o usuário está autenticado
 * @param req Requisição Express
 * @param res Resposta Express
 * @param next Função para passar para o próximo middleware
 */
import { Request, Response, NextFunction } from 'express';

// Extensão do objeto Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
        organizationId?: number | null;
        name: string;
        email: string;
        [key: string]: any;
      };
    }
  }
}

export function authenticatedOnly(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    // Adicionar o usuário ao objeto req para facilitar acesso
    req.user = req.session.user;
    next();
  } else {
    res.status(401).json({ message: 'Não autenticado' });
  }
}

/**
 * Middleware para verificar se o usuário tem um papel específico
 * @param roles Array de papéis permitidos
 */
export function roleGuard(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: 'Acesso não autorizado para este papel de usuário' });
    }

    req.user = req.session.user;
    next();
  };
}