# Cliente MCP da OpenAI

Este projeto implementa um cliente de MCP (Multi-Context Processing) em Node.js que se conecta a servidores MCP locais e remotos, gerenciando a comunicação com fontes de dados diversas e utilizando a API da OpenAI para processamento de inteligência artificial.

## O que é MCP (Multi-Context Processing)?

O Multi-Context Processing é uma abordagem de processamento de informações que permite:

1. Integrar dados de múltiplas fontes (locais e remotas)
2. Manter contexto entre diferentes interações
3. Processar informações de forma holística com modelos de IA
4. Conectar diferentes sistemas em uma infraestrutura unificada

## Estrutura do Projeto

```
/
├── index.js         # Ponto de entrada que demonstra vários cenários de uso
├── mcpClient.js     # Implementação do cliente MCP com conexão a servidores
├── .env             # Variáveis de ambiente e configurações
├── package.json     # Dependências do projeto
└── README.md        # Esta documentação
```

## Requisitos

- Node.js v14 ou superior
- Uma chave de API válida da OpenAI
- Servidores MCP locais ou remotos para conexão (simulados para demonstração)

## Instalação

1. Clone este repositório:
   ```
   git clone https://github.com/seu-usuario/openai-mcp-client.git
   cd openai-mcp-client
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente copiando o arquivo `.env.example` para `.env` e adicionando sua chave de API da OpenAI:
   ```
   cp .env.example .env
   # Edite o arquivo .env e adicione sua chave API
   ```

## Configuração

Edite o arquivo `.env` para configurar:

- **OPENAI_API_KEY**: Sua chave de API da OpenAI
- **MCP_LOCAL_SERVER_A / MCP_LOCAL_SERVER_B**: URLs dos servidores MCP locais
- **MCP_REMOTE_API**: URL do servidor MCP remoto
- **LOCAL_DATA_SOURCE_A / LOCAL_DATA_SOURCE_B**: URLs das fontes de dados locais
- **REMOTE_API_ENDPOINT**: URL da API remota
- **REMOTE_API_KEY**: Chave de API para o serviço remoto

## Executando o projeto

Execute o projeto com:

```
node index.js
```

Isso iniciará uma série de demonstrações que mostram diferentes cenários de comunicação:

1. Host local → Servidor MCP → Fonte de dados local A
2. Host local → Servidor MCP → Fonte de dados local B
3. Host local → Servidor MCP → Múltiplas fontes locais (A + B)
4. Host local → Servidor MCP → Serviço remoto (API Web)
5. Host local → Servidor MCP → Integração completa (todos os dados)

## Personalizando as fontes de dados

Para conectar a suas próprias fontes de dados:

### Fontes de dados locais

Modifique a função `fetchLocalData()` no arquivo `mcpClient.js`:

```javascript
async fetchLocalData(sourceKey) {
  // Substitua a implementação simulada pela sua lógica real
  // Exemplos:
  // - Consulta a um banco de dados
  // - Leitura de arquivos do sistema
  // - Conexão com outros serviços locais
}
```

### Serviços remotos

Modifique a função `fetchRemoteData()` no arquivo `mcpClient.js`:

```javascript
async fetchRemoteData(params = {}) {
  // Substitua a implementação simulada pela sua API real
  // Exemplo: integração com APIs de terceiros
}
```

## Dicas para implementação em produção

1. Adicione tratamento de erros mais robusto
2. Implemente mecanismos de retry para conexões instáveis
3. Adicione caching para reduzir chamadas repetidas
4. Implemente autenticação mais completa
5. Adicione logging estruturado
6. Implemente rate limiting para a API da OpenAI

## Recursos adicionais

- [Documentação da API da OpenAI](https://platform.openai.com/docs/api-reference)
- [Guia de uso do GPT-4o](https://platform.openai.com/docs/models/gpt-4o)
- [Princípios de Multi-Context Processing](https://github.com/seu-usuario/mcp-principles) (link fictício)

## Licença

MIT