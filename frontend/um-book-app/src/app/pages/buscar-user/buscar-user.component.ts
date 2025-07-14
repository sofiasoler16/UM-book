import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserFilterPipe } from '../../pipes/user-filter.pipe';

@Component({
  selector: 'app-buscar-user',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, UserFilterPipe],
  templateUrl: './buscar-user.component.html',
  styleUrls: ['./buscar-user.component.css'],
})
export class BuscarUserComponent implements OnInit {
  usuarios: any[] = [];
  searchTerm: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: users => {
        console.log('Usuarios recibidos:', users);  // 👈 Esto nos dice si llegan
        this.usuarios = users;
      },

      
      error: err => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }
}
