# Testes de Contrato com Pact.js

## Visão Geral

Este projeto utiliza [Pact.js](https://docs.pact.io/) para testes de contrato entre o frontend (consumidor) e o backend (provedor). Os testes de contrato garantem que ambos os lados concordem sobre o formato das requisições e respostas da API.

## O que é Consumer-Driven Contract Testing?

O Consumer-Driven Contract Testing (CDCT) é uma abordagem onde o consumidor (frontend) define o contrato esperado, e o provedor (backend) deve implementar esse contrato. Isso permite:

- **Desenvolvimento independente**: Frontend e backend podem ser desenvolvidos em paralelo
- **Detecção precoce de breaking changes**: Mudanças incompatíveis são detectadas antes do deploy
- **Documentação viva**: Os contratos servem como documentação atualizada da API

## Estrutura dos Arquivos

```
ecotransparencia/
├── src/app/
│   ├── pact/
│   │   └── api.service.pact.spec.ts  # Testes de contrato do consumidor
│   └── services/
│       └── api.service.ts             # Serviço que define as interfaces da API
├── pacts/                              # Contratos gerados (não versionados)
│   └── EcoTransparenciaFrontend-EcoTransparenciaBackend.json
└── docs/
    └── PACT_CONTRACT_TESTING.md       # Esta documentação
```

## Executando os Testes de Contrato

### Execução única (CI/CD)
```bash
npm run test:pact
```

### Modo watch (desenvolvimento)
```bash
npm run test:pact:watch
```

## Contratos Definidos

### 1. Busca por Documento (CPF/CNPJ)

**Endpoint:** `GET /api/search/document`

**Parâmetros de Query:**
- `document`: string - CPF ou CNPJ (apenas dígitos)
- `type`: string - `"cpf"` ou `"cnpj"`

**Resposta de Sucesso (200):**
```json
{
  "found": true,
  "entity": {
    "id": "string",
    "name": "string",
    "document": "string",
    "documentType": "cpf" | "cnpj",
    "score": number,
    "riskLevel": "Baixo" | "Médio" | "Alto" | "Crítico",
    "occurrences": [
      {
        "id": "string",
        "date": "ISO 8601 datetime string",
        "description": "string",
        "status": "Ativo" | "Baixado",
        "source": "string",
        "sourceUrl": "string (URL)",
        "category": "Ambiental IBAMA" | "Ambiental ICMBio" | "Trabalhista" | "Administrativo"
      }
    ]
  }
}
```

**Resposta quando não encontrado (200):**
```json
{
  "found": false
}
```

### 2. Busca por Nome

**Endpoint:** `GET /api/search/name`

**Parâmetros de Query:**
- `name`: string - Nome da entidade (mínimo 3 caracteres)

**Resposta:** Mesmo formato da busca por documento.

## Compartilhando Contratos com o Backend

Após executar os testes de contrato, o arquivo JSON é gerado em:
```
pacts/EcoTransparenciaFrontend-EcoTransparenciaBackend.json
```

### Opção 1: Compartilhar manualmente
Copie o arquivo JSON e envie para a equipe de backend para que implementem os endpoints de acordo com o contrato.

### Opção 2: Pact Broker (recomendado para produção)
Configure um [Pact Broker](https://docs.pact.io/pact_broker) para:
- Armazenar contratos centralmente
- Verificar compatibilidade automaticamente
- Integrar com CI/CD

## Verificação do Contrato pelo Backend

A equipe de backend deve criar testes de verificação usando o contrato gerado. Exemplo em Node.js:

```javascript
const { Verifier } = require('@pact-foundation/pact');

describe('Pact Verification', () => {
  it('validates the expectations of EcoTransparenciaFrontend', async () => {
    const options = {
      provider: 'EcoTransparenciaBackend',
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: ['./pacts/EcoTransparenciaFrontend-EcoTransparenciaBackend.json'],
      // Ou use pactBrokerUrl se estiver usando Pact Broker
    };

    await new Verifier(options).verifyProvider();
  });
});
```

## Estados do Provedor (Provider States)

Os testes de contrato definem estados que o backend deve configurar:

| Estado | Descrição |
|--------|-----------|
| `an entity with CNPJ 11222333000181 exists` | Empresa Verde Sustentável deve existir |
| `a person with CPF 12345678909 exists` | João da Silva Teste deve existir |
| `no entity with CNPJ 00000000000000 exists` | Não deve haver entidade com este CNPJ |
| `an entity with name containing "Empresa Verde" exists` | Busca por nome deve encontrar a empresa |
| `no entity with name "Entidade Inexistente XYZ" exists` | Busca não deve retornar resultados |
| `an entity with critical risk level exists` | Mineradora Vermelha (CNPJ 44555666000181) deve existir |

## Tipos e Interfaces

As interfaces TypeScript que definem o contrato estão em `src/app/services/api.service.ts`:

```typescript
interface ApiEntityResponse {
  id: string;
  name: string;
  document: string;
  documentType: 'cpf' | 'cnpj';
  score: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  occurrences: ApiOccurrenceResponse[];
}

interface ApiOccurrenceResponse {
  id: string;
  date: string; // ISO 8601
  description: string;
  status: 'Ativo' | 'Baixado';
  source: string;
  sourceUrl: string;
  category: 'Ambiental IBAMA' | 'Ambiental ICMBio' | 'Trabalhista' | 'Administrativo';
}

interface ApiSearchResponse {
  found: boolean;
  entity?: ApiEntityResponse;
}
```

## Troubleshooting

### Erro: "Cannot find module 'path'"
Certifique-se de que `@types/node` está instalado e `"node"` está no array `types` do `tsconfig.spec.json`.

### Testes falhando com valores de matcher
Se os testes falharem comparando valores de regex (ex: `'^(cpf|cnpj)$'` ao invés de `'cnpj'`), use `like()` ao invés de `regex()` para matchers que serão verificados no teste.

### Contrato não sendo gerado
Verifique se o diretório `pacts/` existe e tem permissões de escrita. O Pact cria o diretório automaticamente se não existir.

## Recursos Adicionais

- [Documentação Oficial do Pact](https://docs.pact.io/)
- [Pact JS no GitHub](https://github.com/pact-foundation/pact-js)
- [Pact Broker](https://docs.pact.io/pact_broker)
- [Consumer-Driven Contracts: A Service Evolution Pattern](https://martinfowler.com/articles/consumerDrivenContracts.html)
