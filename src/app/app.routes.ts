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
  }

];
