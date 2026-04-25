# EcoTransparência

**Acesse a aplicação anterior:** https://ecotransparencia-d786e.web.app

**Acesse a aplicação Atualizada:** https://ecotransparencia-d786e.web.app/

---

## Índice

- [Visão Geral](#visão-geral)
- [Visão de Negócio](#visão-de-negócio)
  - [O Problema](#o-problema)
  - [Nossa Solução](#nossa-solução)
  - [Público-Alvo](#público-alvo)
  - [Proposta de Valor](#proposta-de-valor)
  - [Fontes de Dados](#fontes-de-dados)
  - [Metodologia do Score ASG](#metodologia-do-score-asg)
  - [Casos de Uso](#casos-de-uso)
- [Visão Técnica](#visão-técnica)
  - [Arquitetura da Aplicação](#arquitetura-da-aplicação)
  - [Stack Tecnológico](#stack-tecnológico)
  - [Estrutura do Projeto](#estrutura-do-projeto)
  - [Decisões Arquiteturais](#decisões-arquiteturais)
  - [Contrato de API](#contrato-de-api)
  - [Testes](#testes)
  - [Deploy e Infraestrutura](#deploy-e-infraestrutura)
- [Como Executar](#como-executar)
- [Equipe](#equipe)
- [Licença](#licença)

---

## Visão Geral

A **EcoTransparência** é uma plataforma digital inovadora que democratiza o acesso a informações sobre responsabilidade socioambiental das empresas brasileiras. Consolidamos dados públicos de múltiplas fontes governamentais, calculamos scores de risco ASG (Ambiental, Social e Governança), e oferecemos uma visão clara e atualizada do perfil de risco de cada organização.

---

## Visão de Negócio

### O Problema

O Brasil enfrenta um desafio crítico na gestão de informações socioambientais corporativas:

1. **Fragmentação de Dados**: Informações críticas sobre sustentabilidade estão espalhadas em múltiplos portais governamentais (IBAMA, ICMBio, Ministério do Trabalho, Portal de Dados Abertos), cada um com formatos e interfaces distintas.

2. **Dificuldade de Acesso**: Para avaliar o risco socioambiental de uma empresa, é necessário consultar manualmente diversas bases de dados, interpretar formatos diferentes e consolidar informações de forma manual.

3. **Tomada de Decisão Prejudicada**: Instituições financeiras, investidores e parceiros comerciais frequentemente tomam decisões com base em informações incompletas ou desatualizadas, aumentando a exposição a riscos reputacionais, legais e financeiros.

4. **Falta de Padronização**: Não existe um score padronizado que permita comparar o perfil de risco socioambiental entre diferentes empresas de forma objetiva.

5. **Barreiras para Pequenos Atores**: Pequenas empresas e organizações não têm recursos para realizar due diligence socioambiental completa de seus parceiros e fornecedores.

### Nossa Solução

A EcoTransparência oferece uma **plataforma centralizada e gratuita** que resolve esses problemas através de:

#### Consolidação Automatizada
Agregamos dados de múltiplas fontes governamentais oficiais em uma única interface, eliminando a necessidade de consultas manuais em diversos portais.

#### Score ASG Calculado
Transformamos dados brutos em um **score de risco de 0 a 100 pontos**, classificado em quatro níveis:

| Faixa | Nível | Significado |
|-------|-------|-------------|
| 0-25 | **Baixo** | Pouco ou nenhum registro de ocorrências |
| 26-50 | **Médio** | Algumas ocorrências de menor gravidade |
| 51-75 | **Alto** | Múltiplas ocorrências ativas ou de maior gravidade |
| 76-100 | **Crítico** | Histórico grave com múltiplas infrações ativas |

#### Transparência Total
Todas as ocorrências são apresentadas com detalhes completos, incluindo data, descrição, status, localização geográfica, bioma afetado, área embargada e link para a fonte original.

#### Atualização Contínua
Os dados são sincronizados periodicamente com as bases governamentais, garantindo informações atualizadas.

### Público-Alvo

| Segmento | Necessidade | Benefício |
|----------|-------------|-----------|
| **Instituições Financeiras** | Avaliar riscos na concessão de crédito | Redução de exposição a clientes com passivos ambientais |
| **Empresas** | Conhecer situação de parceiros e fornecedores | Due diligence automatizada na cadeia de suprimentos |
| **Órgãos Reguladores** | Monitorar conformidade setorial | Visão consolidada para fiscalização |
| **Investidores** | Avaliar sustentabilidade de investimentos | Apoio a decisões ESG informadas |
| **ONGs e Pesquisadores** | Acompanhar questões socioambientais | Acesso facilitado a dados públicos |
| **Cidadãos** | Conhecer práticas de empresas | Empoderamento para consumo consciente |

### Proposta de Valor

1. **Gratuidade**: Acesso livre a informações que são públicas por natureza
2. **Simplicidade**: Interface intuitiva com busca por CNPJ
3. **Confiabilidade**: Dados exclusivamente de fontes governamentais oficiais
4. **Transparência**: Metodologia de cálculo do score é pública e auditável
5. **Completude**: Consolidação de múltiplas categorias de ocorrências

### Fontes de Dados

A plataforma integra dados das seguintes fontes oficiais:

#### Ambiental IBAMA
- **Embargos**: Áreas embargadas por desmatamento ilegal ou outras infrações ambientais
- **Autos de Infração**: Multas e autuações por descumprimento da legislação ambiental
- **Dados incluem**: Localização (município/UF), bioma afetado, área embargada
#### Ambiental ICMBio
- **Processos Administrativos**: Infrações em unidades de conservação
- **Autos de Infração**: Autuações relacionadas à fauna, flora e áreas protegidas
- **Dados incluem**: Tipo de infração, gravidade, enquadramento legal

#### Trabalhista
- **Lista Suja do Trabalho Escravo**: Empregadores flagrados submetendo trabalhadores a condições análogas à escravidão
- **Autuações**: Infrações por condições de trabalho degradantes
- **Fonte**: Ministério do Trabalho e Emprego

#### Administrativo
- **CEIS/CNEP**: Cadastro de empresas inidôneas e sancionadas
- **Impedimentos**: Empresas impedidas de contratar com a administração pública
- **Fonte**: Portal de Dados Abertos do Governo Federal

### Metodologia do Score ASG

O Score ASG (Ambiental, Social e Governança) é calculado através de uma metodologia ponderada:

#### Composição do Score

```
Score Final = Σ (Score da Fonte × Peso da Fonte)
```

Cada fonte de dados possui:
- **Quantidade de Ocorrências**: Número total de registros
- **Peso da Fonte**: Importância relativa na composição (ex: 0.4 para IBAMA, 0.3 para ICMBio)
- **Score por Fonte**: Pontuação baseada na quantidade e gravidade das ocorrências
- **Score Ponderado**: Score da fonte multiplicado pelo seu peso

#### Fatores Considerados

Para cada ocorrência, quando disponíveis:
- **Data**: Ocorrências mais recentes têm maior impacto
- **Status**: Ocorrências ativas pesam mais que regularizadas
- **Gravidade**: Influencia diretamente o score
- **Área Afetada**: Extensão do dano ambiental
- **Valor da Multa**: Indicador de gravidade
- **Bioma**: Infrações em biomas protegidos podem ter peso adicional

#### Exemplo de Cálculo

| Fonte | Ocorrências | Peso | Score | Ponderado |
|-------|-------------|------|-------|-----------|
| IBAMA | 2 | 0.4 | 30 | 12.0 |
| ICMBio | 1 | 0.3 | 20 | 6.0 |
| Trabalhista | 0 | 0.2 | 0 | 0.0 |
| Administrativo | 1 | 0.1 | 25 | 2.5 |
| **Total** | | | | **20.5** |

Resultado: Score 20.5 → Nível de Risco: **Baixo**

### Casos de Uso

#### UC01: Consulta de Fornecedor
Uma empresa de varejo deseja contratar um novo fornecedor de madeira. Antes de fechar contrato, consulta o CNPJ na EcoTransparência e descobre que o fornecedor possui 3 embargos ativos por desmatamento na Amazônia, com score de risco 78 (Crítico). A empresa decide não prosseguir com a contratação.

#### UC02: Análise de Crédito
Um banco recebe pedido de financiamento de uma mineradora. A consulta na EcoTransparência revela múltiplas autuações do IBAMA totalizando R$ 2.5 milhões em multas. O analista de crédito inclui essa informação na avaliação de risco, ajustando as condições do financiamento.

#### UC03: Due Diligence para Investimento
Um fundo de investimento ESG analisa potencial aquisição de participação em empresa do agronegócio. A EcoTransparência mostra score 12 (Baixo), sem ocorrências nos últimos 5 anos. O relatório positivo é incluído no memorando de investimento.

#### UC04: Monitoramento de Cadeia de Suprimentos
Uma multinacional precisa reportar riscos ESG de sua cadeia de suprimentos. Utiliza a EcoTransparência para consultar periodicamente seus 200 principais fornecedores brasileiros, gerando alertas automáticos quando há mudança significativa no score.

---

## Visão Técnica

### Arquitetura da Aplicação

A EcoTransparência Frontend é uma **Single Page Application (SPA)** construída com Angular 21, seguindo uma arquitetura baseada em componentes com separação clara de responsabilidades.

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (SPA)                          │
│                         Angular 21                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Pages    │  │ Components  │  │   Guards    │              │
│  │  - Home     │  │  - Search   │  │  - Auth     │              │
│  │  - Login    │  └─────────────┘  └─────────────┘              │
│  │  - Admin    │                                                │
│  │  - Metodo.  │                                                │
│  └─────────────┘                                                │
├─────────────────────────────────────────────────────────────────┤
│                        SERVICES LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ ApiService  │  │ScoreService │  │ AuthService │              │
│  │             │  │             │  │  (Firebase) │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────────────────────────────────────────┐            │
│  │         DocumentValidationService               │            │
│  │         (CPF/CNPJ validation with check digits) │            │
│  └─────────────────────────────────────────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                         MODELS                                  │
│  Entity, Occurrence, SearchResult, AsgScore, SituacaoCadastral  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE HOSTING                             │
│              (Proxy /api/** → Cloud Run)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API                                  │
│                 (Google Cloud Run)                              │
│     https://ecotransparencia-api-xxx.us-central1.run.app        │
└─────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

#### Core Framework
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Angular** | 21.0.0 | Framework principal para SPA |
| **TypeScript** | 5.9.2 | Linguagem com tipagem estática |
| **RxJS** | 7.8.0 | Programação reativa e observables |

#### Autenticação e Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Firebase** | 12.6.0 | Autenticação e hosting |
| **@angular/fire** | 20.0.1 | SDK Angular para Firebase |

#### Testes
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Vitest** | 4.0.8 | Framework de testes unitários |
| **Pact** | 16.0.2 | Contract testing (Consumer-Driven) |
| **jsdom** | 27.1.0 | DOM virtual para testes |

#### Qualidade de Código
| Ferramenta | Configuração | Propósito |
|------------|--------------|-----------|
| **TypeScript Strict Mode** | `strict: true` | Tipagem rigorosa |
| **Prettier** | 100 cols, single quotes | Formatação consistente |
| **Angular Strict Templates** | Habilitado | Validação de templates |

### Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   └── search/                 # Componente de busca principal
│   │       ├── search.ts           # Lógica do componente
│   │       ├── search.html         # Template com resultados
│   │       ├── search.css          # Estilos do componente
│   │       └── search.spec.ts      # Testes unitários
│   │
│   ├── pages/
│   │   ├── home/                   # Página inicial
│   │   ├── login/                  # Autenticação admin
│   │   ├── admin/                  # Painel administrativo
│   │   └── metodologia/            # Explicação do score
│   │
│   ├── services/
│   │   ├── api.service.ts          # Comunicação com backend
│   │   ├── auth.service.ts         # Autenticação Firebase
│   │   ├── score.service.ts        # Cálculo e formatação de scores
│   │   └── document-validation.service.ts  # Validação CPF/CNPJ
│   │
│   ├── guards/
│   │   └── auth.guard.ts           # Proteção de rotas admin
│   │
│   ├── models/
│   │   └── entity.model.ts         # Interfaces TypeScript
│   │
│   ├── pact/
│   │   └── api.service.pact.spec.ts  # Contract tests
│   │
│   ├── app.ts                      # Componente raiz
│   ├── app.routes.ts               # Configuração de rotas
│   └── app.config.ts               # Configuração da aplicação
│
├── index.html                      # HTML principal
├── main.ts                         # Bootstrap da aplicação
└── styles.css                      # Estilos globais
```

### Decisões Arquiteturais

#### 1. Standalone Components (Angular 21)
Optamos por componentes standalone ao invés de NgModules, simplificando a estrutura e melhorando tree-shaking:

```typescript
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
})
export class Search { }
```

#### 2. Signals para Estado Reativo
Utilizamos Signals do Angular para gerenciamento de estado local, substituindo BehaviorSubjects:

```typescript
searchTerm = signal('');
isLoading = signal(false);
searchResult = signal<SearchResult | null>(null);
```

**Benefícios:**
- Melhor performance com fine-grained reactivity
- Código mais limpo sem necessidade de subscribe/unsubscribe
- Integração nativa com change detection

#### 3. Validação de Documentos no Frontend
Implementamos validação completa de CPF/CNPJ com verificação de dígitos no frontend:

```typescript
// Validação CNPJ com dígitos verificadores
const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
let sum = 0;
for (let i = 0; i < 12; i++) {
  sum += parseInt(stripped[i], 10) * weights1[i];
}
```

**Motivação:**
- Feedback imediato ao usuário
- Redução de requisições inválidas ao backend
- Aplicação automática de máscara durante digitação

#### 4. Firebase Hosting com Proxy para Cloud Run
Configuramos Firebase Hosting para fazer proxy de requisições `/api/**` para o backend no Cloud Run:

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "ecotransparencia-api",
          "region": "us-central1"
        }
      }
    ]
  }
}
```

**Benefícios:**
- Evita problemas de CORS
- URL única para frontend e API
- Certificado SSL gerenciado automaticamente

#### 5. Contract Testing com Pact
Utilizamos Pact para garantir compatibilidade entre frontend e backend:

```typescript
const provider = new PactV4({
  consumer: 'EcoTransparenciaFrontendV2',
  provider: 'EcoTransparenciaBackend',
});
```

**Benefícios:**
- Contratos versionados e auditáveis
- Detecção precoce de breaking changes
- Documentação viva da API

### Contrato de API

#### Endpoint: Busca por Documento

```
GET /api/search/document?document={cnpj}&type=cnpj
```

**Response (200 OK) - Encontrado:**
```json
{
  "found": true,
  "entity": {
    "id": "1",
    "name": "Empresa Verde Sustentável Ltda",
    "document": "11222333000181",
    "documentType": "cnpj",
    "score": 45,
    "riskLevel": "Medio",
    "occurrences": [...],
    "asgScore": {
      "score": 45,
      "riskLevel": "Medio",
      "totalOcorrencias": 3,
      "breakdown": [
        {
          "fonte": "Embargos IBAMA",
          "peso": 0.5,
          "quantidadeOcorrencias": 2,
          "score": 30,
          "scorePonderado": 15.0
        }
      ]
    },
    "ocorrencias": {
      "embargos": [...],
      "autosInfracao": [...]
    }
  }
}
```

**Response (200 OK) - CNPJ Inativo:**
```json
{
  "found": false,
  "bloqueadoPorSituacaoCadastral": true,
  "situacaoCadastral": {
    "dataConsulta": "2024-12-10T10:30:00Z",
    "mensagem": "CNPJ consta como inativo na Receita Federal",
    "situacao": "INATIVA",
    "valido": false
  }
}
```

**Response (200 OK) - Não Encontrado:**
```json
{
  "found": false
}
```

### Testes

#### Testes Unitários
```bash
npm test
```

Cobertura inclui:
- `DocumentValidationService`: Validação de CPF/CNPJ
- `ScoreService`: Cálculo de níveis de risco
- `Search Component`: Comportamento do formulário

#### Contract Tests (Pact)
```bash
npm run test:pact
```

Gera contratos em `/pacts/` para validação no backend.

### Deploy e Infraestrutura

#### Ambiente de Produção
- **Frontend**: Firebase Hosting (`ecotransparencia-d786e.web.app`)
- **Backend**: Google Cloud Run (`us-central1`)
- **Autenticação**: Firebase Authentication

#### Pipeline de Deploy
```bash
# Build de produção
npm run build

# Deploy no Firebase
firebase deploy --only hosting
```

#### Variáveis de Ambiente
Configuradas em `app.config.ts`:
- Firebase API Key
- Firebase Project ID
- Firebase Auth Domain

---

## Como Executar

### Pré-requisitos
- Node.js 20+
- npm 10+

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ecotransparencia.git

# Instale dependências
npm install

# Execute em desenvolvimento
npm start
```

### Scripts Disponíveis
| Comando | Descrição |
|---------|-----------|
| `npm start` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Executa testes unitários |
| `npm run test:pact` | Executa contract tests |

---

## Equipe

O projeto é desenvolvido pela turma do 4º semestre de Análise e Desenvolvimento de Sistemas do Campus Taguatinga:

- Livia Maria Badu de Oliveira
- Matheus Henrique Viana da Silva
- Kaua Nascimento      
- Rafael Lopes
- Nicole

---

## Licença

Este projeto é desenvolvido como parte do Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas.

---

## Contato

Para mais informações: liviabadu@gmail.com
