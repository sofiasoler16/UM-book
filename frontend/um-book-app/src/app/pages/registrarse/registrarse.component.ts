import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrarse.component.html',
  styleUrls: ['./registrarse.component.css']
})
export class RegistrarseComponent {
  nombre: string = '';
  apellido: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  fecha_nacimiento: string = ''; // formato YYYY-MM-DD

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const userData = {
      nombre: this.nombre,
      apellido: this.apellido,
      username: this.username,
      email: this.email,
      password: this.password,
      fecha_nacimiento: this.fecha_nacimiento
    };

    this.authService.register(userData).subscribe({
      next: () => {
        alert('Usuario registrado correctamente');
        this.router.navigate(['/login']);
      },
      error: err => {
        alert('Error al registrar: ' + err.error.message);
      }
    });
  }
}
