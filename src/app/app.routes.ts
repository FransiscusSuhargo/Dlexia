import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,  // <-- wrapper untuk ion-tabs
    children: [
      {
        path: 'scanner',
        loadComponent: () => import('./tabs/scanner/scanner.page').then(m => m.ScannerPage)
      },
      {
        path: 'badge',
        loadComponent: () => import('./tabs/badge/badge.page').then(m => m.BadgePage)
      },
      {
        path: 'library',
        loadComponent: () => import('./tabs/library/library.page').then(m => m.LibraryPage)
      },
      {
        path: '',
        redirectTo: '/library',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'start',
    loadComponent: () => import('./start/start.page').then( m => m.StartPage)
  },

];