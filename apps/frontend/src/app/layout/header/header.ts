import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoMark } from '../../shared/logo-mark/logo-mark';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoMark],
  templateUrl: './header.html',
})
export class Header {
  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { path: '/', label: 'Ana səhifə' },
    { path: '/cafes', label: 'Kafələr' },
    { path: '/about', label: 'Haqqımızda' },
    { path: '/contact', label: 'Əlaqə' },
  ];

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
