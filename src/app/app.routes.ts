import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import { CompanyDetailPage } from './pages/company-detail/company-detail-page';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: DashboardPage },
  { path: 'companies/:id', component: CompanyDetailPage },
  { path: '**', redirectTo: '' }
];

