import { Component } from '@angular/core';

/** Filho vazio de `MainShell` na URL `/` — não ocupa espaço nem cobre a home. */
@Component({
  selector: 'app-empty-route',
  standalone: true,
  template: '',
  styles: `:host { display: none !important; }`,
})
export class EmptyRoute {}
