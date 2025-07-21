import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  username: string = 'username';
  correo: string = 'usuario@example.com';
  publicaciones: any[] = [];
  mostrarModalPublicacion: boolean = false;
  mostrarModalAlbum: boolean = false;
  nuevaPublicacion: string = '';
  imagenSeleccionada: File | null = null;

  // Álbum con múltiples imágenes
  nuevoAlbum: {
    nombre: string;
    descripcion: string;
    imagenes: File[];
  } = {
    nombre: '',
    descripcion: '',
    imagenes: []
  };

  constructor() {}

  ngOnInit(): void {
    // Cargar publicaciones o datos del usuario
  }

  // ---------- Publicaciones ----------
  abrirModalPublicacion() {
    this.mostrarModalPublicacion = true;
  }

  cerrarModalPublicacion() {
    this.mostrarModalPublicacion = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];
    }
  }

  publicar() {
    if (this.nuevaPublicacion.trim() !== '' && this.imagenSeleccionada) {
      this.publicaciones.push({
        titulo: this.nuevaPublicacion,
        fecha: new Date().toLocaleDateString(),
        imagen: URL.createObjectURL(this.imagenSeleccionada)
      });
      this.nuevaPublicacion = '';
      this.imagenSeleccionada = null;
      this.cerrarModalPublicacion();
    }
  }

  // ---------- Álbum ----------
  abrirModalAlbum() {
    this.mostrarModalAlbum = true;
  }

  cerrarModalAlbum() {
    this.mostrarModalAlbum = false;
  }

  onImagenesSeleccionadas(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.nuevoAlbum.imagenes = Array.from(input.files);
    }
  }

  crearAlbum() {
    if (this.nuevoAlbum.nombre.trim() && this.nuevoAlbum.imagenes.length > 0) {
      console.log('Álbum creado:', this.nuevoAlbum);
      // Aquí podrías enviar los datos al backend con FormData

      // Limpiar el formulario
      this.nuevoAlbum = { nombre: '', descripcion: '', imagenes: [] };
      this.cerrarModalAlbum();
    } else {
      alert('El álbum debe tener un nombre y al menos una imagen.');
    }
  }
}
