/**
 * Indicadores derivados do CNAE (BrasilAPI) — não são autuações reais;
 * aumentam o score de forma transparente para setores historicamente mais supervisionados.
 */

const SECTOR_KEYWORDS = [
  { kw: 'MINERA', label: 'mineração' },
  { kw: 'PETRÓL', label: 'petróleo e combustíveis' },
  { kw: 'PETROL', label: 'petróleo e combustíveis' },
  { kw: 'QUÍM', label: 'indústria química' },
  { kw: 'QUIM', label: 'indústria química' },
  { kw: 'METAL', label: 'metalurgia' },
  { kw: 'MADEIR', label: 'madeira e florestal' },
  { kw: 'DEFEN', label: 'defensivos e agrotóxicos' },
  { kw: 'AGRO', label: 'agronegócio intensivo' },
  { kw: 'CONSTRU', label: 'construção civil' },
  { kw: 'SANEAMENT', label: 'saneamento e resíduos' },
  { kw: 'ENERG', label: 'geração de energia' },
];

/**
 * @param {object} brasilApiBody resposta JSON de /api/cnpj/v1/:cnpj
 * @param {string} cnpjDigits
 * @returns {object[]} ocorrências tipo ApiOccurrenceResponse (categoria Administrativo)
 */
function buildCnaeHintOccurrences(brasilApiBody, cnpjDigits) {
  const primary = String(brasilApiBody.cnae_fiscal_descricao || '').toUpperCase();
  const secondary = Array.isArray(brasilApiBody.cnaes_secundarios)
    ? brasilApiBody.cnaes_secundarios.map((x) => String(x?.descricao || '').toUpperCase()).join(' ')
    : '';
  const blob = `${primary} ${secondary}`;

  const hits = [];
  for (const { kw, label } of SECTOR_KEYWORDS) {
    if (blob.includes(kw)) hits.push(label);
  }
  if (hits.length === 0) return [];

  const unique = [...new Set(hits)];
  return [
    {
      id: `cnae-hint-${cnpjDigits}`,
      date: new Date().toISOString().slice(0, 10),
      description: `CNAE da empresa indica atividade em setor com maior histórico de fiscalização ambiental/trabalhista (${unique.join(
        ', ',
      )}). Indicador estatístico do motor de score — não equivale a infração.`,
      status: 'Ativo',
      source: 'Perfil CNAE (motor de score)',
      category: 'Administrativo',
    },
  ];
}

module.exports = { buildCnaeHintOccurrences };
