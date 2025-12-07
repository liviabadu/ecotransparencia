# Requisitos de Negócio - EcoTransparência

## Introdução

Este documento define os requisitos de negócio que orientam o desenvolvimento da plataforma EcoTransparência. Os requisitos aqui descritos refletem as necessidades do mercado, as expectativas dos stakeholders e os objetivos estratégicos do produto.

## Objetivos Específicos do Sistema

O sistema EcoTransparência possui cinco objetivos específicos que direcionam todas as funcionalidades desenvolvidas.

O primeiro objetivo é **consolidar dados públicos de múltiplas fontes**. O sistema deve integrar informações de diferentes portais governamentais (IBAMA, ICMBio, MTE, Portal de Dados Abertos) em uma única interface, eliminando a necessidade de consultas manuais em múltiplos sites.

O segundo objetivo é **calcular um score de risco socioambiental e climático**. A plataforma deve processar os dados coletados e gerar uma pontuação que reflita o nível de risco associado a cada entidade consultada, considerando sanções ambientais, trabalhistas e administrativas.

O terceiro objetivo é **fornecer uma interface intuitiva e acessível**. A experiência do usuário deve ser simples o suficiente para que pessoas sem conhecimento técnico possam realizar consultas e interpretar os resultados.

O quarto objetivo é **permitir a geração de relatórios personalizados**. Usuários devem poder exportar as informações consultadas em formatos úteis para tomada de decisão, como PDF e Excel.

O quinto objetivo é **possibilitar a comparação entre entidades e regiões**. O sistema deve oferecer ferramentas para comparar scores e indicadores entre diferentes empresas ou municípios, auxiliando na análise comparativa.

## Regras de Negócio

As regras de negócio definem as restrições e políticas que o sistema deve seguir durante sua operação.

### RN01 - Validação de Consulta por Nome

Quando o usuário realizar uma pesquisa por nome, o sistema deve validar se o campo de busca contém pelo menos 3 caracteres antes de executar a consulta. Consultas com menos de 3 caracteres devem retornar uma mensagem orientando o usuário a fornecer mais informações.

### RN02 - Validação de CPF/CNPJ

O sistema deve validar o formato e os dígitos verificadores de CPF e CNPJ antes de processar a consulta. Para CPF, o formato esperado é XXX.XXX.XXX-XX (11 dígitos). Para CNPJ, o formato esperado é XX.XXX.XXX/XXXX-XX (14 dígitos). Documentos com formato inválido devem gerar mensagem de erro orientativa.

### RN03 - Cálculo do Score de Risco

O score de risco deve ser calculado com base em um algoritmo que considera os seguintes fatores: presença em lista de embargos do IBAMA, presença em lista de autuações do IBAMA ou ICMBio, inclusão na Lista Suja do Trabalho Escravo, registro no cadastro de empresas impedidas de contratar com a administração pública, e indicadores de vulnerabilidade climática da região de operação. Cada fator possui um peso específico na composição do score final, que é apresentado em uma escala de 0 a 100, onde valores mais altos indicam maior risco.

### RN04 - Formatação de Resultados

Os dados encontrados devem ser apresentados de forma organizada na tela, agrupados por categoria (ambiental, trabalhista, administrativa) e ordenados por data do mais recente para o mais antigo. Cada registro deve exibir a fonte original da informação e um link para verificação.

### RN05 - Compartilhamento e Exportação

O sistema deve permitir que os resultados de consulta sejam exportados em formato PDF ou Excel, e compartilhados em plataformas externas como redes sociais e e-mail. O documento exportado deve conter cabeçalho identificando a EcoTransparência como fonte, data e hora da consulta, e um aviso de que os dados são provenientes de fontes públicas governamentais.

## Fluxo de Processos

### Processo Atual (AS-IS)

O cenário atual de consulta a dados socioambientais é fragmentado e manual. Para obter informações completas sobre uma empresa, o usuário precisa realizar os seguintes passos em sequência:

Primeiro, acessa o portal do IBAMA para consultar embargos e autuações ambientais, inserindo filtros como nome da empresa ou CNPJ. Em seguida, acessa o portal do ICMBio para verificar processos administrativos e autos de infração relacionados. Depois, consulta o portal do Ministério do Trabalho para verificar a Lista Suja do Trabalho Escravo. Por fim, acessa o Portal de Dados Abertos para verificar se a empresa está impedida de contratar com a administração pública.

Cada etapa requer navegação em interfaces diferentes, com formatos de dados distintos. O usuário precisa então consolidar manualmente todas as informações em uma planilha ou relatório próprio, processo que é demorado e suscetível a erros.

### Processo Proposto (TO-BE)

O fluxo proposto com a EcoTransparência simplifica drasticamente esse processo. O usuário acessa a plataforma e realiza uma única consulta, informando nome ou CPF/CNPJ da entidade. O sistema automaticamente consulta todas as bases de dados integradas, consolida as informações encontradas, calcula o score de risco, e apresenta os resultados de forma organizada. O usuário pode então analisar os dados, gerar relatórios ou compartilhar os resultados conforme necessário.

## Usuários do Sistema

O sistema atende três perfis principais de usuários, cada um com necessidades e permissões específicas.

### Perfil Gerente

O gerente possui acesso completo a todas as funcionalidades do sistema. Pode realizar consultas, gerar relatórios, configurar parâmetros do sistema, gerenciar usuários e acessar estatísticas de uso. Este perfil é destinado a administradores da plataforma ou gestores de equipes que utilizam a ferramenta.

### Perfil Funcionário

O funcionário possui acesso às funcionalidades operacionais do sistema. Pode realizar consultas por nome ou CPF/CNPJ, visualizar resultados, gerar relatórios e exportar dados. Não possui acesso a configurações administrativas ou gestão de usuários.

### Perfil Cliente

O cliente representa usuários externos que acessam a plataforma para consultas pontuais. Possui acesso às funcionalidades básicas de consulta e visualização de resultados. Pode gerar relatórios simples, mas possui limitações em funcionalidades avançadas como comparação em lote ou dashboards personalizados.

## Fontes de Dados Integradas

A EcoTransparência integra dados das seguintes fontes governamentais oficiais:

### IBAMA - Embargos

O portal de consulta pública de áreas embargadas do IBAMA disponibiliza informações sobre áreas onde atividades foram suspensas devido a infrações ambientais. O acesso é feito através do endereço servicos.ibama.gov.br/ctf/publico/areasembargadas.

### IBAMA - Autuações

O mesmo portal disponibiliza consulta a autos de infração lavrados pelo órgão, detalhando infrações ambientais cometidas por pessoas físicas e jurídicas.

### ICMBio

O Instituto Chico Mendes de Conservação da Biodiversidade disponibiliza informações sobre processos administrativos e autos de infração relacionados a unidades de conservação federais através do portal icmbio.gov.br.

### Lista Suja do Trabalho Escravo

O Ministério do Trabalho e Emprego publica periodicamente a lista de empregadores que submeteram trabalhadores a condições análogas à escravidão. Essa lista é disponibilizada no portal gov.br/trabalho-e-emprego.

### Cadastro de Empresas Impedidas

O Portal de Dados Abertos do Governo Federal (dados.gov.br) disponibiliza o cadastro de empresas impedidas de contratar com a administração pública, incluindo motivo e período da sanção.

### Indicadores de Vulnerabilidade

Dados sobre vulnerabilidade climática e social de municípios são obtidos de fontes como o IBGE e o Ministério do Meio Ambiente, permitindo avaliar o risco associado à localização geográfica das entidades.

## Métricas de Sucesso

O sucesso da plataforma será medido pelos seguintes indicadores:

O primeiro indicador é o **tempo médio de consulta**, que deve ser inferior a 5 segundos para retornar resultados consolidados de todas as fontes. O segundo indicador é a **taxa de disponibilidade**, que deve ser de no mínimo 99,5% do tempo. O terceiro indicador é a **satisfação do usuário**, medida através de pesquisas de feedback, com meta de avaliação média superior a 4 em escala de 1 a 5. O quarto indicador é o **número de consultas mensais**, que demonstra a adoção da plataforma pelo mercado.
