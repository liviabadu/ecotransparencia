# Metodologia de Cálculo de Score - EcoTransparência

## Introdução

Este documento descreve a metodologia utilizada pela plataforma EcoTransparência para calcular o score de risco socioambiental das entidades consultadas. O score é uma medida quantitativa que reflete o nível de exposição a riscos ambientais, trabalhistas e administrativos de uma empresa ou pessoa física.

## Escala de Score

O score de risco é apresentado em uma escala de **0 a 100 pontos**, onde valores mais altos indicam maior risco. A escala é dividida em quatro níveis de risco:

| Faixa de Score | Nível de Risco | Cor Indicativa |
|----------------|----------------|----------------|
| 0 - 25         | Baixo          | Verde          |
| 26 - 50        | Médio          | Amarelo        |
| 51 - 75        | Alto           | Laranja        |
| 76 - 100       | Crítico        | Vermelho       |

### Interpretação dos Níveis

**Baixo (0-25):** A entidade apresenta pouco ou nenhum registro de ocorrências nas bases de dados consultadas. Indica um histórico positivo de conformidade socioambiental.

**Médio (26-50):** A entidade possui algumas ocorrências registradas, porém de menor gravidade ou já regularizadas. Recomenda-se atenção e monitoramento.

**Alto (51-75):** A entidade apresenta múltiplas ocorrências ativas ou de maior gravidade. Indica necessidade de avaliação detalhada antes de decisões de negócio.

**Crítico (76-100):** A entidade possui histórico grave de infrações, com múltiplas ocorrências ativas em diferentes categorias. Alto risco para operações comerciais e financeiras.

## Fontes de Dados e Categorias

O score é calculado a partir de dados consolidados de múltiplas fontes governamentais oficiais, organizadas nas seguintes categorias:

### 1. Ambiental IBAMA

Dados provenientes do Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis:
- **Embargos:** Áreas onde atividades foram suspensas devido a infrações ambientais
- **Autos de Infração:** Multas e penalidades por descumprimento de legislação ambiental

### 2. Ambiental ICMBio

Dados do Instituto Chico Mendes de Conservação da Biodiversidade:
- Processos administrativos relacionados a unidades de conservação
- Autos de infração em áreas protegidas

### 3. Trabalhista

Dados do Ministério do Trabalho e Emprego:
- Inclusão na Lista Suja do Trabalho Escravo
- Autuações por condições de trabalho degradantes

### 4. Administrativo

Dados do Portal de Dados Abertos do Governo Federal:
- Cadastro de empresas impedidas de contratar com a administração pública
- Sanções administrativas vigentes

## Metodologia de Cálculo

### Composição do Score ASG

O score ASG (Ambiental, Social e Governança) é calculado considerando:

1. **Quantidade de Ocorrências:** Número total de registros encontrados em cada fonte
2. **Peso da Fonte:** Cada fonte de dados possui um peso específico na composição do score
3. **Score por Fonte:** Pontuação calculada com base na quantidade e gravidade das ocorrências
4. **Score Ponderado:** Score da fonte multiplicado pelo seu peso

A fórmula geral do score ponderado é:

```
Score Ponderado = Score da Fonte × Peso da Fonte
```

O score final é a soma dos scores ponderados de todas as fontes, normalizado para a escala de 0 a 100.

### Fatores Considerados

Para cada ocorrência, são considerados os seguintes fatores quando disponíveis:

- **Data da Ocorrência:** Ocorrências mais recentes têm maior impacto
- **Status:** Ocorrências ativas pesam mais que regularizadas (Baixado)
- **Gravidade:** Quando informada, influencia diretamente o score
- **Área Afetada:** Para embargos, a extensão da área embargada é considerada
- **Valor da Multa:** Para autos de infração, valores maiores indicam maior gravidade
- **Bioma:** Infrações em biomas protegidos (Amazônia, Mata Atlântica) podem ter peso adicional

### Ordenação e Agrupamento

Os resultados são apresentados seguindo as regras:

1. **Agrupamento por Categoria:** Ocorrências são agrupadas nas quatro categorias principais
2. **Ordem de Categorias:** Ambiental IBAMA → Ambiental ICMBio → Trabalhista → Administrativo
3. **Ordenação Cronológica:** Dentro de cada categoria, as ocorrências são ordenadas da mais recente para a mais antiga

## Detalhamento do Score (Breakdown)

O sistema fornece um detalhamento do score mostrando a contribuição de cada fonte:

| Campo                  | Descrição                                          |
|------------------------|---------------------------------------------------|
| `fonte`                | Nome da fonte de dados                            |
| `peso`                 | Peso da fonte na composição do score              |
| `quantidadeOcorrencias`| Número de ocorrências encontradas nesta fonte     |
| `score`                | Score bruto da fonte                              |
| `scorePonderado`       | Score multiplicado pelo peso                      |

O percentual de contribuição de cada fonte pode ser calculado como:

```
Percentual = (Score Ponderado / Score Total) × 100
```

## Limitações e Considerações

### Dados Públicos

O score é calculado exclusivamente com base em dados públicos disponíveis em portais governamentais. Informações não publicadas ou em sigilo não são consideradas.

### Atualização

Os dados são atualizados periodicamente conforme a disponibilidade das fontes oficiais. A data da consulta deve ser considerada ao interpretar os resultados.

### Uso Recomendado

O score deve ser utilizado como uma ferramenta de apoio à decisão, não como único critério. Recomenda-se sempre:

1. Verificar os detalhes das ocorrências individualmente
2. Consultar as fontes originais através dos links fornecidos
3. Considerar o contexto e a evolução temporal das ocorrências
4. Buscar informações complementares quando necessário

## Exemplo de Cálculo

Considere uma empresa com as seguintes ocorrências:

| Fonte          | Ocorrências | Peso | Score Fonte | Score Ponderado |
|----------------|-------------|------|-------------|-----------------|
| IBAMA          | 2           | 0.4  | 30          | 12              |
| ICMBio         | 1           | 0.3  | 20          | 6               |
| Trabalhista    | 0           | 0.2  | 0           | 0               |
| Administrativo | 1           | 0.1  | 25          | 2.5             |

**Score Final:** 12 + 6 + 0 + 2.5 = **20.5** → Nível de Risco: **Baixo**

## Referências

- [RN03 - Cálculo do Score de Risco](./REQUISITOS_NEGOCIO.md)
- [Requisitos Funcionais](./REQUISITOS_FUNCIONAIS.md)
- [Origens de Dados](./ORIGENS_DADOS.md)

---

*Documento atualizado em: Dezembro de 2025*
