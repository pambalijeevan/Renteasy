import { createBrowserRouter } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AddPropertyPage } from './pages/AddPropertyPage';
import { TenantDashboard } from './pages/TenantDashboard';
import { PropertyDetails } from './pages/PropertyDetails';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/owner/dashboard', Component: OwnerDashboard },
  { path: '/owner/add-property', Component: AddPropertyPage },
  { path: '/tenant/dashboard', Component: TenantDashboard },
  { path: '/property/:id', Component: PropertyDetails },
  { path: '*', Component: NotFound },
]);
