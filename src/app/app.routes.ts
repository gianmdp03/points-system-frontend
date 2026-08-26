import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard-page').then(m => m.DashboardPage)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing-page').then(m => m.PricingPage)
  },
  {
    path: 'subscription/plans',
    redirectTo: 'pricing',
    pathMatch: 'full'
  },
  {
    path: 'dashboard/pricing',
    loadComponent: () => import('./pages/pricing/pricing-page').then(m => m.PricingPage)
  },
  {
    path: 'subscription/callback',
    loadComponent: () => import('./pages/subscription-callback/subscription-callback').then(m => m.SubscriptionCallbackPage)
  },
  {
    path: 'dashboard/subscription',
    loadComponent: () => import('./pages/subscription-management/subscription-management').then(m => m.SubscriptionManagementPage)
  },
  {
    path: 'settings/billing',
    redirectTo: 'dashboard/subscription',
    pathMatch: 'full'
  },
  {
    path: 'companies/:id',
    loadComponent: () => import('./pages/company-detail/company-detail-page').then(m => m.CompanyDetailPage)
  },
  {
    path: 'join/:companyId',
    loadComponent: () => import('./pages/client-join/client-join').then(m => m.ClientJoinComponent)
  },
  {
    path: 'points',
    loadComponent: () => import('./pages/client-points/client-points').then(m => m.ClientPointsPage)
  },
  {
    path: 'my-points',
    redirectTo: 'points',
    pathMatch: 'full'
  },
  {
    path: 'check-points',
    redirectTo: 'points',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
