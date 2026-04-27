import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Permite abrir o modal de configurações a partir de filhos (ex.: dashboard)
 * sem acoplar ao App. O App inscreve-se uma vez e chama settingsOpen.set(true).
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsOpenerService {
  private readonly open$ = new Subject<void>();

  /** Stream de pedidos de abertura (App subscreve). */
  readonly settingsOpenRequested = this.open$.asObservable();

  requestOpen(): void {
    this.open$.next();
  }
}
