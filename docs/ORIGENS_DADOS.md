# Especificação de Origens de Dados - EcoTransparência

## Introdução

Este documento especifica as origens de dados que devem ser consultadas pela plataforma EcoTransparência para composição do score de risco socioambiental e climático. Cada fonte é detalhada com informações técnicas necessárias para integração.

---

## Fontes de Dados Ambientais

### OD01 - IBAMA - Áreas Embargadas

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis (IBAMA) |
| **Descrição** | Cadastro de áreas onde atividades econômicas foram suspensas devido a infrações ambientais, como desmatamento ilegal, queimadas e degradação ambiental |
| **URL do Portal** | https://servicos.ibama.gov.br/ctf/publico/areasembargadas |
| **API/Dados Abertos** | https://dadosabertos.ibama.gov.br |
| **Formato dos Dados** | CSV, JSON |
| **Periodicidade de Atualização** | Diária |
| **Categoria de Risco** | Ambiental |
| **Peso no Score** | Alto |

**Campos Disponíveis:**
- CPF/CNPJ do infrator
- Nome/Razão Social
- Município e UF
- Data do embargo
- Área embargada (hectares)
- Motivo do embargo
- Situação atual (Ativo/Baixado)
- Número do auto de infração

---

### OD02 - IBAMA - Autos de Infração

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis (IBAMA) |
| **Descrição** | Registro de autos de infração lavrados por infrações à legislação ambiental federal |
| **URL do Portal** | https://servicos.ibama.gov.br/ctf/publico/areasembargadas |
| **API/Dados Abertos** | https://dadosabertos.ibama.gov.br |
| **Formato dos Dados** | CSV, JSON |
| **Periodicidade de Atualização** | Diária |
| **Categoria de Risco** | Ambiental |
| **Peso no Score** | Alto |

**Campos Disponíveis:**
- Número do auto de infração
- CPF/CNPJ do autuado
- Nome/Razão Social
- Data da autuação
- Município e UF
- Descrição da infração
- Enquadramento legal
- Valor da multa (R$)
- Situação do processo

---

### OD03 - ICMBio - Infrações em Unidades de Conservação

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Instituto Chico Mendes de Conservação da Biodiversidade (ICMBio) |
| **Descrição** | Registro de infrações ambientais cometidas em Unidades de Conservação federais |
| **URL do Portal** | https://www.icmbio.gov.br |
| **API/Dados Abertos** | https://dados.gov.br (Portal de Dados Abertos) |
| **Formato dos Dados** | CSV |
| **Periodicidade de Atualização** | Mensal |
| **Categoria de Risco** | Ambiental |
| **Peso no Score** | Alto |

**Campos Disponíveis:**
- CPF/CNPJ do infrator
- Nome/Razão Social
- Unidade de Conservação afetada
- Data da infração
- Tipo de infração
- Valor da multa (R$)
- Situação do processo

---

## Fontes de Dados Trabalhistas

### OD04 - Lista Suja do Trabalho Escravo

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Ministério do Trabalho e Emprego (MTE) |
| **Descrição** | Cadastro de empregadores que submeteram trabalhadores a condições análogas à escravidão |
| **URL do Portal** | https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/areas-de-atuacao/cadastro_de_empregadores.pdf |
| **API/Dados Abertos** | https://dados.gov.br |
| **Formato dos Dados** | PDF, CSV |
| **Periodicidade de Atualização** | Semestral |
| **Categoria de Risco** | Trabalhista |
| **Peso no Score** | Crítico |

**Campos Disponíveis:**
- CNPJ/CPF do empregador
- Nome/Razão Social
- Estabelecimento
- Município e UF
- Data da inclusão
- Número de trabalhadores resgatados
- Data da decisão administrativa

---

## Fontes de Dados Administrativos

### OD05 - CEIS - Cadastro de Empresas Inidôneas e Suspensas

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Controladoria-Geral da União (CGU) |
| **Descrição** | Cadastro de empresas e pessoas físicas impedidas de participar de licitações ou celebrar contratos com a administração pública |
| **URL do Portal** | https://portaldatransparencia.gov.br/sancoes/ceis |
| **API/Dados Abertos** | https://api.portaldatransparencia.gov.br |
| **Formato dos Dados** | JSON, CSV |
| **Periodicidade de Atualização** | Diária |
| **Categoria de Risco** | Administrativo |
| **Peso no Score** | Médio |

**Campos Disponíveis:**
- CPF/CNPJ do sancionado
- Nome/Razão Social
- Tipo de sanção
- Órgão sancionador
- Fundamentação legal
- Data de início da sanção
- Data de fim da sanção
- Fonte da informação

---

### OD06 - CNEP - Cadastro Nacional de Empresas Punidas

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Controladoria-Geral da União (CGU) |
| **Descrição** | Cadastro de empresas punidas com base na Lei Anticorrupção (Lei nº 12.846/2013) |
| **URL do Portal** | https://portaldatransparencia.gov.br/sancoes/cnep |
| **API/Dados Abertos** | https://api.portaldatransparencia.gov.br |
| **Formato dos Dados** | JSON, CSV |
| **Periodicidade de Atualização** | Diária |
| **Categoria de Risco** | Administrativo |
| **Peso no Score** | Médio |

**Campos Disponíveis:**
- CNPJ da empresa
- Razão Social
- Tipo de sanção aplicada
- Valor da multa (R$)
- Órgão sancionador
- Data da publicação
- Data de início e fim da sanção

---

### OD07 - CEPIM - Cadastro de Entidades Privadas Sem Fins Lucrativos Impedidas

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Controladoria-Geral da União (CGU) |
| **Descrição** | Cadastro de entidades privadas sem fins lucrativos impedidas de celebrar convênios, contratos de repasse ou termos de parceria com a administração pública federal |
| **URL do Portal** | https://portaldatransparencia.gov.br/sancoes/cepim |
| **API/Dados Abertos** | https://api.portaldatransparencia.gov.br |
| **Formato dos Dados** | JSON, CSV |
| **Periodicidade de Atualização** | Diária |
| **Categoria de Risco** | Administrativo |
| **Peso no Score** | Médio |

**Campos Disponíveis:**
- CNPJ da entidade
- Razão Social
- Motivo do impedimento
- Órgão responsável
- Convênio/Parceria relacionada
- Data do impedimento

---

## Fontes de Dados Climáticos e de Vulnerabilidade

### OD08 - Índice de Vulnerabilidade Climática Municipal

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Ministério do Meio Ambiente (MMA) / IBGE |
| **Descrição** | Indicadores de vulnerabilidade climática dos municípios brasileiros, considerando exposição a riscos como secas, enchentes e deslizamentos |
| **URL do Portal** | https://dados.gov.br |
| **API/Dados Abertos** | https://servicodados.ibge.gov.br/api |
| **Formato dos Dados** | JSON, CSV |
| **Periodicidade de Atualização** | Anual |
| **Categoria de Risco** | Climático |
| **Peso no Score** | Baixo (contextual) |

**Campos Disponíveis:**
- Código IBGE do município
- Nome do município
- UF
- Índice de vulnerabilidade (0-1)
- Tipo de risco predominante
- Exposição a eventos extremos

---

### OD09 - Atlas da Vulnerabilidade Social (IVS)

| Atributo | Descrição |
|----------|-----------|
| **Órgão Responsável** | Instituto de Pesquisa Econômica Aplicada (IPEA) |
| **Descrição** | Índice que sintetiza indicadores de vulnerabilidade social dos municípios brasileiros |
| **URL do Portal** | http://ivs.ipea.gov.br |
| **API/Dados Abertos** | http://ivs.ipea.gov.br/index.php/pt/planilha |
| **Formato dos Dados** | CSV, XLSX |
| **Periodicidade de Atualização** | Decenal (baseado no Censo) |
| **Categoria de Risco** | Social |
| **Peso no Score** | Baixo (contextual) |

**Campos Disponíveis:**
- Código IBGE do município
- Nome do município
- UF
- IVS Infraestrutura Urbana
- IVS Capital Humano
- IVS Renda e Trabalho
- IVS Geral

---

## Matriz de Prioridade de Integração

| Prioridade | Origem | Justificativa |
|------------|--------|---------------|
| 1 | OD01 - IBAMA Embargos | Dado crítico para avaliação ambiental, API disponível |
| 2 | OD02 - IBAMA Autuações | Dado crítico para avaliação ambiental, API disponível |
| 3 | OD04 - Lista Suja Trabalho Escravo | Impacto reputacional severo |
| 4 | OD05 - CEIS | Impedimento de contratar com governo |
| 5 | OD03 - ICMBio | Complemento dados ambientais |
| 6 | OD06 - CNEP | Sanções anticorrupção |
| 7 | OD07 - CEPIM | Específico para ONGs |
| 8 | OD08 - Vulnerabilidade Climática | Dado contextual para localização |
| 9 | OD09 - IVS | Dado contextual social |

---

## Especificação dos Tipos de Dados

Esta seção detalha a estrutura e tipos de dados esperados de cada origem, facilitando o mapeamento para o modelo interno da aplicação.

### TD01 - Dados de Embargo Ambiental (IBAMA)

```typescript
interface EmbargoIbama {
  numeroAutoInfracao: string;        // Ex: "9088888-E"
  cpfCnpj: string;                   // 11 ou 14 dígitos
  nomeRazaoSocial: string;           // Texto livre
  dataEmbargo: Date;                 // ISO 8601: "2024-03-15"
  dataDesembargo?: Date;             // Opcional, quando baixado
  areaEmbargada: number;             // Hectares (decimal)
  municipio: string;                 // Nome do município
  uf: string;                        // Sigla UF (2 caracteres)
  coordenadas?: {                    // Geolocalização opcional
    latitude: number;
    longitude: number;
  };
  bioma: string;                     // Ex: "Amazônia", "Cerrado"
  motivoEmbargo: string;             // Descrição da infração
  situacao: 'ATIVO' | 'BAIXADO';     // Status atual
  linkFonte: string;                 // URL para verificação
}
```

### TD02 - Dados de Autuação Ambiental (IBAMA)

```typescript
interface AutoInfracaoIbama {
  numeroAuto: string;                // Identificador único
  serieAuto: string;                 // Série do auto
  cpfCnpj: string;                   // 11 ou 14 dígitos
  nomeRazaoSocial: string;           // Nome do autuado
  dataAuto: Date;                    // Data da lavratura
  tipoInfracao: string;              // Código da infração
  descricaoInfracao: string;         // Texto descritivo
  enquadramentoLegal: string;        // Artigo/Lei infringida
  valorMulta: number;                // Valor em R$ (decimal)
  municipio: string;                 // Nome do município
  uf: string;                        // Sigla UF
  situacaoDebito: string;            // Status do débito
  quantidadeAnimais?: number;        // Para infrações fauna
  quantidadeProduto?: number;        // Para infrações flora
  unidadeMedida?: string;            // m³, unidade, etc.
  linkFonte: string;                 // URL para verificação
}
```

### TD03 - Dados de Infração ICMBio

```typescript
interface InfracaoIcmbio {
  numeroProcesso: string;            // Número do processo
  cpfCnpj: string;                   // Documento do infrator
  nomeRazaoSocial: string;           // Nome do infrator
  unidadeConservacao: string;        // Nome da UC afetada
  categoriaUC: string;               // Ex: "Parque Nacional"
  dataInfracao: Date;                // Data da ocorrência
  tipoInfracao: string;              // Classificação
  descricao: string;                 // Detalhes da infração
  valorMulta: number;                // Valor em R$
  situacao: string;                  // Status do processo
  municipio: string;                 // Localização
  uf: string;                        // UF
  linkFonte: string;                 // URL verificação
}
```

### TD04 - Dados da Lista Suja do Trabalho Escravo

```typescript
interface TrabalhoEscravo {
  cpfCnpj: string;                   // Documento empregador
  nomeRazaoSocial: string;           // Nome/Razão Social
  nomeEstabelecimento: string;       // Nome fantasia/local
  municipio: string;                 // Local da fiscalização
  uf: string;                        // UF
  cnae: string;                      // Código CNAE atividade
  descricaoAtividade: string;        // Atividade econômica
  dataInclusao: Date;                // Data entrada na lista
  dataFiscalizacao: Date;            // Data da ação fiscal
  quantidadeTrabalhadores: number;   // Nº resgatados (inteiro)
  decisaoAdministrativa: string;     // Referência decisão
  dataDecisao: Date;                 // Data da decisão
}
```

### TD05 - Dados do CEIS (Empresas Inidôneas)

```typescript
interface SancaoCeis {
  cpfCnpj: string;                   // Documento sancionado
  nomeRazaoSocial: string;           // Nome do sancionado
  nomeFantasia?: string;             // Nome fantasia
  tipoSancao: string;                // Ex: "Impedimento", "Suspensão"
  codigoSancao: string;              // Código interno
  fundamentacaoLegal: string;        // Base legal
  orgaoSancionador: string;          // Órgão que aplicou
  ufOrgao: string;                   // UF do órgão
  fonteInformacao: string;           // Origem do dado
  dataInicioSancao: Date;            // Início vigência
  dataFimSancao?: Date;              // Fim (se definido)
  dataPublicacao: Date;              // Data publicação oficial
  linkFonte: string;                 // URL verificação
}
```

### TD06 - Dados do CNEP (Empresas Punidas)

```typescript
interface SancaoCnep {
  cnpj: string;                      // CNPJ da empresa
  razaoSocial: string;               // Razão Social
  nomeFantasia?: string;             // Nome fantasia
  tipoSancao: string;                // Tipo da penalidade
  valorMulta?: number;               // Valor em R$ (se aplicável)
  orgaoSancionador: string;          // Órgão responsável
  ufOrgao: string;                   // UF do órgão
  dataInicioSancao: Date;            // Início vigência
  dataFimSancao?: Date;              // Fim vigência
  numeroProcesso?: string;           // Processo administrativo
  fundamentacaoLegal: string;        // Lei 12.846/2013
  linkFonte: string;                 // URL verificação
}
```

### TD07 - Dados do CEPIM (Entidades Impedidas)

```typescript
interface ImpedimentoCepim {
  cnpj: string;                      // CNPJ da entidade
  razaoSocial: string;               // Razão Social
  motivoImpedimento: string;         // Descrição do motivo
  orgaoSuperior: string;             // Órgão responsável
  convenioOrigem?: string;           // Convênio relacionado
  dataImpedimento: Date;             // Data do impedimento
  linkFonte: string;                 // URL verificação
}
```

### TD08 - Dados de Vulnerabilidade Climática

```typescript
interface VulnerabilidadeClimatica {
  codigoIbge: string;                // Código município (7 dígitos)
  nomeMunicipio: string;             // Nome do município
  uf: string;                        // UF
  indiceVulnerabilidade: number;     // 0 a 1 (decimal)
  classificacao: 'BAIXA' | 'MEDIA' | 'ALTA' | 'MUITO_ALTA';
  riscoSeca: number;                 // Índice 0-1
  riscoEnchente: number;             // Índice 0-1
  riscoDeslizamento: number;         // Índice 0-1
  riscoOndaCalor: number;            // Índice 0-1
  riscoPredominante: string;         // Tipo de risco principal
  populacaoExposta?: number;         // Estimativa população
  anoReferencia: number;             // Ano dos dados
}
```

### TD09 - Dados do IVS (Vulnerabilidade Social)

```typescript
interface IndiceVulnerabilidadeSocial {
  codigoIbge: string;                // Código município
  nomeMunicipio: string;             // Nome do município
  uf: string;                        // UF
  ivsGeral: number;                  // IVS consolidado (0-1)
  ivsInfraestruturaUrbana: number;   // Dimensão infraestrutura
  ivsCapitalHumano: number;          // Dimensão capital humano
  ivsRendaTrabalho: number;          // Dimensão renda/trabalho
  classificacao: 'MUITO_BAIXA' | 'BAIXA' | 'MEDIA' | 'ALTA' | 'MUITO_ALTA';
  anoReferencia: number;             // Ano censo/referência
  populacao?: number;                // População total
}
```

---

## Modelo de Dados Unificado

Para consolidação interna, os dados das diferentes fontes são mapeados para um modelo unificado:

```typescript
interface OcorrenciaConsolidada {
  id: string;                        // UUID interno
  origemDados: string;               // Código da fonte (OD01, OD02, etc.)
  categoria: 'AMBIENTAL' | 'TRABALHISTA' | 'ADMINISTRATIVO' | 'CLIMATICO' | 'SOCIAL';
  subcategoria: string;              // Ex: "EMBARGO", "AUTUACAO", "LISTA_SUJA"
  cpfCnpj: string;                   // Documento normalizado
  nomeRazaoSocial: string;           // Nome padronizado
  dataOcorrencia: Date;              // Data principal do registro
  descricao: string;                 // Descrição resumida
  situacao: string;                  // Status atual
  valorMonetario?: number;           // Multa/valor quando aplicável
  municipio?: string;                // Localização
  uf?: string;                       // UF
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  pesoScore: number;                 // Peso para cálculo (0-100)
  linkVerificacao: string;           // URL da fonte original
  dataConsulta: Date;                // Quando foi consultado
  dadosOriginais: object;            // JSON completo da fonte
}
```

---

## Considerações Técnicas

### Estratégia de Consulta

1. **Consultas Síncronas:** Para fontes com APIs rápidas (CEIS, CNEP), realizar consulta em tempo real.

2. **Consultas Assíncronas:** Para fontes sem API ou com tempo de resposta alto, considerar cache local com atualização periódica.

3. **Fallback:** Implementar mecanismo de fallback para quando uma fonte estiver indisponível, informando o usuário sobre a limitação.

### Cache e Atualização

- Dados do IBAMA e CGU: cache de 24 horas
- Lista Suja do Trabalho Escravo: cache de 7 dias (atualização semestral na fonte)
- Dados de Vulnerabilidade: cache de 30 dias (dados anuais/decenais)

### Tratamento de Erros

O sistema deve continuar funcionando mesmo que uma ou mais fontes estejam indisponíveis, informando ao usuário quais bases foram consultadas e quais apresentaram falha.

---

## Referências

- Portal de Dados Abertos do Governo Federal: https://dados.gov.br
- Portal da Transparência: https://portaldatransparencia.gov.br
- IBAMA Dados Abertos: https://dadosabertos.ibama.gov.br
- API IBGE: https://servicodados.ibge.gov.br
- IPEA Atlas IVS: http://ivs.ipea.gov.br
