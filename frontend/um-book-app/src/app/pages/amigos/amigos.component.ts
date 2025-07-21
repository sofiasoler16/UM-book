import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendService, Amigo } from '../../services/friend.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-amigos',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './amigos.component.html',
  styleUrls: ['./amigos.component.css']
})
export class AmigosComponent implements OnInit {
  amigos: Amigo[] = [];

  constructor(private friendService: FriendService) {}

  ngOnInit(): void {
    this.cargarAmigos();
  }

  cargarAmigos(): void {
    this.friendService.obtenerAmigos().subscribe((data) => {
      this.amigos = data;
    });
  }

  eliminarAmigo(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta amistad?')) return;

    this.friendService.eliminarAmigo(id).subscribe({
      next: () => {
        this.amigos = this.amigos.filter(a => a.friend_id !== id);
      },
      error: () => alert('Error al eliminar la amistad')
    });
  }
}
