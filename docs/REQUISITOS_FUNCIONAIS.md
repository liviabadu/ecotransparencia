# Requisitos Funcionais - EcoTransparência

## Introdução

Este documento especifica os requisitos funcionais do sistema EcoTransparência, detalhando cada funcionalidade, seus requisitos de dados associados, regras de execução e critérios de aceite. Os requisitos estão organizados seguindo o fluxo natural do sistema: Entrada, Processamento e Saída.

## Estrutura dos Requisitos

Cada requisito funcional é identificado por um código único no formato RF## e está associado a requisitos de dados (RD##) e regras de negócio (RN##). A prioridade indica a importância relativa do requisito para o funcionamento do sistema, sendo classificada como Alta, Média ou Baixa.

---

## Módulo de Entrada

O módulo de entrada compreende todas as funcionalidades relacionadas à captura de dados do usuário para iniciar o processo de consulta.

### RF01 - Pesquisar por Nome

O sistema deve permitir que o usuário pesquise uma entidade (pessoa física ou jurídica) pelo nome. A funcionalidade aceita nomes parciais e retorna resultados que correspondam ao termo buscado em qualquer uma das bases de dados integradas.

**Prioridade:** Alta

**Requisito de Dados Associado:** RD01

**Regra de Negócio:** RN01 - O termo de busca deve conter no mínimo 3 caracteres

**Critérios de Aceite:** O sistema deve aceitar o termo de busca digitado pelo usuário, validar que possui pelo menos 3 caracteres, executar a busca em todas as bases integradas, e retornar os resultados encontrados ou uma mensagem informando que nenhum resultado foi localizado.

---

### RF02 - Pesquisar por CPF/CNPJ

O sistema deve permitir que o usuário pesquise uma entidade através do número de CPF (para pessoas físicas) ou CNPJ (para pessoas jurídicas). Esta funcionalidade oferece resultados mais precisos que a busca por nome, pois utiliza um identificador único.

**Prioridade:** Alta

**Requisito de Dados Associado:** RD02

**Regra de Negócio:** RN02 - O sistema deve validar o formato e os dígitos verificadores do documento informado

**Critérios de Aceite:** O sistema deve aceitar CPF no formato XXX.XXX.XXX-XX ou apenas os 11 dígitos numéricos, aceitar CNPJ no formato XX.XXX.XXX/XXXX-XX ou apenas os 14 dígitos numéricos, validar os dígitos verificadores antes de executar a busca, e retornar mensagem de erro específica caso o documento seja inválido.

---

## Módulo de Processamento

O módulo de processamento engloba as funcionalidades que executam operações sobre os dados, incluindo consultas às bases externas e cálculo do score de risco.

### RF03 - Buscar Dados nas Bases Integradas

O sistema deve consultar automaticamente todas as bases de dados integradas quando uma pesquisa é iniciada. As bases consultadas incluem: Embargos e Autuações do IBAMA, Embargos e Autuações do ICMBio, Lista Suja do Trabalho Escravo (MTE), e Cadastro de Empresas Impedidas de Contratar com a Administração Pública.

**Prioridade:** Alta

**Requisito de Dados Associado:** RD03

**Regra de Negócio:** Nenhuma regra específica - funcionalidade automática

**Critérios de Aceite:** O sistema deve iniciar consultas paralelas a todas as bases integradas, consolidar os resultados em uma estrutura de dados unificada, tratar erros de conexão com bases específicas sem interromper consultas às demais, e informar ao usuário quando alguma base não estiver disponível.

---

### RF04 - Calcular Score de Risco

O sistema deve processar os dados encontrados e calcular um score de risco socioambiental e climático para a entidade consultada. O score é uma representação numérica que facilita a avaliação rápida do nível de risco.

**Prioridade:** Alta

**Requisito de Dados Associado:** RD04

**Regra de Negócio:** RN03 - O cálculo deve considerar pesos específicos para cada tipo de ocorrência

**Critérios de Aceite:** O sistema deve analisar todas as ocorrências encontradas, aplicar os pesos definidos para cada categoria de infração, calcular um score final na escala de 0 a 100, e categorizar o resultado em faixas de risco (Baixo, Médio, Alto, Crítico).

---

### RF06 - Comparar Scores entre Entidades

O sistema deve permitir que o usuário compare os scores de risco de múltiplas entidades simultaneamente, facilitando a análise comparativa para tomada de decisão.

**Prioridade:** Média

**Requisito de Dados Associado:** RD06

**Regra de Negócio:** Nenhuma regra específica

**Critérios de Aceite:** O sistema deve permitir selecionar até 5 entidades para comparação simultânea, exibir os scores e indicadores em formato de tabela comparativa, apresentar gráficos que facilitem a visualização das diferenças, e gerar o resultado da comparação em até 5 segundos.

---

## Módulo de Saída

O módulo de saída compreende as funcionalidades relacionadas à apresentação e exportação dos resultados processados.

### RF04 - Exibir Resultados Organizados

O sistema deve apresentar os dados encontrados de forma organizada e compreensível na interface do usuário. As informações devem ser agrupadas por categoria e ordenadas cronologicamente.

**Prioridade:** Alta

**Requisito de Dados Associado:** RD04

**Regra de Negócio:** RN04 - Os resultados devem ser agrupados por categoria e ordenados por data

**Critérios de Aceite:** Os dados devem ser exibidos agrupados por categoria (Ambiental IBAMA, Ambiental ICMBio, Trabalhista, Administrativo), cada registro deve exibir data da ocorrência, descrição, situação atual e fonte, os registros devem estar ordenados do mais recente para o mais antigo dentro de cada categoria, e informações detalhadas devem estar disponíveis através de links clicáveis.

---

### RF05 - Exportar e Compartilhar Resultados

O sistema deve permitir que o usuário exporte os resultados da consulta em diferentes formatos e compartilhe em plataformas externas.

**Prioridade:** Média

**Requisito de Dados Associado:** Nenhum

**Regra de Negócio:** RN05 - O documento exportado deve conter identificação da fonte e data da consulta

**Critérios de Aceite:** O sistema deve oferecer exportação em formato PDF para relatórios formais, oferecer exportação em formato Excel para análise de dados, permitir compartilhamento direto em redes sociais (LinkedIn, Twitter) e e-mail, e incluir cabeçalho com identificação da EcoTransparência, data/hora da consulta e aviso sobre origem pública dos dados.

---

### RF07 - Gerar Relatório Personalizado

O sistema deve permitir a geração de relatórios consolidados para múltiplas entidades, possibilitando análise em lote através de upload de arquivo.

**Prioridade:** Média

**Requisito de Dados Associado:** RD07

**Regra de Negócio:** Nenhuma regra específica

**Critérios de Aceite:** O usuário deve poder fazer upload de arquivo CSV ou Excel contendo lista de identificadores (nomes, CPFs ou CNPJs), o sistema deve processar cada entidade da lista e consolidar os resultados, o relatório gerado deve incluir score de risco, principais indicadores e visão geral de conformidade para cada entidade, e a saída deve estar disponível em formato PDF ou Excel.

---

### RF08 - Exibir Dashboard Interativo

O sistema deve oferecer um dashboard com visualizações interativas que facilitem o monitoramento de vulnerabilidades socioambientais por região.

**Prioridade:** Média

**Requisito de Dados Associado:** RD08

**Regra de Negócio:** Nenhuma regra específica

**Critérios de Aceite:** O dashboard deve exibir mapas com indicadores visuais (mapas de calor, ícones) para risco climático e socioambiental, deve permitir filtros por região, categoria de risco e período, as visualizações devem ser atualizadas quando novas informações forem carregadas, e a interface deve ser responsiva e otimizada para acesso em desktop.

---

## Requisitos de Dados

Esta seção detalha os dados utilizados por cada requisito funcional, especificando nome, obrigatoriedade, tipo e exemplos.

### RD01 - Dados de Pesquisa por Nome

Este requisito de dados suporta o RF01 - Pesquisar por Nome.

| Campo | Obrigatório | Tipo | Descrição | Exemplo |
|-------|-------------|------|-----------|---------|
| Nome | Sim | Caractere | Nome do ente a ser pesquisado (empresa ou pessoa física) | PETROBRAS |

O campo Nome aceita entrada livre do usuário e é utilizado para busca textual em todas as bases de dados integradas. A busca é case-insensitive e aceita correspondências parciais.

---

### RD02 - Dados de Pesquisa por CPF/CNPJ

Este requisito de dados suporta o RF02 - Pesquisar por CPF/CNPJ.

| Campo | Obrigatório | Tipo | Descrição | Exemplo |
|-------|-------------|------|-----------|---------|
| CPF | Condicional | Numérico | CPF da pessoa física (11 dígitos) | 123.456.789-00 |
| CNPJ | Condicional | Numérico | CNPJ da pessoa jurídica (14 dígitos) | 12.345.678/0001-00 |

O usuário deve informar CPF ou CNPJ, sendo obrigatório ao menos um dos campos. O sistema identifica automaticamente o tipo de documento com base na quantidade de dígitos informados.

---

### RD03 - Dados das Bases Integradas

Este requisito de dados suporta o RF03 - Buscar Dados nas Bases Integradas.

| Campo | Obrigatório | Tipo | Descrição | Exemplo |
|-------|-------------|------|-----------|---------|
| Fonte | Sim | Caractere | Identificação da base de origem | IBAMA - Embargos |
| Data Ocorrência | Sim | Data | Data do registro ou infração | 2024-03-15 |
| Descrição | Sim | Caractere | Descrição da ocorrência | Desmatamento em área protegida |
| Situação | Sim | Caractere | Status atual do registro | Ativo / Baixado |
| Identificador Original | Sim | Alfanumérico | Código do registro na base de origem | AUTO-2024-000123 |
| Link Fonte | Não | Caractere | URL para verificação na fonte original | https://servicos.ibama.gov.br/... |

---

### RD04 - Dados do Score de Risco

Este requisito de dados suporta o RF04 - Calcular Score de Risco e Exibir Resultados.

| Campo | Obrigatório | Tipo | Descrição | Exemplo |
|-------|-------------|------|-----------|---------|
| Score Total | Sim | Numérico | Pontuação de risco calculada (0-100) | 67 |
| Faixa de Risco | Sim | Caractere | Classificação categórica do risco | Alto |
| Qtd Ocorrências | Sim | Numérico | Total de registros encontrados | 5 |
| Score Ambiental | Sim | Numérico | Componente ambiental do score | 45 |
| Score Trabalhista | Sim | Numérico | Componente trabalhista do score | 15 |
| Score Administrativo | Sim | Numérico | Componente administrativo do score | 7 |

As faixas de risco são definidas da seguinte forma: Baixo (0-25), Médio (26-50), Alto (51-75) e Crítico (76-100).

---

### RD06 - Dados de Comparação

Este requisito de dados suporta o RF06 - Comparar Scores entre Entidades.

| Campo | Obrigatório | Tipo | Descrição | Exemplo |
|-------|-------------|------|-----------|---------|
| Lista de Entidades | Sim | Array | Entidades selecionadas para comparação | [Empresa A, Empresa B, Empresa C] |
| Scores Comparados | Sim | Array | Scores de cada entidade | [45, 67, 23] |
| Ranking | Sim | Array | Ordenação por score | [Empresa B, Empresa A, Empresa C] |

---

### RD07 - Dados de Relatório em Lote

Este requisito de dados suporta o RF07 - Gerar Relatório Personalizado.

| Campo | Obrigatório | Tipo | Descrição | Exemplo |
|-------|-------------|------|-----------|---------|
| Arquivo Upload | Sim | Arquivo | CSV ou Excel com lista de entidades | empresas.csv |
| Formato Saída | Sim | Caractere | Formato desejado do relatório | PDF |
| Incluir Detalhes | Não | Booleano | Se deve incluir detalhes de cada ocorrência | true |

---

### RD08 - Dados do Dashboard

Este requisito de dados suporta o RF08 - Exibir Dashboard Interativo.

| Campo | Obrigatório | Tipo | Descrição | Exemplo |
|-------|-------------|------|-----------|---------|
| Região Selecionada | Não | Caractere | Filtro por região geográfica | Sudeste |
| Categoria Risco | Não | Caractere | Filtro por tipo de risco | Ambiental |
| Período | Não | Data Range | Filtro por intervalo de datas | 2024-01-01 a 2024-12-31 |

---

## Histórias de Usuário

As histórias de usuário descrevem as funcionalidades na perspectiva do usuário final, facilitando a compreensão do valor entregue por cada requisito.

### História 1 - Consulta de Score para Investimento

**Como** um investidor interessado em avaliar riscos, **quero** consultar o score de risco socioambiental e climático de uma empresa, **para** avaliar o impacto de possíveis investimentos.

**Critérios de Aceite:** Informações detalhadas como listas de sanções ou relatórios de impacto devem estar disponíveis através de links clicáveis, e o resultado deve poder ser impresso ou enviado para outras plataformas.

---

### História 2 - Comparação de Cidades para Expansão

**Como** uma empresa interessada em expandir operações, **quero** comparar os scores de risco socioambiental e climático de diferentes cidades, **para** decidir onde é mais seguro e sustentável investir.

**Critérios de Aceite:** O sistema deve permitir selecionar múltiplas cidades para comparação direta, os scores e indicadores devem ser exibidos em gráficos claros e interativos, deve haver visão consolidada destacando os fatores de maior impacto em cada cidade, e o tempo para gerar a comparação deve ser inferior a 5 segundos.

---

### História 3 - Relatório para Alocação de Capital

**Como** um gestor financeiro, **quero** gerar um relatório consolidado de risco socioambiental para uma lista de empresas, **para** apoiar decisões estratégicas de alocação de capital.

**Critérios de Aceite:** O usuário pode fazer upload de lista em formato CSV ou Excel contendo os identificadores das empresas, o sistema deve gerar relatório consolidado em formato PDF ou Excel, o relatório deve incluir score de risco, principais indicadores e visão geral de conformidade com regulamentos ambientais, e deve ser possível imprimir ou enviar para outras plataformas.

---

### História 4 - Monitoramento via Dashboard

**Como** um analista de risco, **quero** visualizar dados de risco socioambiental em um dashboard interativo, **para** monitorar vulnerabilidades de cidades específicas.

**Critérios de Aceite:** O dashboard deve exibir mapas com indicadores visuais (calor ou ícones) para risco climático e socioambiental, deve ser possível filtrar os dados por região, categoria de risco ou data, as visualizações devem ser atualizadas em tempo real quando novas informações forem carregadas, e o sistema deve ser responsivo garantindo acesso otimizado em desktops.

---

## Matriz de Rastreabilidade

A matriz a seguir relaciona os objetivos específicos do sistema com as funcionalidades e requisitos funcionais correspondentes.

| Objetivo | Funcionalidades | Requisitos |
|----------|-----------------|------------|
| Consolidar dados públicos | F1, F2, F3 | RF01, RF02, RF03 |
| Calcular score de risco | F3, F4 | RF03, RF04 |
| Interface intuitiva | F4 | RF04 |
| Relatórios personalizados | F5, F7 | RF05, RF07 |
| Comparação entre entidades | F6, F8 | RF06, RF08 |
