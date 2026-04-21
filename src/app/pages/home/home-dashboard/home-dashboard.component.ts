import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Search } from '../../../components/search/search';
import { AuthService } from '../../../services/auth.service';
import { DocumentValidationService } from '../../../services/document-validation.service';
import { DashboardRecentSearchesOpenerService } from '../../../services/dashboard-recent-searches-opener.service';
import { LogoutDialogService } from '../../../services/logout-dialog.service';
import { HomeScrollStory } from '../home-scroll-story';
import { RiskLevel, SearchResult } from '../../../models/entity.model';
import { environment } from '../../../../environments/environment';

const RECENT_SEARCHES_STORAGE_KEY = 'ecotransparencia:dash-recent-searches:v1';
/** Máximo de pesquisas guardadas (localStorage); o modal mostra 10 por página. */
const MAX_RECENT_SEARCHES = 300;
/** Quantas entradas aparecem no cartão “Últimas pesquisas” antes de abrir o histórico completo. */
const RECENT_SEARCHES_CARD_PREVIEW = 3;
const RECENT_HISTORY_PAGE_SIZE = 10;
/** Margem após animação de saída do modal de histórico (painel ~220ms). */
const RECENT_HISTORY_EXIT_FALLBACK_MS = 300;

const SCORE_SNAPSHOT_STORAGE_KEY = 'ecotransparencia:dash-entity-score-snap:v1';
const ALERTS_STORAGE_KEY = 'ecotransparencia:dash-alerts:v1';
const MAX_RECENT_ALERTS = 20;
/** Score mínimo (exclusive) para entrar em “Empresas com maior risco recente”. */
const HIGH_RISK_RECENT_SCORE_THRESHOLD = 70;
const HIGH_RISK_RECENT_MAX_ROWS = 10;

const FAVORITES_STORAGE_KEY = 'ecotransparencia:dash-favorites:v1';
const MAX_DASH_FAVORITES = 80;

export interface DashFavoriteEntry {
  cnpj: string;
  label: string;
}

export interface DashRecentSearchRow {
  cnpj: string;
  label: string;
  /** Score de risco 0–100 quando a consulta devolveu empresa analisada. */
  score?: number;
}

/** Linha no cartão “maior risco recente” (derivada de pesquisas recentes). */
export interface DashRecentHighRiskRow {
  cnpj: string;
  line: string;
}

/** Último score/risco visto por CNPJ (para detectar mudança na próxima pesquisa). */
export interface DashScoreSnapshot {
  score: number;
  risk: string;
}

export interface DashRecentAlert {
  id: string;
  message: string;
  at: number;
}

/**
 * Painel pós-login: busca, visão geral e insights.
 * Efeitos de entrada ao abrir — {@link HomeScrollStory} em modo reveal-all (sem scroll até o fim).
 */
@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [RouterLink, Search],
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css', '../home-scroll-story.css'],
})
export class HomeDashboard implements AfterViewInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly logoutDialog = inject(LogoutDialogService);
  private readonly zone = inject(NgZone);
  private readonly documentValidation = inject(DocumentValidationService);
  private readonly recentHistoryShellOpener = inject(DashboardRecentSearchesOpenerService);
  private lastProcessedShellOpenNonce = 0;

  @ViewChild('storyHost', { read: ElementRef }) private storyHost?: ElementRef<HTMLElement>;
  @ViewChild('recentHistoryList') private recentHistoryList?: ElementRef<HTMLElement>;

  private scrollStory?: HomeScrollStory;

  /** Últimas pesquisas por CNPJ no painel (persistido em localStorage). */
  protected readonly recentSearches = signal<DashRecentSearchRow[]>([]);

  /** Modal com lista completa de pesquisas recentes. */
  protected readonly recentSearchesHistoryOpen = signal(false);

  /** Animação de fecho em curso (camada ainda no DOM). */
  protected readonly recentSearchesHistoryExiting = signal(false);

  private recentHistoryExitTimer: ReturnType<typeof setTimeout> | null = null;

  /** Página atual no modal (0 = mais recentes). */
  private readonly recentHistoryPageIndex = signal(0);

  /** Limite de linhas no cartão (template). */
  protected readonly recentCardPreviewLimit = RECENT_SEARCHES_CARD_PREVIEW;

  /** Itens visíveis na página atual do modal. */
  protected readonly recentHistoryPageSlice = computed(() => {
    const all = this.recentSearches();
    const page = this.recentHistoryPageIndex();
    const start = page * RECENT_HISTORY_PAGE_SIZE;
    return all.slice(start, start + RECENT_HISTORY_PAGE_SIZE);
  });

  /** Texto tipo “1–10 de 86”. */
  protected readonly recentHistoryRangeLabel = computed(() => {
    const total = this.recentSearches().length;
    if (total === 0) return '';
    const page = this.recentHistoryPageIndex();
    const from = page * RECENT_HISTORY_PAGE_SIZE + 1;
    const to = Math.min((page + 1) * RECENT_HISTORY_PAGE_SIZE, total);
    return `${from}–${to} de ${total}`;
  });

  protected readonly recentHistoryCanPrev = computed(() => this.recentHistoryPageIndex() > 0);

  protected readonly recentHistoryCanNext = computed(() => {
    const total = this.recentSearches().length;
    if (total === 0) return false;
    const lastPage = Math.max(0, Math.ceil(total / RECENT_HISTORY_PAGE_SIZE) - 1);
    return this.recentHistoryPageIndex() < lastPage;
  });

  /**
   * Pesquisas recentes com score acima do limiar (maior risco), ordenadas do maior score para o menor.
   */
  protected readonly topRecentHighRiskRows = computed((): DashRecentHighRiskRow[] => {
    const rows = this.recentSearches().filter(
      (r) =>
        r.score != null &&
        typeof r.score === 'number' &&
        !Number.isNaN(r.score) &&
        r.score > HIGH_RISK_RECENT_SCORE_THRESHOLD
    );
    const sorted = [...rows].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return sorted.slice(0, HIGH_RISK_RECENT_MAX_ROWS).map((r) => ({
      cnpj: r.cnpj,
      line: this.formatRecentHighRiskLine(r),
    }));
  });

  /** Favoritos do painel (CNPJ + rótulo para o cartão). */
  protected readonly favoriteEntries = signal<DashFavoriteEntry[]>([]);

  /** Lista de CNPJs favoritos para o botão na busca. */
  protected readonly favoriteCnpjKeysForSearch = computed(() => this.favoriteEntries().map((e) => e.cnpj));

  /** Texto em “Última atualização da base” (ou valor de `environment.dashboardDataLastRefreshLabel`). */
  protected readonly dataIndicatorBaseRefreshLabel =
    environment.dashboardDataLastRefreshLabel?.trim() ||
    'Sincronização diária com fontes públicas oficiais';

  /** Resumo das fontes — transmite cobertura sem confundir com histórico de pesquisas. */
  protected readonly dataIndicatorSourcesTodayLabel =
    'Receita Federal, IBAMA, ICMBio e demais bases ativas em cada consulta por CNPJ';

  /** Alertas gerados quando score ou risco mudam entre duas consultas ao mesmo CNPJ. */
  protected readonly recentAlerts = signal<DashRecentAlert[]>([]);

  private readonly scoreSnapshots = signal<Record<string, DashScoreSnapshot>>({});

  readonly dashSearchPlaceholder = 'Digite o CNPJ da empresa';

  constructor() {
    this.loadRecentSearchesFromStorage();
    this.loadScoreSnapshotsFromStorage();
    this.loadAlertsFromStorage();
    this.loadFavoritesFromStorage();
    effect(() => {
      const n = this.recentHistoryShellOpener.openNonce();
      if (n <= this.lastProcessedShellOpenNonce) return;
      this.lastProcessedShellOpenNonce = n;
      queueMicrotask(() => this.openRecentSearchesHistory());
    });
  }

  onDashboardSearchSettled(payload: { term: string; result: SearchResult }): void {
    const cnpj = payload.term.replace(/\D/g, '');
    if (cnpj.length !== 14) return;
    const masked = this.documentValidation.applyCNPJMask(cnpj);
    const label = this.buildRecentSearchLabel(masked, payload.result);
    const score = this.extractRiskScoreFromSearchResult(payload.result);
    this.recentSearches.update((rows) => {
      const without = rows.filter((r) => r.cnpj !== cnpj);
      const row: DashRecentSearchRow = { cnpj, label };
      if (score != null) row.score = score;
      return [row, ...without].slice(0, MAX_RECENT_SEARCHES);
    });
    this.persistRecentSearchesToStorage();
    this.processSearchForScoreAlerts(cnpj, payload.result);
  }

  onDashboardFavoriteToggled(payload: { cnpj: string; label: string; add: boolean }): void {
    if (payload.add) {
      this.favoriteEntries.update((list) => {
        const without = list.filter((x) => x.cnpj !== payload.cnpj);
        return [{ cnpj: payload.cnpj, label: payload.label }, ...without].slice(0, MAX_DASH_FAVORITES);
      });
    } else {
      this.favoriteEntries.update((list) => list.filter((x) => x.cnpj !== payload.cnpj));
    }
    this.persistFavoritesToStorage();
  }

  private loadFavoritesFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const out: DashFavoriteEntry[] = [];
      for (const item of parsed) {
        if (!item || typeof item !== 'object') continue;
        const o = item as { cnpj?: unknown; label?: unknown };
        if (typeof o.cnpj !== 'string' || o.cnpj.length !== 14) continue;
        if (typeof o.label !== 'string') continue;
        out.push({ cnpj: o.cnpj, label: o.label });
      }
      this.favoriteEntries.set(out.slice(0, MAX_DASH_FAVORITES));
    } catch {
      /* ignore */
    }
  }

  private persistFavoritesToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.favoriteEntries()));
    } catch {
      /* ignore */
    }
  }

  private extractRiskScoreFromSearchResult(result: SearchResult): number | undefined {
    if (!result.found || result.bloqueadoPorSituacaoCadastral) return undefined;
    const fromResult = result.scoreResult?.score;
    if (fromResult != null && !Number.isNaN(Number(fromResult))) {
      return Math.min(100, Math.max(0, Number(fromResult)));
    }
    const fromEntity = result.entity?.score;
    if (fromEntity != null && !Number.isNaN(Number(fromEntity))) {
      return Math.min(100, Math.max(0, Number(fromEntity)));
    }
    return undefined;
  }

  private formatRecentHighRiskLine(r: DashRecentSearchRow): string {
    const name = r.label.includes(' — ') ? r.label.split(' — ')[0]! : r.label;
    const s = r.score!;
    return `${name} — score ${s} (${this.riskBandLabelFromScore(s)})`;
  }

  private riskBandLabelFromScore(score: number): string {
    if (score <= 25) return 'Baixo';
    if (score <= 50) return 'Médio';
    if (score <= 75) return 'Alto';
    return 'Crítico';
  }

  private buildRecentSearchLabel(maskedCnpj: string, result: SearchResult): string {
    if (result.bloqueadoPorSituacaoCadastral) {
      return `${maskedCnpj} — situação cadastral restrita`;
    }
    if (result.found && result.entity) {
      return `${result.entity.name} — ${maskedCnpj}`;
    }
    return `${maskedCnpj} — sem registro encontrado`;
  }

  private loadRecentSearchesFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const rows: DashRecentSearchRow[] = [];
      for (const item of parsed) {
        if (
          item &&
          typeof item === 'object' &&
          'cnpj' in item &&
          'label' in item &&
          typeof (item as DashRecentSearchRow).cnpj === 'string' &&
          typeof (item as DashRecentSearchRow).label === 'string'
        ) {
          const row: DashRecentSearchRow = {
            cnpj: (item as DashRecentSearchRow).cnpj,
            label: (item as DashRecentSearchRow).label,
          };
          const rawScore = (item as { score?: unknown }).score;
          if (typeof rawScore === 'number' && !Number.isNaN(rawScore)) {
            row.score = Math.min(100, Math.max(0, rawScore));
          }
          rows.push(row);
        }
      }
      this.recentSearches.set(rows.slice(0, MAX_RECENT_SEARCHES));
    } catch {
      /* ignore */
    }
  }

  private persistRecentSearchesToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(this.recentSearches()));
    } catch {
      /* quota / privado */
    }
  }

  /**
   * Compara score/risco com a última consulta guardada para o mesmo CNPJ;
   * se mudou, regista um alerta. Atualiza ou remove o snapshot conforme o resultado.
   */
  private processSearchForScoreAlerts(cnpj: string, result: SearchResult): void {
    if (result.found && result.entity) {
      const e = result.entity;
      const curr = { score: e.score, risk: this.normalizeRiskKey(e.riskLevel) };
      const prev = this.scoreSnapshots()[cnpj];
      if (prev && (prev.score !== curr.score || prev.risk !== curr.risk)) {
        const msg = this.buildScoreChangeMessage(e.name, prev, curr);
        if (msg) this.prependAlert(msg);
      }
      this.scoreSnapshots.update((snap) => ({ ...snap, [cnpj]: { score: curr.score, risk: curr.risk } }));
      this.persistScoreSnapshots();
      return;
    }
    if (this.scoreSnapshots()[cnpj]) {
      this.scoreSnapshots.update((snap) => {
        const next = { ...snap };
        delete next[cnpj];
        return next;
      });
      this.persistScoreSnapshots();
    }
  }

  private normalizeRiskKey(r: RiskLevel | string | undefined): string {
    if (r == null || r === '') return '';
    const lower = String(r).trim().toLowerCase();
    if (lower === 'médio') return 'medio';
    if (lower === 'crítico') return 'critico';
    return lower;
  }

  private riskLabelForDisplay(riskKey: string): string {
    const map: Record<string, string> = {
      baixo: 'Baixo',
      medio: 'Médio',
      alto: 'Alto',
      critico: 'Crítico',
    };
    return map[riskKey] ?? riskKey;
  }

  private buildScoreChangeMessage(
    companyName: string,
    prev: DashScoreSnapshot,
    curr: { score: number; risk: string }
  ): string | null {
    const scoreChanged = prev.score !== curr.score;
    const riskChanged = prev.risk !== curr.risk;
    if (!scoreChanged && !riskChanged) return null;
    const shortName = companyName.length > 42 ? `${companyName.slice(0, 40)}…` : companyName;
    const parts: string[] = [];
    if (scoreChanged) parts.push(`score ${prev.score} → ${curr.score}`);
    if (riskChanged) {
      parts.push(`risco ${this.riskLabelForDisplay(prev.risk)} → ${this.riskLabelForDisplay(curr.risk)}`);
    }
    return `${shortName}: ${parts.join('; ')}.`;
  }

  private newAlertId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private prependAlert(message: string): void {
    const alert: DashRecentAlert = { id: this.newAlertId(), message, at: Date.now() };
    this.recentAlerts.update((list) => [alert, ...list].slice(0, MAX_RECENT_ALERTS));
    this.persistAlerts();
  }

  private loadScoreSnapshotsFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(SCORE_SNAPSHOT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') return;
      const out: Record<string, DashScoreSnapshot> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof k !== 'string' || k.length !== 14) continue;
        if (!v || typeof v !== 'object') continue;
        const o = v as { score?: unknown; risk?: unknown };
        if (typeof o.score !== 'number' || typeof o.risk !== 'string') continue;
        out[k] = { score: o.score, risk: o.risk };
      }
      this.scoreSnapshots.set(out);
    } catch {
      /* ignore */
    }
  }

  private persistScoreSnapshots(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(SCORE_SNAPSHOT_STORAGE_KEY, JSON.stringify(this.scoreSnapshots()));
    } catch {
      /* ignore */
    }
  }

  private loadAlertsFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const list: DashRecentAlert[] = [];
      for (const item of parsed) {
        if (!item || typeof item !== 'object') continue;
        const a = item as { id?: unknown; message?: unknown; at?: unknown };
        if (typeof a.id !== 'string' || typeof a.message !== 'string' || typeof a.at !== 'number') continue;
        list.push({ id: a.id, message: a.message, at: a.at });
      }
      this.recentAlerts.set(list.slice(0, MAX_RECENT_ALERTS));
    } catch {
      /* ignore */
    }
  }

  private persistAlerts(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(this.recentAlerts()));
    } catch {
      /* ignore */
    }
  }

  openRecentSearchesHistory(): void {
    this.clearRecentHistoryExitTimer();
    this.recentSearchesHistoryExiting.set(false);
    this.recentHistoryPageIndex.set(0);
    this.recentSearchesHistoryOpen.set(true);
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = 'hidden';
    }
  }

  recentHistoryGoPrev(): void {
    if (!this.recentHistoryCanPrev()) return;
    this.recentHistoryPageIndex.update((p) => Math.max(0, p - 1));
    this.scheduleRecentHistoryListScrollTop();
  }

  recentHistoryGoNext(): void {
    if (!this.recentHistoryCanNext()) return;
    this.recentHistoryPageIndex.update((p) => p + 1);
    this.scheduleRecentHistoryListScrollTop();
  }

  private scheduleRecentHistoryListScrollTop(): void {
    requestAnimationFrame(() => {
      const el = this.recentHistoryList?.nativeElement;
      if (el) el.scrollTop = 0;
    });
  }

  closeRecentSearchesHistory(): void {
    if (!this.recentSearchesHistoryOpen() || this.recentSearchesHistoryExiting()) return;
    this.recentSearchesHistoryExiting.set(true);
    this.clearRecentHistoryExitTimer();
    const reduced =
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ms = reduced ? 0 : RECENT_HISTORY_EXIT_FALLBACK_MS;
    if (ms === 0) {
      queueMicrotask(() => this.finishCloseRecentSearchesHistory());
    } else {
      this.recentHistoryExitTimer = setTimeout(() => {
        this.recentHistoryExitTimer = null;
        if (this.recentSearchesHistoryExiting()) {
          this.finishCloseRecentSearchesHistory();
        }
      }, ms);
    }
  }

  onRecentHistoryPanelAnimationEnd(event: AnimationEvent): void {
    if (event.target !== event.currentTarget) return;
    if (!this.recentSearchesHistoryExiting()) return;
    if (event.animationName !== 'homeDashRecentPanelOut') return;
    this.clearRecentHistoryExitTimer();
    this.finishCloseRecentSearchesHistory();
  }

  private clearRecentHistoryExitTimer(): void {
    if (this.recentHistoryExitTimer !== null) {
      clearTimeout(this.recentHistoryExitTimer);
      this.recentHistoryExitTimer = null;
    }
  }

  private finishCloseRecentSearchesHistory(): void {
    this.recentSearchesHistoryOpen.set(false);
    this.recentSearchesHistoryExiting.set(false);
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = '';
    }
  }

  onRecentSearchesCardKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.openRecentSearchesHistory();
    }
  }

  onClearDashboardHistoryClick(ev: Event): void {
    ev.preventDefault();
    const msg =
      'Limpar todo o histórico de pesquisas guardado neste navegador?\n\n' +
      'Serão removidos: últimas pesquisas, o ranking de maior risco recente, os alertas de mudança de score e a referência usada para comparar consultas.';
    if (typeof globalThis.confirm === 'function' && !globalThis.confirm(msg)) {
      return;
    }
    this.clearDashboardHistory();
  }

  /** Últimas pesquisas, ranking de risco recente, alertas e snapshots de score (localStorage + estado). */
  clearDashboardHistory(): void {
    this.clearRecentHistoryExitTimer();
    this.finishCloseRecentSearchesHistory();
    this.recentSearches.set([]);
    this.recentAlerts.set([]);
    this.scoreSnapshots.set({});
    this.recentHistoryPageIndex.set(0);
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
      localStorage.removeItem(SCORE_SNAPSHOT_STORAGE_KEY);
      localStorage.removeItem(ALERTS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  private scrollWindowToTop(): void {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  private blurUltimasPesquisasCardIfAutofocused(): void {
    if (typeof document === 'undefined') return;
    const card = document.getElementById('dash-ultimas-pesquisas');
    if (!card || document.activeElement !== card) return;
    (card as HTMLElement).blur();
  }

  ngAfterViewInit(): void {
    this.scrollWindowToTop();
    requestAnimationFrame(() => {
      this.scrollWindowToTop();
      requestAnimationFrame(() => this.scrollWindowToTop());
    });

    /* Evita o cartão “Últimas pesquisas” ficar com anel de foco após F5 (restauro de foco / primeiro tabindex). */
    queueMicrotask(() => this.blurUltimasPesquisasCardIfAutofocused());
    requestAnimationFrame(() => {
      this.blurUltimasPesquisasCardIfAutofocused();
      requestAnimationFrame(() => this.blurUltimasPesquisasCardIfAutofocused());
    });
    setTimeout(() => this.blurUltimasPesquisasCardIfAutofocused(), 0);

    if (this.recentHistoryShellOpener.consumeOpenOnDashboardMount()) {
      queueMicrotask(() => this.openRecentSearchesHistory());
    }
    const el = this.storyHost?.nativeElement;
    if (!el || typeof window === 'undefined') return;
    this.scrollStory = new HomeScrollStory(el, this.zone, { revealAllOnStart: true });
    this.scrollStory.init();
  }

  ngOnDestroy(): void {
    this.scrollStory?.destroy();
    this.clearRecentHistoryExitTimer();
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = '';
    }
  }

  @HostListener('document:keydown', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.recentSearchesHistoryOpen() && !this.recentSearchesHistoryExiting()) {
      this.closeRecentSearchesHistory();
      event.preventDefault();
      return;
    }
    if (this.logoutDialog.open()) {
      this.logoutDialog.dismiss();
      event.preventDefault();
    }
  }
}
