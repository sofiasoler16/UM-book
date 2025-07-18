import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { FriendService } from '../../services/friend.service';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css']

})
export class SolicitudesComponent implements OnInit {
  solicitudes: any[] = [];
  receiverId: number = 0;

  constructor(private friendService: FriendService) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  enviarSolicitud() {
    this.friendService.enviarSolicitud(this.receiverId).subscribe({
      next: (res) => alert('Solicitud enviada'),
      error: (err) => alert(err.error.message || 'Error al enviar'),
    });
  }

  cargarSolicitudes() {
    this.friendService.obtenerSolicitudesRecibidas().subscribe((data: any) => {
      this.solicitudes = data;
    });
  }

  responderSolicitud(id: number, accion: 'accept' | 'reject') {
    this.friendService.confirmarSolicitud(id, accion).subscribe(() => {
      this.cargarSolicitudes();
    });
  }
}
