// src/app/pages/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // ajustá el path si es necesario
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
          // Guardar el token, redirigir, etc.
        },
        error: err => {
          console.error('Error al iniciar sesión:', err);
        }
      });
  }
}
