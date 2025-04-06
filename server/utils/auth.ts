/**
 * Utilitários para autenticação e gerenciamento de credenciais
 */
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Gera um hash para a senha fornecida usando bcrypt
 * @param password Senha em texto puro
 * @returns Hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

/**
 * Verifica se uma senha em texto puro corresponde ao hash armazenado
 * @param password Senha em texto puro para verificar
 * @param hashedPassword Hash da senha armazenado
 * @returns true se a senha corresponde ao hash, false caso contrário
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Gera um token seguro para reset de senha ou autenticação temporária
 * @param length Comprimento do token, padrão é 32 caracteres
 * @returns Token seguro
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Gera um token único vinculado a um identificador (e.g., email, id de usuário)
 * @param identifier Identificador para vincular ao token
 * @param secret Segredo para aumentar a segurança (pode ser uma chave de API ou uma string fixa)
 * @param expiresInHours Tempo de expiração em horas
 * @returns Token assinado
 */
export function generateSignedToken(identifier: string, secret: string, expiresInHours: number = 24): string {
  // Timestamp de expiração
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  
  // Dados a serem assinados
  const data = `${identifier}:${expiresAt}`;
  
  // Criando assinatura HMAC
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(data).digest('hex');
  
  // Combinando dados e assinatura
  const token = Buffer.from(`${data}:${signature}`).toString('base64');
  
  return token;
}

/**
 * Verifica um token assinado
 * @param token Token a ser verificado
 * @param secret Segredo usado para gerar o token
 * @returns Se o token é válido, retorna o identificador; caso contrário, retorna null
 */
export function verifySignedToken(token: string, secret: string): string | null {
  try {
    // Decodificando o token
    const decoded = Buffer.from(token, 'base64').toString();
    const [identifier, expiresAtStr, signature] = decoded.split(':');
    
    // Verificando se o formato é válido
    if (!identifier || !expiresAtStr || !signature) {
      return null;
    }
    
    // Verificando expiração
    const expiresAt = parseInt(expiresAtStr);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return null; // Token expirado ou formato inválido
    }
    
    // Recriando assinatura para verificação
    const data = `${identifier}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(data).digest('hex');
    
    // Comparando assinaturas
    if (signature !== expectedSignature) {
      return null; // Assinatura inválida
    }
    
    return identifier;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

/**
 * Gera um código de verificação numérico (para OTP, etc.)
 * @param length Comprimento do código, padrão é 6 dígitos
 * @returns Código numérico como string
 */
export function generateVerificationCode(length: number = 6): string {
  // Gera um número aleatório com o comprimento solicitado
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}