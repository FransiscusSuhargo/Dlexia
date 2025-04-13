import { Routes } from '@angular/router';
import { tabsRoutes } from './tabs/tabs.routes';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.tabsRoutes),
  },
  {
    path: 'library',
    loadComponent: () => import('./tabs/library/library.page').then( m => m.LibraryPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./tabs/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'scanner',
    loadComponent: () => import('./tabs/scanner/scanner.page').then(m => m.ScannerPage)
  },
  {
    path: 'badge',
    loadComponent: () => import('./tabs/badge/badge.page').then(m => m.BadgePage)
  },
];
