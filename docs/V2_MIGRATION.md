# Migração para API V2 - EcoTransparência



## Resumo

O frontend foi atualizado para consumir a nova versão V2 da API do backend, que inclui informações detalhadas de ASG Score (Ambiental, Social, Governança) e ocorrências categorizadas.

## Principais Mudanças

### 1. Modelos de Dados (`entity.model.ts`)

**Novos tipos e interfaces:**

- `AsgScoreBreakdown`: Detalhamento da composição do score por fonte
  - `fonte`: Nome da fonte (ex: "Embargos IBAMA")
  - `peso`: Peso da fonte no cálculo
  - `quantidadeOcorrencias`: Número de ocorrências
  - `score`: Score base da fonte
  - `scorePonderado`: Score ajustado pelo peso

- `AsgScore`: Score ASG completo
  - `score`: Pontuação total
  - `riskLevel`: Nível de risco
  - `totalOcorrencias`: Total de ocorrências
  - `breakdown`: Array de detalhamento por fonte

- `Embargo`: Detalhes de embargos
  - `id`, `source`, `category`, `date`, `description`, `status`

- `AutoInfracao`: Detalhes de autos de infração
  - `id`, `source`, `data`, `descricao`, `numeroAuto`, `tipoInfracao`, `valorMulta`

- `Ocorrencias`: Agrupa embargos e autos de infração
  - `embargos`: Array de embargos
  - `autosInfracao`: Array de autos de infração

**Mudanças em tipos existentes:**

- `RiskLevel`: Agora aceita ambas variações (com e sem acento): 
  - `'Baixo' | 'Medio' | 'Médio' | 'Alto' | 'Critico' | 'Crítico'`

- `Occurrence`: Todos os campos exceto `id` e `source` são opcionais agora

- `Entity`: Novos campos opcionais adicionados:
  - `asgScore?: AsgScore`
  - `ocorrencias?: Ocorrencias`

### 2. API Service (`api.service.ts`)

**Atualizações:**

- Interfaces de resposta da API atualizadas para V2
- Mapeamento de `asgScore` e `ocorrencias` do backend
- Tratamento de campos opcionais
- Conversão de `riskLevel` string para tipo `RiskLevel`

### 3. Score Service (`score.service.ts`)

**Melhorias:**

- `getRiskColor()`: Agora normaliza o riskLevel para lowercase, suportando variações com e sem acento
- `calculateScoreResult()`: Atualizado para lidar com campos opcionais de `Occurrence`

### 4. Interface do Usuário

**Novos componentes visuais:**

#### ASG Score Card
- Exibe score ASG detalhado
- Mostra breakdown por fonte com:
  - Nome da fonte
  - Score e score ponderado
  - Número de ocorrências
  - Peso da fonte
  - Percentual do total

#### Embargos Section
- Lista detalhada de embargos
- Mostra: data, status, descrição, categoria, fonte
- Estilo visual diferenciado (vermelho)

#### Autos de Infração Section
- Lista detalhada de autos de infração
- Mostra: data, número do auto, descrição, tipo de infração, valor da multa, fonte
- Estilo visual diferenciado (laranja)

**Funções auxiliares adicionadas:**

- `formatCurrency()`: Formata valores monetários em BRL
- `getBreakdownPercentage()`: Calcula percentual de contribuição no score
- `formatDate()`: Atualizado para lidar com valores undefined

### 5. Estilos CSS (`search.css`)

**Novos estilos:**

- `.asg-score-card`: Card do ASG Score (azul)
- `.breakdown-*`: Estilos para breakdown do score
- `.embargos-*`: Estilos para seção de embargos (vermelho)
- `.autos-*`: Estilos para seção de autos de infração (laranja)
- Suporte para variações de riskLevel (medio/médio, critico/crítico)
- Responsividade para mobile

### 6. Testes Pact

**Atualização do contrato:**

- Consumer name alterado de `EcoTransparenciaFrontend` para `EcoTransparenciaFrontendV2`
- Novos matchers para campos V2:
  - `decimal()`: Para valores com casas decimais (peso, scorePonderado, valorMulta)
  - Suporte para novos objetos `asgScore` e `ocorrencias`
- Testes atualizados para validar estrutura V2
- Mantém compatibilidade com testes de não encontrado

## Compatibilidade

A implementação mantém **retrocompatibilidade** com a versão anterior da API:

- Campos V2 (`asgScore`, `ocorrencias`) são opcionais
- Se o backend não enviar esses campos, o sistema continua funcionando com `occurrences`
- Interface antiga permanece funcional

## Benefícios da V2

1. **Transparência Aumentada**: 
   - Usuários veem exatamente como o score é calculado
   - Breakdown mostra contribuição de cada fonte

2. **Informações Detalhadas**:
   - Embargos com descrições, datas e status
   - Autos de infração com valores de multa e tipos

3. **Separação de Categorias**:
   - Embargos e autos em seções distintas
   - Facilita análise específica

4. **Melhor UX**:
   - Visual mais rico e informativo
   - Códigos de cor por tipo de ocorrência
   - Formatação de moeda e datas

## Arquivos Modificados

- `src/app/models/entity.model.ts`
- `src/app/services/api.service.ts`
- `src/app/services/score.service.ts`
- `src/app/components/search/search.ts`
- `src/app/components/search/search.html`
- `src/app/components/search/search.css`
- `src/app/pact/api.service.pact.spec.ts`

## Novos Contratos Pact

- `pacts/EcoTransparenciaFrontendV2-EcoTransparenciaBackend.json`
- Mantém: `pacts/EcoTransparenciaFrontend-EcoTransparenciaBackend.json` (V1)

## Testes

✅ Todos os 157 testes passando
✅ 6 testes Pact V2 validados
✅ Build gerado com sucesso

## Próximos Passos

1. Deploy do frontend atualizado
2. Validação com backend V2 em ambiente de desenvolvimento
3. Testes de integração end-to-end
4. Considerar deprecação gradual da V1
