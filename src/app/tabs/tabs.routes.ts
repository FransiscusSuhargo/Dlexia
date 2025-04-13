import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { LibraryPage } from './library/library.page';

export const tabsRoutes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
      },
      {
        path: 'library',
        loadComponent: () => import('./library/library.page').then(m => m.LibraryPage),
      },
      {
        path: 'reader',
        loadComponent: () => import('./epub-reader/epub-reader.page').then(m => m.EpubReaderPage),
      },
      {
        path: 'test',
        loadComponent: () => import('./test-page/test-page.page').then(m=>m.TestPagePage),
      },
      // Remove the empty path redirect from here
      // Add this as the last child to catch any undefined tabs routes
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  },
  // Keep this as the global redirect
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  }
];
