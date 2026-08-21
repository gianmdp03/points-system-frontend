import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import { CompanyDetailPage } from './pages/company-detail/company-detail-page';
import { ClientPointsPage } from './pages/client-points/client-points';
import { PricingPage } from './pages/pricing/pricing-page';
import { ClientJoinComponent } from './pages/client-join/client-join';
import { SubscriptionCallbackPage } from './pages/subscription-callback/subscription-callback';
import { SubscriptionManagementPage } from './pages/subscription-management/subscription-management';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: DashboardPage },
  { path: 'pricing', component: PricingPage },
  { path: 'subscription/plans', redirectTo: 'pricing', pathMatch: 'full' },
  { path: 'dashboard/pricing', component: PricingPage },
  { path: 'subscription/callback', component: SubscriptionCallbackPage },
  { path: 'dashboard/subscription', component: SubscriptionManagementPage },
  { path: 'settings/billing', redirectTo: 'dashboard/subscription', pathMatch: 'full' },
  { path: 'companies/:id', component: CompanyDetailPage },
  { path: 'join/:companyId', component: ClientJoinComponent },
  { path: 'points', component: ClientPointsPage },
  { path: 'my-points', redirectTo: 'points', pathMatch: 'full' },
  { path: 'check-points', redirectTo: 'points', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

