import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'CafeFinder — Bakıda ən yaxın kafeni tap',
  },
  {
    path: 'cafes',
    loadComponent: () =>
      import('./features/cafe-search/cafes-page/cafes-page').then((m) => m.CafesPage),
    title: 'Kafelər — CafeFinder',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    title: 'Haqqımızda — CafeFinder',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
    title: 'Əlaqə — CafeFinder',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Səhifə tapılmadı — CafeFinder',
  },
];
