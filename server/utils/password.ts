/**
 * Utilitários para geração e gerenciamento de senhas
 */

/**
 * Gera uma senha aleatória segura
 * @param length Comprimento da senha, padrão é 12 caracteres
 * @returns Uma senha aleatória
 */
export function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sem I e O para evitar confusão
  const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // sem l e o para evitar confusão
  const numbers = '23456789'; // sem 0 e 1 para evitar confusão
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // Garantir pelo menos um caractere de cada tipo
  let password = '';
  password += getRandomChar(uppercase);
  password += getRandomChar(lowercase);
  password += getRandomChar(numbers);
  password += getRandomChar(symbols);
  
  // Completar o restante da senha
  for (let i = 4; i < length; i++) {
    password += getRandomChar(allChars);
  }
  
  // Embaralhar a senha para evitar padrão previsível
  return shuffleString(password);
}

/**
 * Retorna um caractere aleatório de uma string
 * @param characters String contendo os caracteres possíveis
 * @returns Um caractere aleatório
 */
function getRandomChar(characters: string): string {
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
}

/**
 * Embaralha os caracteres de uma string
 * @param str String a ser embaralhada
 * @returns String com caracteres embaralhados
 */
function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Troca de elementos
  }
  return array.join('');
}

/**
 * Verifica a complexidade de uma senha
 * @param password Senha a ser verificada
 * @returns Um objeto contendo a análise da senha
 */
export function checkPasswordStrength(password: string): {
  score: number; // 0-4, onde 4 é a mais forte
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  isLongEnough: boolean;
  suggestions: string[];
} {
  const analysis = {
    score: 0,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[^A-Za-z0-9]/.test(password),
    isLongEnough: password.length >= 8,
    suggestions: [] as string[]
  };
  
  // Calcular pontuação
  let score = 0;
  
  if (analysis.hasUpperCase) score++;
  if (analysis.hasLowerCase) score++;
  if (analysis.hasNumbers) score++;
  if (analysis.hasSymbols) score++;
  
  // Ajustar pontuação com base no tamanho
  if (password.length < 6) {
    score = 0; // Muito curta, sempre fraca
  } else if (password.length >= 12) {
    score++; // Bônus para senhas longas
  }
  
  // Limitar a pontuação entre 0 e 4
  analysis.score = Math.min(4, score);
  
  // Gerar sugestões
  if (!analysis.isLongEnough) {
    analysis.suggestions.push('Use pelo menos 8 caracteres');
  }
  if (!analysis.hasUpperCase) {
    analysis.suggestions.push('Inclua pelo menos uma letra maiúscula');
  }
  if (!analysis.hasLowerCase) {
    analysis.suggestions.push('Inclua pelo menos uma letra minúscula');
  }
  if (!analysis.hasNumbers) {
    analysis.suggestions.push('Inclua pelo menos um número');
  }
  if (!analysis.hasSymbols) {
    analysis.suggestions.push('Inclua pelo menos um símbolo (ex: !@#$%)');
  }
  
  return analysis;
}