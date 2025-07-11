// src/app/pages/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService) {}

  login(): void {
    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: response => {
          console.log('Token recibido:', response.access_token);
          // Guardar el token en localStorage o lo que necesites
          // Redirigir si es necesario, por ejemplo:
          // this.router.navigate(['/']);
        },
        error: err => {
          console.error('Error al iniciar sesión:', err);
        }
      });
  }
}
