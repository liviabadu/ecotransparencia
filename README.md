# EcoTransparência

**Acesse a aplicação:** https://ecotransparencia-d786e.web.app

A **EcoTransparência** é um site gratuito onde qualquer pessoa pode pesquisar uma empresa
(pelo CNPJ) e descobrir, em segundos, se ela tem problemas ambientais, trabalhistas ou
administrativos registrados em órgãos do governo — tudo reunido em um só lugar e resumido
em uma **nota de risco de 0 a 100**.

---
**O projeto é desenvolvido pela turma do 5º semestre de Análise e Desenvolvimento de Sistemas do Campus Taguatinga.**

- Livia Maria Badu de Oliveira
- Kaua Nascimento
- Nicole Teixeira
- Rafael Lopes
- Matheus Henrique Viana da Silva

## Índice

- [Em poucas palavras](#em-poucas-palavras)
- [Por que isso é útil](#por-que-isso-é-útil)
- [Para quem é](#para-quem-é)
- [Como usar (passo a passo)](#como-usar-passo-a-passo)
- [Como funciona a nota de risco](#como-funciona-a-nota-de-risco)
- [De onde vêm as informações](#de-onde-vêm-as-informações)
- [Exemplos do dia a dia](#exemplos-do-dia-a-dia)
- [Parte técnica (para desenvolvedores)](#parte-técnica-para-desenvolvedores)
- [Equipe](#equipe)
- [Licença e contato](#licença-e-contato)

---

## Em poucas palavras

Hoje, para saber se uma empresa tem histórico de desmatamento, multas ambientais ou trabalho
escravo, é preciso procurar em vários sites do governo (IBAMA, ICMBio, Ministério do Trabalho,
Portal da Transparência), cada um diferente do outro. É demorado e confuso.

A EcoTransparência faz esse trabalho por você: junta as informações dessas fontes oficiais e
mostra, de forma simples, **uma nota de risco socioambiental** para a empresa pesquisada,
junto com a lista de ocorrências que justificam essa nota.

> A nota é chamada de **Score ASG** (Ambiental, Social e Governança) — uma forma padronizada
> de medir o "risco socioambiental" de uma empresa.

---

## Por que isso é útil

- **Informação reunida:** em vez de consultar vários portais, você pesquisa uma vez só.
- **Fácil de entender:** uma nota de 0 a 100 e uma classificação (Baixo, Médio, Alto, Crítico).
- **Confiável:** os dados vêm apenas de fontes oficiais do governo.
- **Gratuito e aberto:** as informações são públicas; aqui elas ficam acessíveis a qualquer um.
- **Transparente:** a forma de calcular a nota é explicada e pode ser conferida.

---

## Para quem é

| Quem | Para quê |
|------|----------|
| **Bancos e financeiras** | Avaliar o risco antes de conceder crédito a uma empresa |
| **Empresas** | Verificar fornecedores e parceiros antes de fechar negócio |
| **Investidores** | Apoiar decisões de investimento responsável (ESG) |
| **Órgãos reguladores** | Acompanhar a conformidade de setores e empresas |
| **ONGs e pesquisadores** | Acompanhar questões socioambientais com dados públicos |
| **Cidadãos** | Conhecer as práticas das empresas e consumir de forma consciente |

---

## Como usar (passo a passo)

1. Acesse https://ecotransparencia-d786e.web.app
2. Digite o **CNPJ** da empresa no campo de busca (com ou sem pontuação).
3. Clique em **Pesquisar**.
4. Veja o resultado. Há três situações possíveis:
   - **Empresa com registros:** aparece a **nota de risco** e a lista de ocorrências.
   - **Empresa sem registros:** aparece a mensagem *"Nenhum registro encontrado para a entidade pesquisada"* (a empresa existe, mas não tem pendências socioambientais nas bases consultadas).
   - **CNPJ inativo:** aparece o aviso de *"CNPJ inativo"* — a empresa está irregular ou baixada na Receita Federal, então a análise não se aplica.
5. Quando a empresa tem registros, logo abaixo do resultado aparece o **Relatório de
   Conformidade Socioambiental**, um documento pronto para guardar ou compartilhar. Use os botões
   **Imprimir** ou **Exportar PDF** para imprimir o relatório ou baixá-lo como arquivo PDF.

---

## Como funciona a nota de risco

A nota vai de **0 a 100** — **quanto maior, maior o risco** — e é classificada em quatro níveis:

| Nota | Nível | O que significa |
|------|-------|-----------------|
| 0–25 | **Baixo** | Pouco ou nenhum registro de ocorrências |
| 26–50 | **Médio** | Algumas ocorrências de menor gravidade |
| 51–75 | **Alto** | Várias ocorrências ativas ou de maior gravidade |
| 76–100 | **Crítico** | Histórico grave, com várias infrações ativas |

A nota não é um simples "número de multas". Ela leva em conta, para cada ocorrência:

- **Gravidade** e tipo (uma infração ambiental pesa mais que uma administrativa);
- **Se ainda está ativa** (pendências ativas pesam mais que regularizadas);
- **Há quanto tempo aconteceu** (fatos recentes pesam mais);
- A **fonte** do registro (cada base tem um peso na composição final).

> A metodologia completa fica no site, na página **Metodologia do Score**, e no arquivo
> [`docs/METODOLOGIA_SCORE.md`](docs/METODOLOGIA_SCORE.md).

---

## De onde vêm as informações

Todos os dados são **públicos** e vêm de fontes oficiais:

- **IBAMA (Ambiental):** áreas embargadas por desmatamento e multas ambientais.
- **ICMBio (Ambiental):** infrações em unidades de conservação (fauna, flora, áreas protegidas).
- **Ministério do Trabalho (Trabalhista):** a "Lista Suja" do trabalho escravo e autuações por condições degradantes.
- **Portal da Transparência (Administrativo):** empresas inidôneas, sancionadas ou impedidas de contratar com o poder público (CEIS, CNEP, CEPIM).

Os dados são consultados nas bases oficiais para refletir a situação mais atual possível.

---

## Exemplos do dia a dia

- **Escolha de fornecedor:** uma rede de varejo vai contratar um fornecedor de madeira. Antes,
  consulta o CNPJ e descobre 3 embargos ativos por desmatamento (nota 78, Crítico). Decide não fechar.
- **Análise de crédito:** um banco recebe pedido de financiamento de uma mineradora. A consulta
  mostra autuações do IBAMA somando milhões em multas, e o banco ajusta as condições do crédito.
- **Investimento responsável:** um fundo ESG avalia uma empresa do agronegócio. A consulta mostra
  nota 12 (Baixo), sem ocorrências recentes — um sinal positivo para o investimento.
- **Acompanhamento de fornecedores:** uma multinacional consulta periodicamente seus principais
  fornecedores e fica atenta a mudanças na nota de risco.

---

# Parte técnica (para desenvolvedores)

> A partir daqui o conteúdo é voltado a quem vai instalar, rodar ou contribuir com o código.

## Visão geral da arquitetura

A EcoTransparência é uma **Single Page Application (SPA)** feita em **Angular 21**. O site é
publicado no **Firebase Hosting**, que também encaminha as chamadas de API (`/api/**`) para um
back-end hospedado no **Google Cloud Run**. A autenticação usa o **Firebase Authentication**.

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
│  │         (validação de CPF/CNPJ com dígitos)     │            │
│  └─────────────────────────────────────────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                         MODELS                                  │
│  Entity, Occurrence, SearchResult, AsgScore, SituacaoCadastral  │
└─────────────────────────────────────────────────────────────────┘
                              │  HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE HOSTING                             │
│              (Proxy /api/** → Cloud Run)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Google Cloud Run)               │
│                    região: southamerica-east1                   │
└─────────────────────────────────────────────────────────────────┘
```

## Stack tecnológico

**Framework e linguagem**

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Angular** | 21.0.0 | Framework principal da SPA |
| **TypeScript** | 5.9.2 | Linguagem com tipagem estática |
| **RxJS** | 7.8.0 | Programação reativa (observables) |

**Geração de relatórios**

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **html2canvas** | 1.4.1 | Rasteriza o relatório (HTML) em um canvas |
| **jsPDF** | 2.5.2 | Monta o PDF A4 a partir do canvas e dispara o download |

**Autenticação e hospedagem**

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Firebase** | 12.6.0 | Autenticação e hosting |
| **@angular/fire** | 21.0.0-rc.0 | SDK do Firebase para Angular |

**Testes**

| Tecnologia | Propósito |
|------------|-----------|
| **Vitest** | Testes unitários |
| **Pact** | Contract testing (compatibilidade frontend ↔ backend) |
| **Playwright** | Testes end-to-end em navegador real |

**Qualidade de código:** TypeScript em modo estrito, Prettier (100 colunas, aspas simples) e
templates estritos do Angular.

## Estrutura do projeto

```
src/
├── app/
│   ├── components/
│   │   └── search/                 # Componente de busca principal
│   ├── pages/
│   │   ├── home/                   # Página inicial (pública e dashboard)
│   │   ├── login/                  # Autenticação
│   │   ├── admin/                  # Painel administrativo
│   │   └── metodologia/            # Explicação do score
│   ├── relatorio-conformidade/     # Relatório de Conformidade (documento + PDF)
│   │   ├── relatorio-conformidade.component.*  # Renderização do documento
│   │   ├── services/
│   │   │   ├── relatorio-conformidade.service.ts  # Consolida dados da API no relatório
│   │   │   └── pdf-export.service.ts              # Exportação em PDF (html2canvas + jsPDF)
│   │   └── models/                 # View-models do relatório
│   ├── services/
│   │   ├── api.service.ts          # Comunicação com o backend
│   │   ├── auth.service.ts         # Autenticação Firebase
│   │   ├── score.service.ts        # Cálculo e formatação de scores
│   │   └── document-validation.service.ts  # Validação de CPF/CNPJ
│   ├── guards/                     # Proteção de rotas
│   ├── models/                     # Interfaces TypeScript
│   ├── app.routes.ts               # Configuração de rotas
│   └── app.config.ts               # Configuração da aplicação
├── index.html
├── main.ts
└── styles.css
```

Na raiz do projeto, além de `src/`:

```
e2e/                                # Testes end-to-end (Playwright)
├── login.spec.ts                   # Login com credenciais válidas → área logada
├── search-cnpj.spec.ts             # Busca de CNPJ → relatório com score
├── search-cnpj-inativo.spec.ts     # Busca de CNPJ inapto → "CNPJ inativo"
├── search-cnpj-sem-registros.spec.ts  # Busca de CNPJ sem ASG → "Nenhum registro encontrado"
└── export-pdf.spec.ts              # Exportação do relatório em PDF → download válido
playwright.config.ts                # Config E2E (modo headed, baseURL)
server/                             # API mock local (Express) para desenvolvimento
```

## Principais decisões de arquitetura

- **Componentes standalone (Angular 21):** sem NgModules, estrutura mais simples e melhor tree-shaking.
- **Signals para estado reativo:** gerenciamento de estado local com `signal()`, dispensando `subscribe/unsubscribe` e com melhor performance.
- **Validação de documentos no frontend:** CPF/CNPJ são validados (inclusive dígitos verificadores) antes de chamar o backend, dando feedback imediato e evitando requisições inválidas.
- **Firebase Hosting com proxy para o Cloud Run:** chamadas `/api/**` são encaminhadas ao backend, evitando problemas de CORS e usando uma URL única com SSL automático.
- **Contract testing com Pact:** garante que frontend e backend continuem compatíveis, detectando mudanças que quebrariam a integração.

## Contrato de API

Busca por documento:

```
GET /api/search/document?document={cnpj}&type=cnpj
```

Resposta quando a empresa **é encontrada** (resumo dos campos):

```
{
  "found": true,
  "entity": {
    "name": "Empresa Verde Sustentável Ltda",
    "document": "11222333000181",
    "documentType": "cnpj",
    "score": 45,
    "riskLevel": "Medio",
    "asgScore": {
      "score": 45,
      "riskLevel": "Medio",
      "totalOcorrencias": 3,
      "breakdown": [ ... por fonte: fonte, peso, quantidade, score, scorePonderado ]
    },
    "ocorrencias": { "embargos": [ ... ], "autosInfracao": [ ... ] }
  }
}
```

Resposta quando o **CNPJ está inativo** na Receita:

```
{
  "found": false,
  "bloqueadoPorSituacaoCadastral": true,
  "situacaoCadastral": {
    "situacao": "INATIVA",
    "valido": false,
    "mensagem": "CNPJ consta como inativo na Receita Federal"
  }
}
```

Resposta quando **nada é encontrado**:

```
{ "found": false }
```

## Geração de relatórios (PDF)

Quando a busca encontra registros, o site monta o **Relatório de Conformidade Socioambiental** —
um documento com o score, a empresa consultada, as bases pesquisadas e as ocorrências agrupadas
por fonte — que pode ser impresso ou exportado em PDF.

Todo o processo acontece **no navegador**: o backend só fornece os dados da empresa; não existe
serviço de geração de PDF no servidor.

```
Entity (resposta da API)
        │
        ▼  consolidação (RelatorioConformidadeService)
RelatorioConformidade (view-model)
        │
        ▼  renderização (RelatorioConformidadeComponent)
Documento HTML/CSS "de papel"
        │
        ▼  html2canvas (rasterização)
Canvas (imagem do documento)
        │
        ▼  jsPDF (páginas A4 + download)
relatorio-conformidade-{CNPJ}-{AAAA-MM-DD}.pdf
```

O pipeline tem três etapas, cada uma em um arquivo de `src/app/relatorio-conformidade/`:

**1. Consolidação** — `services/relatorio-conformidade.service.ts`

Transforma a `Entity` retornada pela API no view-model `RelatorioConformidade`. As ocorrências
são agrupadas em quatro blocos fixos, um por fonte oficial (IBAMA, ICMBio, MTE e Portal da
Transparência) — as quatro bases aparecem sempre na seção "bases pesquisadas", mesmo quando não
têm ocorrências, para dar rastreabilidade ao que foi consultado. Datas, moeda (BRL) e áreas são
formatadas em pt-BR; as datas usam `timeZone: 'UTC'` na formatação para que uma data como
`2023-06-15` não "volte um dia" em fusos negativos como o do Brasil.

**2. Renderização** — `relatorio-conformidade.component.{ts,html,css}`

Componente standalone (signals + `computed`) que renderiza o relatório como um documento:
cabeçalho com data de geração, score visual, dados da empresa, bases pesquisadas, blocos de
ocorrências e o aviso de responsabilidade no rodapé. O CSS é pensado para papel (fundo branco,
tipografia de documento) e **evita de propósito funções modernas de cor** como `color-mix()` e
`oklch()` — o html2canvas não as entende e a exportação falharia. O botão **Imprimir** usa o
`window.print()` nativo, com regras `@media print` que escondem a barra de ações e isolam o
documento.

**3. Exportação em PDF** — `services/pdf-export.service.ts`

Ao clicar em **Exportar PDF**:

1. O **html2canvas** rasteriza o nó do documento em um canvas. A escala é calculada para dar
   nitidez (até 2× o device pixel ratio), mas limitada a ~14.000 px de altura — o Safari rejeita
   canvas acima de ~16.000 px.
2. O **jsPDF** cria um PDF A4 (210 × 297 mm, margens de 10 mm). Se o relatório não cabe em uma
   página, o canvas é fatiado em blocos do tamanho da área útil e cada fatia vira uma página.
3. O download é disparado com o nome `relatorio-conformidade-{CNPJ}-{AAAA-MM-DD}.pdf`.

Durante a geração, o botão exibe "Gerando PDF…" e fica desabilitado; se algo falhar, uma
mensagem de erro aparece no lugar do download. O fluxo completo é coberto pelo teste E2E
`e2e/export-pdf.spec.ts` (veja [Testes](#testes)).

## Como rodar localmente

**Pré-requisitos:** Node.js 20+ e npm 10+.

```bash
# 1. Clonar o repositório
git clone https://github.com/liviabadu/ecotransparencia.git

# 2. Instalar dependências
npm install

# 3. Rodar em desenvolvimento
npm start
```

**Scripts disponíveis:**

| Comando | Descrição |
|---------|-----------|
| `npm start` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Testes unitários |
| `npm run test:pact` | Contract tests (Pact) |
| `npm run e2e` | Testes end-to-end (Playwright, navegador visível) |
| `npm run e2e:headed` | Testes E2E forçando modo headed |
| `npm run e2e:report` | Abre o relatório HTML do último E2E |

## Testes

**Unitários** — `npm test`. Cobrem, entre outros, a validação de CPF/CNPJ
(`DocumentValidationService`), o cálculo de níveis de risco (`ScoreService`) e o comportamento
do formulário de busca.

**Contract tests (Pact)** — `npm run test:pact`. Geram contratos em `/pacts/` para validar a API.

**End-to-end (Playwright)** — testes em navegador real (modo *headed*, janela visível),
executados contra o site publicado. Como abrem uma janela, rode em um ambiente com tela.

```bash
# Executa TODOS os testes E2E
npm run e2e

# Rodar apenas um arquivo
npx playwright test e2e/login.spec.ts

# Rodar pelo nome do teste (filtro de texto)
npx playwright test -g "score 35"

# Relatório HTML da última execução
npm run e2e:report
```

Cenários cobertos:

- **`e2e/login.spec.ts`** — clica em *Entrar*, informa e-mail e senha de uma conta de teste e
  valida que, com credenciais corretas, o portal navega para a **área logada** (dashboard com a
  saudação "Olá, …"). Usa **Firebase Auth real**; as credenciais podem ser sobrescritas por
  `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` (use uma conta de teste dedicada):
  ```bash
  E2E_LOGIN_EMAIL=conta@teste.com E2E_LOGIN_PASSWORD='senha' npx playwright test e2e/login.spec.ts
  ```
- **`e2e/search-cnpj.spec.ts`** — pesquisa o CNPJ `32.102.290/0001-70` e valida que o relatório exibe **Score de risco 35** (faixa *Médio*).
- **`e2e/search-cnpj-inativo.spec.ts`** — pesquisa o CNPJ inapto `02.698.412/0001-72` e valida o card **"CNPJ inativo"** (situação *Inapta*), sem relatório de score.
- **`e2e/search-cnpj-sem-registros.spec.ts`** — pesquisa o CNPJ válido sem pendências `00.000.000/0001-91` e valida a mensagem **"Nenhum registro encontrado para a entidade pesquisada"**.
- **`e2e/export-pdf.spec.ts`** — pesquisa o CNPJ `32.102.290/0001-70`, clica em **Exportar PDF**
  e valida o download: nome `relatorio-conformidade-{CNPJ}-{AAAA-MM-DD}.pdf`, conteúdo iniciando
  com os bytes `%PDF-` (PDF válido), tamanho acima de 10 KB e nenhum erro de renderização. O CNPJ
  pode ser sobrescrito com a variável `E2E_CNPJ`.

> ⚠️ **Importante:** os testes E2E rodam contra o **site publicado** (`https://ecotransparencia-d786e.web.app`),
> porque a nota real desses CNPJs é produzida pelo backend no Cloud Run — o mock local
> (`server/index.js`) não reproduz esses valores. Consequências:
> - exige rede e o Cloud Run "acordado" (a primeira chamada pode demorar — *cold start*);
> - a nota deriva de dados públicos consultados ao vivo (IBAMA/MTE); se essas bases mudarem, o valor `35` pode variar e o teste precisará de ajuste.
>
> Para apontar para outro ambiente, use a variável `E2E_BASE_URL`
> (ex.: `E2E_BASE_URL=http://localhost:4200 npm run e2e`).

**Pré-requisito (primeira execução):** baixe o navegador usado pelo Playwright.

```bash
npx playwright install chromium
```

## Deploy

- **Frontend:** Firebase Hosting (`ecotransparencia-d786e.web.app`)
- **Backend:** Google Cloud Run (região `southamerica-east1`)
- **Autenticação:** Firebase Authentication

```bash
# Build de produção
npm run build

# Deploy do site no Firebase
firebase deploy --only hosting
```

As configurações do Firebase (API Key, Project ID, Auth Domain) ficam em `app.config.ts`.

---

## Equipe

Projeto desenvolvido pela turma do 5º semestre de Análise e Desenvolvimento de Sistemas do
Campus Taguatinga:

- Livia Maria Badu de Oliveira
- Matheus Henrique Viana da Silva
- Kaua Nascimento
- Nicole Teixeira
- Rafael Lopes

---

## Licença e contato

Projeto desenvolvido como parte do Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas.

Contato: liviabadu@gmail.com
