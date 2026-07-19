import { Routes } from '@angular/router';

import { Login } from './auth/pages/login/login';
import { Register } from './auth/pages/register/register';
import { Dashboard } from './todo/pages/dashboard/dashboard';
import { Home } from './todo/pages/home/home';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'home',
    component: Home,
  },
];
