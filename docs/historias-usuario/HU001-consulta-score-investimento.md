# HU001 - Consulta de Score para Investimento

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **ID** | HU001 |
| **Título** | Consulta de Score para Investimento |
| **Prioridade** | Alta |
| **Sprint** | 1 |
| **Status** | A Fazer |
| **Data de Criação** | 2025-12-07 |

## Descrição

**Como** um investidor interessado em avaliar riscos,
**Quero** consultar o score de risco socioambiental e climático de uma empresa,
**Para** avaliar o impacto de possíveis investimentos antes de tomar decisões financeiras.

## Contexto

Esta é a funcionalidade central da plataforma EcoTransparência. Permite que usuários realizem consultas sobre entidades (pessoas físicas ou jurídicas) e obtenham um score consolidado de risco baseado em dados públicos de múltiplas fontes governamentais.

## Requisitos Relacionados

- **RF01** - Pesquisar por Nome
- **RF02** - Pesquisar por CPF/CNPJ
- **RF03** - Buscar Dados nas Bases Integradas
- **RF04** - Calcular Score de Risco e Exibir Resultados
- **RN01** - Validação de Consulta por Nome (mínimo 3 caracteres)
- **RN02** - Validação de CPF/CNPJ (formato e dígitos verificadores)
- **RN03** - Cálculo do Score de Risco
- **RN04** - Formatação de Resultados

## Critérios de Aceitação

### CA01 - Campo de Busca Visível
O sistema deve exibir um campo de busca visível e acessível na página principal, permitindo que o usuário digite o termo de pesquisa (nome, CPF ou CNPJ).

### CA02 - Validação de Nome com Mínimo de Caracteres
Quando o usuário digitar um termo de busca por nome com menos de 3 caracteres e tentar pesquisar, o sistema deve exibir uma mensagem de erro orientativa informando que são necessários pelo menos 3 caracteres.

### CA03 - Validação de Formato de CPF
Quando o usuário informar um CPF, o sistema deve aceitar tanto o formato com máscara (XXX.XXX.XXX-XX) quanto apenas os 11 dígitos numéricos, e validar os dígitos verificadores antes de processar a consulta.

### CA04 - Validação de Formato de CNPJ
Quando o usuário informar um CNPJ, o sistema deve aceitar tanto o formato com máscara (XX.XXX.XXX/XXXX-XX) quanto apenas os 14 dígitos numéricos, e validar os dígitos verificadores antes de processar a consulta.

### CA05 - Mensagem de Erro para Documento Inválido
Quando o usuário informar um CPF ou CNPJ com dígitos verificadores inválidos, o sistema deve exibir uma mensagem de erro específica indicando que o documento é inválido.

### CA06 - Identificação Automática do Tipo de Documento
O sistema deve identificar automaticamente se o usuário está pesquisando por nome, CPF ou CNPJ com base no conteúdo digitado (quantidade de dígitos e formato).

### CA07 - Exibição do Score de Risco
Após uma consulta bem-sucedida, o sistema deve exibir o score de risco calculado em uma escala de 0 a 100, com indicação visual clara da faixa de risco (Baixo: 0-25, Médio: 26-50, Alto: 51-75, Crítico: 76-100).

### CA08 - Organização dos Resultados por Categoria
Os dados encontrados devem ser apresentados agrupados por categoria: Ambiental IBAMA, Ambiental ICMBio, Trabalhista e Administrativo.

### CA09 - Ordenação Cronológica dos Resultados
Dentro de cada categoria, os registros devem estar ordenados do mais recente para o mais antigo.

### CA10 - Detalhes de Cada Ocorrência
Cada registro exibido deve conter: data da ocorrência, descrição, situação atual (Ativo/Baixado) e identificação da fonte.

### CA11 - Links para Fontes Originais
Cada registro deve incluir um link clicável que direcione para a fonte original da informação para verificação.

### CA12 - Mensagem para Nenhum Resultado
Quando a consulta não retornar nenhum resultado, o sistema deve exibir uma mensagem informativa indicando que nenhum registro foi encontrado para a entidade pesquisada.

### CA13 - Feedback Visual Durante Processamento
Durante o processamento da consulta, o sistema deve exibir um indicador de carregamento informando que a busca está em andamento.

### CA14 - Funcionamento com Dados Mockados
Enquanto não houver back-end implementado, o sistema deve funcionar com dados mockados que simulem o comportamento real das consultas.

## Cenários de Teste

### Funcionalidade: Consulta de Score de Risco Socioambiental

---

#### Cenário: CT01 - Pesquisa por nome válido com resultados encontrados

**Dado** que o usuário está na página de consulta
**E** existe uma entidade cadastrada com o nome "Empresa Teste Ltda"
**Quando** o usuário digita "Empresa Teste" no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve exibir o score de risco da entidade
**E** os resultados devem estar organizados por categoria
**E** cada resultado deve conter data, descrição, situação e fonte

---

#### Cenário: CT02 - Pesquisa por nome com menos de 3 caracteres

**Dado** que o usuário está na página de consulta
**Quando** o usuário digita "AB" no campo de busca
**E** tenta realizar a pesquisa
**Então** o sistema deve exibir a mensagem "Informe pelo menos 3 caracteres para realizar a busca"
**E** a pesquisa não deve ser executada

---

#### Cenário: CT03 - Pesquisa por CPF válido com máscara

**Dado** que o usuário está na página de consulta
**E** existe uma pessoa física cadastrada com CPF "123.456.789-09"
**Quando** o usuário digita "123.456.789-09" no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve identificar automaticamente que é um CPF
**E** deve exibir o score de risco da pessoa física

---

#### Cenário: CT04 - Pesquisa por CPF válido sem máscara

**Dado** que o usuário está na página de consulta
**E** existe uma pessoa física cadastrada com CPF "12345678909"
**Quando** o usuário digita "12345678909" no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve identificar automaticamente que é um CPF
**E** deve exibir o score de risco da pessoa física

---

#### Cenário: CT05 - Pesquisa por CPF com dígitos verificadores inválidos

**Dado** que o usuário está na página de consulta
**Quando** o usuário digita "123.456.789-00" no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve exibir a mensagem "CPF inválido. Verifique os dígitos informados."
**E** a pesquisa não deve ser executada

---

#### Cenário: CT06 - Pesquisa por CNPJ válido com máscara

**Dado** que o usuário está na página de consulta
**E** existe uma empresa cadastrada com CNPJ "12.345.678/0001-95"
**Quando** o usuário digita "12.345.678/0001-95" no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve identificar automaticamente que é um CNPJ
**E** deve exibir o score de risco da empresa

---

#### Cenário: CT07 - Pesquisa por CNPJ válido sem máscara

**Dado** que o usuário está na página de consulta
**E** existe uma empresa cadastrada com CNPJ "12345678000195"
**Quando** o usuário digita "12345678000195" no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve identificar automaticamente que é um CNPJ
**E** deve exibir o score de risco da empresa

---

#### Cenário: CT08 - Pesquisa por CNPJ com dígitos verificadores inválidos

**Dado** que o usuário está na página de consulta
**Quando** o usuário digita "12.345.678/0001-00" no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve exibir a mensagem "CNPJ inválido. Verifique os dígitos informados."
**E** a pesquisa não deve ser executada

---

#### Cenário: CT09 - Exibição de score na faixa Baixo

**Dado** que o usuário realizou uma consulta válida
**Quando** o score calculado é 20
**Então** o sistema deve exibir o valor "20"
**E** deve indicar visualmente a faixa "Baixo"
**E** a cor do indicador deve ser verde

---

#### Cenário: CT10 - Exibição de score na faixa Médio

**Dado** que o usuário realizou uma consulta válida
**Quando** o score calculado é 40
**Então** o sistema deve exibir o valor "40"
**E** deve indicar visualmente a faixa "Médio"
**E** a cor do indicador deve ser amarela

---

#### Cenário: CT11 - Exibição de score na faixa Alto

**Dado** que o usuário realizou uma consulta válida
**Quando** o score calculado é 65
**Então** o sistema deve exibir o valor "65"
**E** deve indicar visualmente a faixa "Alto"
**E** a cor do indicador deve ser laranja

---

#### Cenário: CT12 - Exibição de score na faixa Crítico

**Dado** que o usuário realizou uma consulta válida
**Quando** o score calculado é 85
**Então** o sistema deve exibir o valor "85"
**E** deve indicar visualmente a faixa "Crítico"
**E** a cor do indicador deve ser vermelha

---

#### Cenário: CT13 - Resultados ordenados cronologicamente dentro de cada categoria

**Dado** que o usuário realizou uma consulta válida
**E** existem múltiplos registros na categoria "Ambiental IBAMA"
**Quando** os resultados são exibidos
**Então** os registros da categoria "Ambiental IBAMA" devem estar ordenados do mais recente para o mais antigo

---

#### Cenário: CT14 - Nenhum resultado encontrado

**Dado** que o usuário está na página de consulta
**Quando** o usuário digita "Entidade Inexistente XYZ" no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve exibir a mensagem "Nenhum registro encontrado para a entidade pesquisada"
**E** o score não deve ser exibido

---

#### Cenário: CT15 - Indicador de carregamento durante a consulta

**Dado** que o usuário está na página de consulta
**Quando** o usuário digita um termo válido no campo de busca
**E** clica no botão de pesquisar
**Então** o sistema deve exibir um indicador de carregamento
**E** o indicador deve desaparecer quando os resultados forem carregados

---

#### Cenário: CT16 - Link para fonte original funcional

**Dado** que o usuário realizou uma consulta válida
**E** existem resultados exibidos
**Quando** o usuário clica no link da fonte de um registro
**Então** o link deve direcionar para a URL da fonte original

---

#### Cenário: CT17 - Campo de busca vazio

**Dado** que o usuário está na página de consulta
**Quando** o campo de busca está vazio
**E** o usuário clica no botão de pesquisar
**Então** o sistema deve exibir a mensagem "Informe um nome, CPF ou CNPJ para realizar a busca"
**E** a pesquisa não deve ser executada

---

#### Cenário: CT18 - Exibição de componentes do score

**Dado** que o usuário realizou uma consulta válida com resultados
**Quando** os resultados são exibidos
**Então** o sistema deve mostrar o score total
**E** deve mostrar a quantidade de ocorrências encontradas
**E** deve mostrar o detalhamento por categoria (ambiental, trabalhista, administrativo)

## Dados de Teste (Mock)

Para os testes automatizados, utilizar os seguintes dados mockados:

### Entidade com Score Baixo
- **Nome:** Empresa Verde Sustentável Ltda
- **CNPJ:** 11.222.333/0001-81
- **Score:** 15 (Baixo)
- **Ocorrências:** 1 registro ambiental baixado

### Entidade com Score Médio
- **Nome:** Indústria Amarela S.A.
- **CNPJ:** 22.333.444/0001-72
- **Score:** 42 (Médio)
- **Ocorrências:** 2 registros ambientais ativos

### Entidade com Score Alto
- **Nome:** Construtora Laranja Ltda
- **CNPJ:** 33.444.555/0001-63
- **Score:** 68 (Alto)
- **Ocorrências:** 3 registros ambientais + 1 trabalhista

### Entidade com Score Crítico
- **Nome:** Mineradora Vermelha S.A.
- **CNPJ:** 44.555.666/0001-54
- **Score:** 89 (Crítico)
- **Ocorrências:** 5 registros ambientais + 2 trabalhistas + 1 administrativo

### Pessoa Física para Teste
- **Nome:** João da Silva Teste
- **CPF:** 123.456.789-09
- **Score:** 35 (Médio)
- **Ocorrências:** 1 registro ambiental

## Notas de Implementação

1. **Sem back-end:** Esta história deve ser implementada utilizando dados mockados no front-end até que o back-end esteja disponível.

2. **Serviço de Mock:** Criar um serviço Angular que simule as respostas da API, facilitando a futura integração com o back-end real.

3. **Validações:** Todas as validações de CPF e CNPJ devem ser realizadas no front-end, incluindo verificação dos dígitos verificadores.

4. **Acessibilidade:** Garantir que o campo de busca e os resultados sejam acessíveis via teclado e leitores de tela.

## Definição de Pronto

- [ ] Todos os critérios de aceitação foram atendidos
- [ ] Todos os cenários de teste foram automatizados e estão passando
- [ ] Código revisado por pelo menos um membro da equipe
- [ ] Interface responsiva para desktop
- [ ] Sem erros no console do navegador
- [ ] Documentação do componente atualizada
