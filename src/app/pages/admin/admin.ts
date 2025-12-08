import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ScoreWeight {
  fonte: string;
  peso: number;
  descricao: string;
}

interface RiskThreshold {
  nivel: string;
  min: number;
  max: number;
  cor: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  protected authService = inject(AuthService);
  private router = inject(Router);

  // Methodology configuration
  scoreWeights = signal<ScoreWeight[]>([
    { fonte: 'IBAMA', peso: 0.4, descricao: 'Embargos e autuações do IBAMA' },
    { fonte: 'ICMBio', peso: 0.3, descricao: 'Processos do ICMBio' },
    { fonte: 'Trabalhista', peso: 0.2, descricao: 'Lista Suja do Trabalho Escravo' },
    { fonte: 'Administrativo', peso: 0.1, descricao: 'Empresas impedidas de contratar' },
  ]);

  riskThresholds = signal<RiskThreshold[]>([
    { nivel: 'Baixo', min: 0, max: 25, cor: '#10B981' },
    { nivel: 'Médio', min: 26, max: 50, cor: '#F59E0B' },
    { nivel: 'Alto', min: 51, max: 75, cor: '#F97316' },
    { nivel: 'Crítico', min: 76, max: 100, cor: '#DC2626' },
  ]);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isEditing = signal(false);

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated() && !this.authService.isLoading()) {
      this.router.navigate(['/login']);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      this.errorMessage.set('Erro ao fazer logout.');
    }
  }

  startEditing(): void {
    this.isEditing.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    // Reset to default values
    this.scoreWeights.set([
      { fonte: 'IBAMA', peso: 0.4, descricao: 'Embargos e autuações do IBAMA' },
      { fonte: 'ICMBio', peso: 0.3, descricao: 'Processos do ICMBio' },
      { fonte: 'Trabalhista', peso: 0.2, descricao: 'Lista Suja do Trabalho Escravo' },
      { fonte: 'Administrativo', peso: 0.1, descricao: 'Empresas impedidas de contratar' },
    ]);
  }

  saveChanges(): void {
    // Validate weights sum to 1
    const totalWeight = this.scoreWeights().reduce((sum, item) => sum + item.peso, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
      this.errorMessage.set(`A soma dos pesos deve ser igual a 1. Atual: ${totalWeight.toFixed(2)}`);
      return;
    }

    // Validate thresholds
    const thresholds = this.riskThresholds();
    for (let i = 0; i < thresholds.length - 1; i++) {
      if (thresholds[i].max >= thresholds[i + 1].min) {
        this.errorMessage.set('Os limites de risco não podem se sobrepor.');
        return;
      }
    }

    // In a real implementation, this would save to Firebase/backend
    this.isEditing.set(false);
    this.errorMessage.set(null);
    this.successMessage.set('Configurações salvas com sucesso!');

    // Clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage.set(null);
    }, 3000);
  }

  updateWeight(index: number, value: number): void {
    const weights = [...this.scoreWeights()];
    weights[index] = { ...weights[index], peso: value };
    this.scoreWeights.set(weights);
  }

  updateThreshold(index: number, field: 'min' | 'max', value: number): void {
    const thresholds = [...this.riskThresholds()];
    thresholds[index] = { ...thresholds[index], [field]: value };
    this.riskThresholds.set(thresholds);
  }

  getTotalWeight(): number {
    return this.scoreWeights().reduce((sum, item) => sum + item.peso, 0);
  }

  isWeightInvalid(): boolean {
    return Math.abs(this.getTotalWeight() - 1) > 0.01;
  }
}
