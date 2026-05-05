import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { isFocusInTextEntryField } from '../../utils/form-focus.util';

@Component({
  selector: 'app-assinaturas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './assinaturas.html',
  styleUrl: './assinaturas.css',
})
export class Assinaturas {
  private router = inject(Router);

  /** Mesmo efeito do Esc: volta ao início. */
  private leavePage(): void {
    void this.router.navigate(['/']);
  }

  @HostListener('document:keydown', ['$event'])
  onEscapeLeavePage(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (isFocusInTextEntryField()) return;
    this.leavePage();
    event.preventDefault();
  }

  /** Clique no espaço em volta do cartão (como login/cadastro). */
  onBackdropClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget) return;
    this.leavePage();
  }
}
