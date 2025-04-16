# Correção do Componente withModuleAccess

## Problema Inicial
O componente `withModuleAccess.tsx` estava apresentando o erro "Missing queryFn" devido a problemas na configuração das consultas React Query. Isso estava impedindo o carregamento correto dos módulos premium.

## Alterações Realizadas

1. **Simplificação do Componente**
   - Removida dependência do `apiRequest` que causava erros de tipagem
   - Implementado uso direto do `fetch` nativo nas consultas
   - Corrigidas as URLs dos endpoints para usar as rotas corretas (/api/organizations/current e /api/modules/organization)

2. **Melhorias na Tratativa de Erros**
   - Simplificado o mecanismo de retry para casos de falha
   - Adicionadas mensagens de erro mais claras e informativas
   - Reduzida a complexidade do tratamento de estados de carregamento

3. **Correções de Tipagem**
   - Removida referência à `Error` que não existe no pacote `@tanstack/react-query`
   - Corrigida tipagem em várias partes do código para evitar erros TS

## Estado Atual
O componente agora tem uma estrutura mais limpa e direta que deve resolver o erro "Missing queryFn". O código foi simplificado para manter apenas as funcionalidades essenciais e minimizar possíveis pontos de falha.

## Testes Recomendados
Para validar completamente a correção, sugerimos:

1. Tentar acessar o módulo Cultivation (que é premium) para verificar se o controle de acesso está funcionando
2. Testar o componente com usuários que tenham diferentes níveis de acesso aos módulos
3. Verificar se os erros de console anteriores foram resolvidos

## Próximos Passos Possíveis
Se ainda houver problemas, considerar:

1. Revisar implementação completa do controle de acesso a módulos
2. Verificar a estrutura dos dados retornados pelas APIs
3. Implementar melhor rastreamento de erros para identificar potenciais problemas

## Notas Adicionais
A versão do React Query usada neste projeto é a v5, que exige uma sintaxe específica para as consultas, utilizando um objeto como parâmetro para as funções `useQuery` ao invés do formato de array usado em versões anteriores.