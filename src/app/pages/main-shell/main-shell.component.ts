import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from '../home/home';

/**
 * Mantém a home montada em /, /login e /cadastro para fechar o auth sem remontar a landing
 * (evita “pulo” de tipografia e animações reiniciando).
 */
@Component({
  selector: 'app-main-shell',
  standalone: true,
  imports: [Home, RouterOutlet],
  templateUrl: './main-shell.component.html',
  styleUrl: './main-shell.component.css',
})
export class MainShell {}
