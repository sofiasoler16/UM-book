import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Fotos
    this.http.get<any[]>('http://127.0.0.1:5000/fotos/amigos', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.fotosAmigos = data;
      },
      error: (err) => {
        console.error('Error al obtener fotos de amigos:', err);
      }
    });

    // Álbumes
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
  }
}
