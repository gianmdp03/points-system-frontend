import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

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
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard-page').then(m => m.DashboardPage)
  },
  {
    path: 'pricing',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/pricing/pricing-page').then(m => m.PricingPage)
  },
  {
    path: 'subscription/plans',
    redirectTo: 'pricing',
    pathMatch: 'full'
  },
  {
    path: 'dashboard/pricing',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/pricing/pricing-page').then(m => m.PricingPage)
  },
  {
    path: 'subscription/callback',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/subscription-callback/subscription-callback').then(m => m.SubscriptionCallbackPage)
  },
  {
    path: 'dashboard/subscription',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/subscription-management/subscription-management').then(m => m.SubscriptionManagementPage)
  },
  {
    path: 'settings/billing',
    redirectTo: 'dashboard/subscription',
    pathMatch: 'full'
  },
  {
    path: 'companies/:id',
    canActivate: [authGuard],
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
