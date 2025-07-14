// src/app/pages/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: response => {
          console.log('Token recibido:', response.access_token);
          // Guardar el token (opcional)
          localStorage.setItem('access_token', response.access_token);

          // Redirigir a home
          this.router.navigate(['/home']);
        },
        error: err => {
        if (err.status === 401) {
          alert('Usuario o contraseña incorrectos');
        } else {
          alert('Error inesperado: ' + (err.error?.message || ''));
        }
      }
      });
  }
}
