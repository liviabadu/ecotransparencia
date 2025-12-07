import { Injectable } from '@angular/core';
import {
  CategorySummary,
  Occurrence,
  OccurrenceCategory,
  RiskLevel,
  ScoreResult,
} from '../models/entity.model';

@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  /**
   * CA07 - Returns the risk level based on score
   * Baixo: 0-25, Médio: 26-50, Alto: 51-75, Crítico: 76-100
   */
  getRiskLevel(score: number): RiskLevel {
    if (score <= 25) {
      return 'Baixo';
    } else if (score <= 50) {
      return 'Médio';
    } else if (score <= 75) {
      return 'Alto';
    } else {
      return 'Crítico';
    }
  }

  /**
   * CT09-CT12 - Returns the color associated with a risk level
   */
  getRiskColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'Baixo':
        return 'green';
      case 'Médio':
        return 'yellow';
      case 'Alto':
        return 'orange';
      case 'Crítico':
        return 'red';
    }
  }

  /**
   * CA08, CA09 - Calculates the complete score result with grouped and sorted occurrences
   */
  calculateScoreResult(score: number, occurrences: Occurrence[]): ScoreResult {
    const riskLevel = this.getRiskLevel(score);

    // Group occurrences by category
    const categoryMap = new Map<OccurrenceCategory, Occurrence[]>();

    for (const occurrence of occurrences) {
      const existing = categoryMap.get(occurrence.category) || [];
      existing.push(occurrence);
      categoryMap.set(occurrence.category, existing);
    }

    // Create category summaries with sorted occurrences (newest first - CA09)
    const categorySummaries: CategorySummary[] = [];
    const categoryOrder = this.getCategoryOrder();

    for (const category of categoryOrder) {
      const categoryOccurrences = categoryMap.get(category);
      if (categoryOccurrences && categoryOccurrences.length > 0) {
        // Sort by date descending (newest first)
        const sortedOccurrences = [...categoryOccurrences].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        categorySummaries.push({
          category,
          count: sortedOccurrences.length,
          occurrences: sortedOccurrences,
        });
      }
    }

    return {
      score,
      riskLevel,
      totalOccurrences: occurrences.length,
      categorySummaries,
    };
  }

  /**
   * CA08 - Returns the order of categories for display
   */
  getCategoryOrder(): OccurrenceCategory[] {
    return ['Ambiental IBAMA', 'Ambiental ICMBio', 'Trabalhista', 'Administrativo'];
  }
}
