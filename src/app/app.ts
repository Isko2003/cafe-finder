import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CafeMap } from './features/cafe-search/cafe-map/cafe-map';

@Component({
  imports: [CafeMap],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('cafe-finder');
}
