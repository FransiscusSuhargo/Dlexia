import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const tabsRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'library',
        loadComponent: () => import('./library/library.page').then(m => m.LibraryPage),
      },
      {
        path: 'reader',
        loadComponent: () => import('./epub-reader/epub-reader.page').then(m => m.EpubReaderPage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  }
];
