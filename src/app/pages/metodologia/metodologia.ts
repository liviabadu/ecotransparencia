import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-metodologia',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './metodologia.html',
  styleUrl: './metodologia.css',
})
export class Metodologia {
  /** Rodapé com href="#" (placeholders): evita saltar ao topo */
  preventFooterPlaceholder(event: Event): void {
    event.preventDefault();
  }
}
