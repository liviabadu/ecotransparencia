import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Entity } from '../models/entity.model';
import { RelatorioConformidadeService } from './services/relatorio-conformidade.service';
import { PdfExportService } from './services/pdf-export.service';

/**
 * Relatório de Conformidade Socioambiental — exportação em PDF e impressão.
 *
 * HU: "Como usuário do portal Ecotransparência, quero salvar e imprimir relatórios
 * com autuações, embargos, trabalho análogo à escravidão e demais ocorrências".
 *
 * Recebe a {@link Entity} já obtida pela busca, consolida via
 * {@link RelatorioConformidadeService} e renderiza um documento em formato de "papel"
 * (claro, próprio para impressão), com botões para exportar PDF (cliente, html2canvas +
 * jsPDF) e imprimir (window.print + folha de estilo de impressão global).
 */
@Component({
  selector: 'app-relatorio-conformidade',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './relatorio-conformidade.component.html',
  styleUrl: './relatorio-conformidade.component.css',
})
export class RelatorioConformidadeComponent {
  private readonly consolidator = inject(RelatorioConformidadeService);
  private readonly pdfExport = inject(PdfExportService);

  /** Entidade consultada (resultado da busca). Obrigatória. */
  readonly entity = input.required<Entity>();

  /** Nó do documento usado na rasterização para PDF. */
  private readonly docRef = viewChild<ElementRef<HTMLElement>>('documento');

  /** Estado do botão de exportação (evita cliques duplos e dá feedback). */
  protected readonly exportando = signal(false);
  protected readonly erroExport = signal<string | null>(null);

  /** Relatório consolidado, recomputado quando a entidade muda. */
  protected readonly relatorio = computed(() =>
    this.consolidator.consolidar(this.entity()),
  );

  /** Nome do arquivo PDF: ecotransparencia-<cnpj>-<data>.pdf */
  private nomeArquivoPdf(): string {
    const doc = this.relatorio().empresa.documento.replace(/\D/g, '') || 'empresa';
    const hoje = new Date().toISOString().slice(0, 10);
    return `relatorio-conformidade-${doc}-${hoje}.pdf`;
  }

  /** Exporta o documento como PDF A4 no próprio navegador. */
  protected async onExportarPdf(): Promise<void> {
    const el = this.docRef()?.nativeElement;
    if (!el || this.exportando()) return;
    this.erroExport.set(null);
    this.exportando.set(true);
    try {
      await this.pdfExport.exportElementToPdf(el, this.nomeArquivoPdf());
    } catch {
      this.erroExport.set('Não foi possível gerar o PDF. Tente novamente ou use a impressão.');
    } finally {
      this.exportando.set(false);
    }
  }

  /** Aciona a impressão do navegador (a folha @media print isola o documento). */
  protected onImprimir(): void {
    window.print();
  }

  /**
   * Faixa de risco a partir do score 0–100 (mesma escala do portal):
   * 0–25 baixo · 26–50 médio · 51–75 alto · 76–100 crítico.
   */
  protected riskKey(score: number | undefined): 'baixo' | 'medio' | 'alto' | 'critico' | 'na' {
    if (score == null || Number.isNaN(Number(score))) return 'na';
    const n = Number(score);
    if (n <= 25) return 'baixo';
    if (n <= 50) return 'medio';
    if (n <= 75) return 'alto';
    return 'critico';
  }

  protected riskLabel(score: number | undefined): string {
    switch (this.riskKey(score)) {
      case 'baixo':
        return 'Risco baixo';
      case 'medio':
        return 'Risco médio';
      case 'alto':
        return 'Risco alto';
      case 'critico':
        return 'Risco crítico';
      default:
        return 'Risco não calculado';
    }
  }
}
