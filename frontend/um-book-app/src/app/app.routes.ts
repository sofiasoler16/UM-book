import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistrarseComponent } from './pages/registrarse/registrarse.component';
import { HomeComponent } from './pages/home/home.component';
import { BuscarUserComponent } from './pages/buscar-user/buscar-user.component';
import { SolicitudesComponent } from './pages/solicitudes/solicitudes.component'; 

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrarse', component: RegistrarseComponent },
  { path: 'home', component: HomeComponent },
  { path: 'buscar-user', component: BuscarUserComponent },
  { path: 'solicitudes', component: SolicitudesComponent }, 
];
