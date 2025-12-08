import { Component, signal } from '@angular/core';
import { Search } from '../../components/search/search';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Search],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly title = signal('EcoTransparência');
}
