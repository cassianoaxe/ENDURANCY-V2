# Guia Prático para Proteção CSRF no Comply

Este guia fornece instruções práticas para desenvolvedores sobre como implementar e usar a proteção CSRF (Cross-Site Request Forgery) nos componentes frontend e rotas backend da plataforma Comply.

## O que é Proteção CSRF?

A proteção CSRF (Cross-Site Request Forgery) previne ataques onde sites maliciosos podem fazer solicitações não autorizadas em nome de um usuário autenticado. Isso é feito através da validação de tokens especiais (tokens CSRF) que são gerados pelo servidor e devem ser enviados com cada solicitação.

## Como usar a Proteção CSRF no Frontend

### 1. Usando a função `apiRequest`

A função `apiRequest` em `client/src/lib/queryClient.ts` foi atualizada para lidar automaticamente com tokens CSRF. Use-a para todas as chamadas de API no frontend:

```typescript
import { apiRequest } from '@/lib/queryClient';

// Exemplo de uso para requisições GET
const getData = async () => {
  const data = await apiRequest('/api/endpoint');
  // apiRequest automaticamente faz um GET e retorna os dados JSON
  return data;
};

// Exemplo de uso para POST com dados
const createItem = async (item) => {
  const result = await apiRequest('/api/items', {
    method: 'POST',
    data: item
  });
  return result;
};

// Exemplo de uso para PUT/PATCH
const updateItem = async (id, updates) => {
  const result = await apiRequest(`/api/items/${id}`, {
    method: 'PATCH', // ou 'PUT'
    data: updates
  });
  return result;
};

// Exemplo de uso para DELETE
const deleteItem = async (id) => {
  const result = await apiRequest(`/api/items/${id}`, {
    method: 'DELETE'
  });
  return result;
};
```

### 2. Usando com TanStack Query (React Query)

Para uso com React Query, integre o `apiRequest` em suas mutações:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Exemplo de uma mutation para criar um item
const useCreateItemMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (item) => apiRequest('/api/items', {
      method: 'POST',
      data: item
    }),
    onSuccess: () => {
      // Invalidar queries para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
    }
  });
};

// Uso no componente
const Component = () => {
  const createItemMutation = useCreateItemMutation();
  
  const handleSubmit = (formData) => {
    createItemMutation.mutate(formData);
  };
  
  // Resto do componente...
};
```

### 3. Convertendo chamadas `fetch` existentes

Se você tem chamadas `fetch` existentes, converta-as para usar `apiRequest`:

**Antes:**
```typescript
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => {
  // Processar dados
})
.catch(error => {
  // Tratar erro
});
```

**Depois:**
```typescript
apiRequest('/api/endpoint', {
  method: 'POST',
  data: data
})
.then(data => {
  // Processar dados (não precisa de response.json())
})
.catch(error => {
  // Tratar erro
});
```

## Como implementar Proteção CSRF no Backend

### 1. Aplicação Global CSRF (já implementada)

A proteção CSRF já está configurada globalmente no servidor. O middleware `csurf` gera tokens CSRF que são incluídos nos cookies das respostas e validados para todas as solicitações não-GET.

### 2. Verificação nas Rotas

Para rotas específicas que precisam de proteção CSRF adicional ou personalizada:

```javascript
// Exemplo de rota com proteção CSRF explícita
app.post('/api/sensitive-operation', csrfProtection, (req, res) => {
  // O middleware csrfProtection já verificou o token CSRF
  // Continuar com a operação
});
```

### 3. Exceções à Proteção CSRF

Em casos raros onde a proteção CSRF precisa ser desativada para rotas específicas (como webhooks externos ou APIs públicas):

```javascript
// Rota sem proteção CSRF (use com cuidado!)
app.post('/api/webhooks/external', (req, res) => {
  // Esta rota não verifica tokens CSRF
  // Implementar outras formas de validação (chaves API, assinaturas, etc.)
});
```

> **IMPORTANTE**: Apenas desabilite a proteção CSRF para endpoints que:
> 1. São completamente públicos (não requerem autenticação)
> 2. Usam outros mecanismos de segurança (como chaves de API)
> 3. São acessados exclusivamente por sistemas externos

## Testando a Proteção CSRF

### Teste no Frontend

1. Abra o console do navegador
2. Verifique se requisições POST/PUT/DELETE incluem o token CSRF nos cabeçalhos
3. Tente modificar o token e confirme que a requisição é rejeitada

### Teste no Backend

1. Use ferramentas como Postman para enviar requisições sem o token CSRF
2. Confirme que estas requisições são rejeitadas com erro 403 Forbidden

## Solução de Problemas

### Erros comuns com tokens CSRF

1. **"CSRF token missing"**: O token CSRF não foi enviado com a requisição
   - Solução: Use a função `apiRequest` para todas as chamadas de API

2. **"CSRF token invalid"**: O token enviado não corresponde ao esperado
   - Solução: Verifique se há múltiplas abas abertas ou se o token expirou

3. **"CSRF token expired"**: O token expirou (após 24 horas por padrão)
   - Solução: Recarregue a página para obter um novo token

## Práticas Recomendadas

1. **Sempre use `apiRequest`** para todas as chamadas de API no frontend
2. **Nunca desabilite a proteção CSRF** sem uma boa razão
3. **Verifique os logs de erro** para identificar problemas de CSRF
4. **Teste todas as rotas** para garantir que a proteção CSRF está funcionando
5. **Mantenha o frontend e o backend em sincronia** sobre a validação CSRF