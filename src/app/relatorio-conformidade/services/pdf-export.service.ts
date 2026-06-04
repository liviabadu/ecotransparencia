import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/** Margem do PDF em milímetros (A4). */
const MARGIN_MM = 10;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Gera o PDF do relatório inteiramente no cliente (browser): rasteriza o nó HTML
 * com html2canvas e pagina o resultado em folhas A4 via jsPDF, disparando o download.
 *
 * Mantém-se desacoplado do componente — recebe o elemento já renderizado e o nome
 * de arquivo desejado.
 */
@Injectable({ providedIn: 'root' })
export class PdfExportService {
  /**
   * Exporta `element` como um PDF A4 (retrato) e baixa com `fileName`.
   * Lança em caso de falha para o componente exibir feedback ao usuário.
   */
  async exportElementToPdf(element: HTMLElement, fileName: string): Promise<void> {
    // Limita a altura do canvas (Safari rejeita canvas > ~16k px); relatórios muito
    // longos reduzem a escala em vez de falhar.
    const MAX_CANVAS_HEIGHT_PX = 14000;
    const baseScale = Math.min(2, window.devicePixelRatio || 1.5);
    const heightCapScale = MAX_CANVAS_HEIGHT_PX / Math.max(1, element.scrollHeight);
    const scale = Math.max(0.75, Math.min(baseScale, heightCapScale));

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const usableWidth = A4_WIDTH_MM - MARGIN_MM * 2;
    const usableHeight = A4_HEIGHT_MM - MARGIN_MM * 2;

    // Largura da imagem ocupa a área útil; altura proporcional.
    const imgHeightMm = (canvas.height * usableWidth) / canvas.width;

    if (imgHeightMm <= usableHeight) {
      // Cabe em uma única página.
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        MARGIN_MM,
        MARGIN_MM,
        usableWidth,
        imgHeightMm,
      );
      pdf.save(fileName);
      return;
    }

    // Multipágina: fatiamos o canvas em blocos de altura equivalente à página útil.
    const pageHeightPx = (usableHeight * canvas.width) / usableWidth;
    let renderedHeightPx = 0;
    let isFirstPage = true;

    while (renderedHeightPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;

      const ctx = pageCanvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível criar o contexto de canvas para o PDF.');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        renderedHeightPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx,
      );

      const sliceHeightMm = (sliceHeightPx * usableWidth) / canvas.width;

      if (!isFirstPage) pdf.addPage();
      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        MARGIN_MM,
        MARGIN_MM,
        usableWidth,
        sliceHeightMm,
      );

      renderedHeightPx += sliceHeightPx;
      isFirstPage = false;
    }

    pdf.save(fileName);
  }
}
