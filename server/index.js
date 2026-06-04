/**
 * API compatível com src/app/services/api.service.ts
 * Rotas: GET /api/search/document, GET /api/search/name
 */
const express = require('express');
const MOCK_ENTITIES = require('./mock-data.js');
const { applyScoringToEntity } = require('./score-engine.js');
const { buildCnaeHintOccurrences } = require('./cnae-profile.js');

const PORT = parseInt(process.env.PORT, 10) || 3333;
/** IPv4 explícito: em Windows, `localhost` no proxy pode ir para ::1 e falhar se o servidor só escutar em IPv4. */
const HOST = process.env.HOST || '127.0.0.1';
const BRASIL_API_TIMEOUT_MS = 12_000;

const byStrippedDocument = new Map();
for (const entity of MOCK_ENTITIES) {
  const key = String(entity.document).replace(/\D/g, '');
  byStrippedDocument.set(key, entity);
}

function cloneEntity(e) {
  return JSON.parse(JSON.stringify(e));
}

function isValidCnpj(stripped) {
  if (stripped.length !== 14 || !/^\d+$/.test(stripped) || /^(\d)\1{13}$/.test(stripped)) {
    return false;
  }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(stripped[i], 10) * w1[i];
  let remainder = sum % 11;
  const d1 = remainder < 2 ? 0 : 11 - remainder;
  if (d1 !== parseInt(stripped[12], 10)) return false;
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(stripped[i], 10) * w2[i];
  remainder = sum % 11;
  const d2 = remainder < 2 ? 0 : 11 - remainder;
  return d2 === parseInt(stripped[13], 10);
}

function isValidCpf(stripped) {
  if (stripped.length !== 11 || !/^\d+$/.test(stripped) || /^(\d)\1{10}$/.test(stripped)) {
    return false;
  }
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(stripped[i], 10) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(stripped[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(stripped[i], 10) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(stripped[10], 10);
}

async function fetchBrasilApiCnpj(clean) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), BRASIL_API_TIMEOUT_MS);
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      signal: ac.signal,
      headers: { Accept: 'application/json' },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

/**
 * CNPJ válido fora do mock: nome na Receita (BrasilAPI) + ocorrências mínimas;
 * score e risco vêm do {@link applyScoringToEntity}.
 */
async function buildEntityFromBrasilApi(clean) {
  let res;
  try {
    res = await fetchBrasilApiCnpj(clean);
  } catch {
    return { found: false };
  }
  if (res.status === 404) {
    return { found: false };
  }
  if (!res.ok) {
    return { found: false };
  }
  const data = await res.json();
  const situacao = String(data.descricao_situacao_cadastral || '');
  const situacaoU = situacao.toUpperCase();
  if (/(BAIXADA|NULA|SUSPENS|INAPTA|INTERRUP)/.test(situacaoU)) {
    return {
      found: false,
      bloqueadoPorSituacaoCadastral: true,
      situacaoCadastral: {
        dataConsulta: new Date().toISOString(),
        mensagem:
          situacao ||
          'Situação cadastral na Receita Federal impede exibir o painel de transparência para esta entidade.',
        situacao: situacao || 'Irregular',
        valido: false,
      },
    };
  }

  const name =
    data.razao_social || data.nome_fantasia || `CNPJ ${clean}`;

  const metaOccurrence = {
    id: `cadastro-${clean}`,
    date: new Date().toISOString().slice(0, 10),
    description:
      'Cadastro ativo na Receita Federal (consulta BrasilAPI). Integrações com IBAMA, ICMBio, MTE e outras bases podem acrescentar ocorrências reais neste painel.',
    status: 'Baixado',
    source: 'Receita Federal (BrasilAPI)',
    category: 'Administrativo',
    location: {
      municipio: data.municipio || '—',
      uf: data.uf || '—',
    },
  };

  const occurrences = [metaOccurrence, ...buildCnaeHintOccurrences(data, clean)];

  const entity = {
    id: clean,
    name,
    document: clean,
    documentType: 'cnpj',
    score: 0,
    riskLevel: 'Baixo',
    occurrences,
  };
  applyScoringToEntity(entity);

  return {
    found: true,
    entity,
  };
}

async function searchByDocument(clean, type) {
  if (!clean || (type !== 'cnpj' && type !== 'cpf')) {
    return { found: false };
  }

  /** CNPJ válido só para demo local: simula bloqueio por situação cadastral (sem chamar Receita). */
  if (type === 'cnpj' && clean === '18236120000158') {
    return {
      found: false,
      bloqueadoPorSituacaoCadastral: true,
      situacaoCadastral: {
        dataConsulta: new Date().toISOString(),
        mensagem:
          'CNPJ de demonstração: situação cadastral irregular. Em produção, o texto viria da consulta à Receita Federal.',
        situacao: 'BAIXADA',
        valido: false,
      },
    };
  }

  const mockHit = byStrippedDocument.get(clean);
  if (mockHit && mockHit.documentType === type) {
    const entity = cloneEntity(mockHit);
    applyScoringToEntity(entity);
    return { found: true, entity };
  }

  if (type === 'cnpj') {
    if (!isValidCnpj(clean)) {
      return { found: false };
    }
    return buildEntityFromBrasilApi(clean);
  }

  if (type === 'cpf') {
    if (!isValidCpf(clean)) {
      return { found: false };
    }
    return { found: false };
  }

  return { found: false };
}

function searchByName(name) {
  const q = String(name || '')
    .trim()
    .toLowerCase();
  if (q.length < 3) {
    return { found: false };
  }
  const hit = MOCK_ENTITIES.find((e) => e.name.toLowerCase().includes(q));
  if (hit) {
    const entity = cloneEntity(hit);
    applyScoringToEntity(entity);
    return { found: true, entity };
  }
  return { found: false };
}

const app = express();

app.disable('x-powered-by');

app.get('/api/search/document', async (req, res) => {
  try {
    const document = req.query.document;
    const type = req.query.type;
    if (document == null || type == null) {
      res.status(400).json({ error: 'Parâmetros document e type são obrigatórios' });
      return;
    }
    const clean = String(document).replace(/\D/g, '');
    const result = await searchByDocument(clean, type);
    res.json(result);
  } catch (e) {
    console.error('[api/search/document]', e);
    res.status(500).json({ error: 'Erro interno ao consultar documento' });
  }
});

app.get('/api/search/name', (req, res) => {
  try {
    const name = req.query.name;
    if (name == null || String(name).trim() === '') {
      res.status(400).json({ error: 'Parâmetro name é obrigatório' });
      return;
    }
    res.json(searchByName(name));
  } catch (e) {
    console.error('[api/search/name]', e);
    res.status(500).json({ error: 'Erro interno ao consultar nome' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ecotransparencia-api' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Não encontrado', path: req.path });
});

app.listen(PORT, HOST, () => {
  console.log(`[ecotransparencia-api] http://${HOST}:${PORT}`);
  console.log(
    '[ecotransparencia-api] Deixe este terminal aberto. No front, use outro terminal com `npm start` ou rode tudo junto na raiz: `npm run dev`.',
  );
});
