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

  @HostListener('document:keydown', ['$event'])
  onEscapeLeavePage(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (isFocusInTextEntryField()) return;
    this.router.navigate(['/']);
    event.preventDefault();
  }
}
