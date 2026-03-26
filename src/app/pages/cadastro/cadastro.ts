import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { isFocusInTextEntryField } from '../../utils/form-focus.util';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  private router = inject(Router);

  @HostListener('document:keydown', ['$event'])
  onEscapeLeavePage(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (isFocusInTextEntryField()) return;
    this.router.navigate(['/']);
    event.preventDefault();
  }
}

