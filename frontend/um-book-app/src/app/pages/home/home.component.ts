import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FriendService, Amigo } from '../../services/friend.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  albumesAmigos: any[] = [];
  fotosAmigos: any[] = [];

  constructor(
    private http: HttpClient,
    private friendService: FriendService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Cargar álbumes de amigos
    this.http.get<any[]>('http://127.0.0.1:5000/albums/amigos', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.albumesAmigos = data;
      },
      error: (err) => {
        console.error('Error al obtener álbumes de amigos:', err);
      }
    });

    // Obtener lista de amigos desde el servicio
    this.friendService.obtenerAmigos().subscribe({
      next: (amigos: Amigo[]) => {
        amigos.forEach((amigo) => {
          // Para cada amigo, obtener sus fotos
          this.http.get<any[]>(`http://127.0.0.1:5000/fotos/usuario/${amigo.friend_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).subscribe({
            next: (fotos) => {
              const fotosConDatos = fotos.map(foto => ({
                ...foto,
                username: amigo.friend_username || 'usuario' + amigo.friend_id,
                fecha: foto.fecha || 'Desconocida'
              }));
              this.fotosAmigos.push(...fotosConDatos);
            },
            error: (err) => {
              console.error(`Error al obtener fotos de ${amigo.friend_id}:`, err);
            }
          });
        });
      },
      error: (err) => {
        console.error('Error al obtener amigos:', err);
      }
    });
  }
}
