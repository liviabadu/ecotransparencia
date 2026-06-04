# Relatório de Conformidade Socioambiental

Funcionalidade de **exportação (PDF) e impressão** do relatório de conformidade
socioambiental do portal Ecotransparência.

> HU: _"Como usuário do portal Ecotransparência, quero salvar e imprimir relatórios
> contendo informações sobre autuações ambientais, embargos, trabalho análogo à
> escravidão e demais ocorrências relacionadas às empresas consultadas."_

## Como funciona

O relatório é gerado **100% no cliente (browser)** a partir da `Entity` já obtida pela
busca — não exige novo endpoint de back-end.

- **Exportar PDF** → `html2canvas` rasteriza o documento e o `jsPDF` o pagina em folhas A4
  (retrato), disparando o download (`relatorio-conformidade-<cnpj>-<data>.pdf`).
- **Imprimir** → `window.print()`; a folha `@media print` (em `src/styles.css`) isola o
  documento (`.relatorio-print-root`) e oculta o resto da página, permitindo também
  "Salvar como PDF" pela caixa de impressão do navegador.

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `models/relatorio.model.ts` | View-model do relatório (deriva de `Entity`). |
| `services/relatorio-conformidade.service.ts` | Consolida a `Entity` em blocos por fonte oficial. |
| `services/pdf-export.service.ts` | Geração de PDF A4 multipágina no cliente. |
| `relatorio-conformidade.component.ts/.html/.css` | Documento "papel" + botões PDF/Imprimir. |
| `services/relatorio-conformidade.service.spec.ts` | Testes da consolidação. |

## Uso

```html
<app-relatorio-conformidade [entity]="searchResult()!.entity!" />
```

Já integrado em `components/search/search.html`: aparece ao final de um resultado de busca.

## Mapeamento dos Critérios de Aceite

| # | Critério | Onde |
| --- | --- | --- |
| 1 | Botão exportar PDF | `relatorio-conformidade.component.html` (botão "Exportar PDF") + `pdf-export.service.ts` |
| 2 | Opção de impressão | Botão "Imprimir" → `window.print()` + `@media print` em `src/styles.css` |
| 3 | Consolida ICMBio, MTE, IBAMA, Portal da Transparência | `relatorio-conformidade.service.ts` (`ORDEM_FONTES`, `montarBloco`) |
| 4 | Identificação da empresa + data/hora de geração | Cabeçalho do documento (`doc-header`, `doc-empresa`) |
| 5 | Lista autuações, embargos, trabalho escravo e demais restrições | `doc-bloco` / `doc-ocorrencias` |
| 6 | Formatação preservada e adequada a impressão/compartilhamento | Documento claro auto-contido + folha `@media print` |
| 7 | Mensagem explícita quando não há registros | Bloco `doc-vazio` (`semRegistros`) |

## UI e severidade

O documento usa layout de "papel" claro (independe do tema do portal) com:

- **Faixa-resumo (hero)** com o score de risco em destaque e o total de ocorrências.
- **Bases oficiais pesquisadas** sempre listadas (4), com status por base (verde = sem
  registro, âmbar = com ocorrências).
- **Cartões de ocorrência codificados por severidade** (`alta` = vermelho, `media` =
  âmbar, `baixa` = verde), definida no `RelatorioConformidadeService`.

## Tema do portal

O portal passou a usar **tema claro por padrão** (`ThemeService`, modo `light`), com
alternância claro/escuro/sistema restaurada no modal de Configurações (persistida em
`localStorage`). O documento do relatório é sempre claro, em qualquer tema.

## Dependências adicionadas

- `jspdf@^2.5.2`
- `html2canvas@^1.4.1`

## Testes

```bash
npm test -- --include='**/relatorio-conformidade/**/*.spec.ts' --no-watch
```
