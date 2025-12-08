# Interface Atualizada - API V2

Este documento mostra a nova estrutura visual do EcoTransparência após integração com a API V2.

## Exemplo de Resultado de Busca

### 1. Informações da Entidade
```
Empresa Verde Sustentavel Ltda
CNPJ: 11222333000181
```

### 2. Score Card (Mantido da V1)
```
┌──────────────────────────────────────┐
│  45        Score de Risco            │
│            Escala: 0-100             │
│                                      │
│            [Medio]  Amarelo          │
└──────────────────────────────────────┘
```

### 3. **NOVO** ASG Score Detalhado
```
┌──────────────────────────────────────────────────────────┐
│  ASG Score Detalhado                                     │
├──────────────────────────────────────────────────────────┤
│  Score ASG: 45                                           │
│  Nível: Medio                                            │
│  Total de Ocorrências: 3                                 │
│                                                          │
│  Composição do Score:                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Embargos IBAMA                    Score: 30        │ │
│  │ Ocorrências: 2  | Peso: 0.5                        │ │
│  │ Score Ponderado: 15.0  | 33% do total              │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Autos de Infração IBAMA           Score: 20        │ │
│  │ Ocorrências: 1  | Peso: 0.35                       │ │
│  │ Score Ponderado: 7.0   | 16% do total              │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 4. **NOVO** Embargos (2)
```
┌──────────────────────────────────────────────────────────┐
│  Embargos (2)                                            │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │ 15/01/2024              [Baixado]                  │ │
│  │                                                    │ │
│  │ Embargo por desmatamento ilegal                    │ │
│  │                                                    │ │
│  │ Fonte: IBAMA          Ambiental IBAMA              │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 10/02/2024              [Ativo]                    │ │
│  │                                                    │ │
│  │ Embargo por uso irregular de área protegida        │ │
│  │                                                    │ │
│  │ Fonte: IBAMA          Ambiental IBAMA              │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 5. **NOVO** Autos de Infração (1)
```
┌──────────────────────────────────────────────────────────┐
│  Autos de Infração (1)                                   │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │ 20/02/2024              Nº ABCD1234                │ │
│  │                                                    │ │
│  │ Auto de infracao por exploração irregular          │ │
│  │                                                    │ │
│  │ Tipo: Fauna                                        │ │
│  │ Multa: R$ 25.000,00                                │ │
│  │                                                    │ │
│  │ Fonte: IBAMA                                       │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Cores e Estilo

### ASG Score Card
- **Cor de fundo**: Azul claro (#f0f9ff)
- **Borda**: Azul (#bae6fd)
- **Texto**: Azul escuro

### Breakdown Items
- **Borda esquerda**: Azul (#3b82f6)
- **Fundo**: Branco
- **Score badge**: Fundo azul claro

### Embargos
- **Cor principal**: Vermelho
- **Fundo**: #fef2f2
- **Borda esquerda**: #dc2626
- **Texto**: Tons de vermelho escuro

### Autos de Infração
- **Cor principal**: Laranja
- **Fundo**: #fff7ed
- **Borda esquerda**: #ea580c
- **Texto**: Tons de laranja escuro

## Responsividade

Em telas mobile (< 600px):
- Cards empilham verticalmente
- Headers de breakdown tornam-se coluna
- Detalhes de embargos/autos expandem verticalmente
- Botões ocupam largura total

## Campos Opcionais

Se algum campo não estiver disponível no backend:

- **Data**: Mostra "Data não informada"
- **Valor de multa**: Mostra "Não informado"
- **Campos vazios**: Não são exibidos

## Exemplo: Entidade com Risco Crítico

```
Mineradora Vermelha S.A.
CNPJ: 44555666000181

┌──────────────────────────────────────┐
│  92        Score de Risco            │
│            [Critico]  Vermelho       │
└──────────────────────────────────────┘

ASG Score: 92 | Nível: Critico | Total: 8 ocorrências

Composição:
- Embargos IBAMA: 4 ocorrências, Score 100, 54% do total
- Autos de Infração IBAMA: 4 ocorrências, Score 100, 54% do total

Embargos (4)
Autos de Infração (4)
```

## Melhorias de UX

1. **Transparência**: Usuário vê exatamente como o score é calculado
2. **Categorização**: Embargos separados de autos de infração
3. **Detalhamento**: Informações completas sobre cada ocorrência
4. **Visual**: Cores diferentes para cada tipo de informação
5. **Formatação**: Datas em PT-BR, valores em R$
6. **Acessibilidade**: Mantém estrutura semântica HTML

## Backward Compatibility

Se o backend V2 não enviar `asgScore` ou `ocorrencias`:
- Sistema continua funcionando normalmente
- Exibe apenas o score card e a lista de occurrences (V1)
- Não quebra a aplicação

## Performance

- CSS adicional: ~3.67 KB
- Bundle total mantido em ~272 KB
- Sem impacto significativo no tempo de carregamento
