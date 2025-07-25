import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserFilterPipe } from '../../pipes/user-filter.pipe';
import { FriendService, Amigo } from '../../services/friend.service';
import { UserService } from '../../services/user.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-buscar-user',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, UserFilterPipe, SidebarComponent],
  templateUrl: './buscar-user.component.html',
  styleUrls: ['./buscar-user.component.css']
})
export class BuscarUserComponent implements OnInit {
  searchTerm = '';
  usuarios: any[] = [];
  solicitudesEnviadas: number[] = [];
  amigos: number[] = [];
  miId: number | null = null;

  constructor(
    private friendService: FriendService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
  const currentUserId = this.getUserIdFromToken();


  this.userService.getUsers().subscribe((data: any[]) => {
    this.usuarios = data.map(user => ({
      ...user,
      esActual: Number(user.id) === Number(currentUserId)
    }));
    
  });

  this.friendService.obtenerAmigos().subscribe((data: Amigo[]) => {
    this.amigos = data.map(a => a.friend_id);
  });
}



  enviarSolicitud(receiverId: number): void {
    this.friendService.enviarSolicitud(receiverId).subscribe({
      next: () => {
        alert('Solicitud enviada');
        this.solicitudesEnviadas.push(receiverId);
      },
      error: (err) => {
        alert(err.error?.message || 'Error al enviar solicitud');
      }
    });
  }

  solicitudYaEnviada(userId: number): boolean {
    return this.solicitudesEnviadas.includes(userId);
  }

  yaEsAmigo(userId: number): boolean {
    return this.amigos.includes(userId);
  }

 getUserIdFromToken(): number | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.identity || null;
  } catch (e) {
    console.error('Error al decodificar el token', e);
    return null;
  }
}


}
