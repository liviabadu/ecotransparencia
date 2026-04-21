/**
 * Motor de score socioambiental (backend).
 * Faixas de risco alinhadas ao ScoreService do Angular:
 * Baixo ≤25, Médio 26–50, Alto 51–75, Crítico ≥76.
 */

const CATEGORY_BASE = {
  'Ambiental IBAMA': 22,
  'Ambiental ICMBio': 22,
  Trabalhista: 12,
  Administrativo: 5,
};

const STATUS_MULT = {
  Ativo: 1.12,
  Lavrado: 1.0,
  Baixado: 0.72,
};

function parseOccurrenceDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function recencyMultiplier(date) {
  const d = parseOccurrenceDate(date);
  if (!d) return 1;
  const days = (Date.now() - d.getTime()) / 86400000;
  if (days > 1000) return 0.88;
  if (days > 550) return 0.95;
  return 1;
}

function pointsForOccurrence(occ) {
  const cat = occ.category || 'Administrativo';
  const base = CATEGORY_BASE[cat] ?? CATEGORY_BASE.Administrativo;
  const status = occ.status || 'Ativo';
  const sm = STATUS_MULT[status] ?? 1;
  const rm = recencyMultiplier(occ.date);
  return base * sm * rm;
}

/**
 * Soma ponderada das ocorrências, teto 100.
 * Com muitas ocorrências, reduz o peso marginal (evita saturação em 100 com listas longas).
 * @param {Array<{ category?: string, status?: string, date?: string }>} occurrences
 */
function computeScoreFromOccurrences(occurrences) {
  if (!occurrences || occurrences.length === 0) return 0;
  let sum = 0;
  for (const occ of occurrences) {
    sum += pointsForOccurrence(occ);
  }
  const n = occurrences.length;
  /* Listas longas (muitas autuações): compressão mais forte. Poucas ocorrências mas soma alta: compressão média. */
  if (sum > 48 && n >= 6) {
    const extra = sum - 48;
    const div = 1 + 0.023 * n * n;
    sum = 48 + extra / div;
  } else if (sum > 70 && n >= 4) {
    const extra = sum - 48;
    const div = 1 + 0.038 * n * n;
    sum = 48 + extra / div;
  }
  return Math.min(100, Math.round(sum));
}

/**
 * @param {number} score
 * @returns {'Baixo'|'Médio'|'Alto'|'Crítico'}
 */
function riskLevelFromScore(score) {
  const s = Math.min(100, Math.max(0, score));
  if (s <= 25) return 'Baixo';
  if (s <= 50) return 'Médio';
  if (s <= 75) return 'Alto';
  return 'Crítico';
}

/**
 * Atualiza score e riskLevel a partir das ocorrências (ignora valores anteriores).
 * @param {object} entity
 */
function applyScoringToEntity(entity) {
  if (!entity || !Array.isArray(entity.occurrences)) return entity;
  const score = computeScoreFromOccurrences(entity.occurrences);
  entity.score = score;
  entity.riskLevel = riskLevelFromScore(score);
  return entity;
}

module.exports = {
  computeScoreFromOccurrences,
  riskLevelFromScore,
  applyScoringToEntity,
  pointsForOccurrence,
};
