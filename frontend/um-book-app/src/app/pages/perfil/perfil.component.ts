import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  username: string = '';
  correo: string = '';
  fechaRegistro: string = '';
  publicaciones: any[] = [];
  mostrarModalPublicacion: boolean = false;
  mostrarModalAlbum: boolean = false;
  nuevaPublicacion: string = '';
  imagenSeleccionada: File | null = null;

  nuevoAlbum: {
    nombre: string;
    descripcion: string;
    imagenes: File[];
  } = {
    nombre: '',
    descripcion: '',
    imagenes: []
  };

  albumes: {
    nombre: string;
    descripcion: string;
    imagenes: { url: string }[];
    expandido: boolean;
  }[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const userId = this.getUserIdFromToken();
    if (!userId) return;

    this.userService.getUsers().subscribe((usuarios: any[]) => {
      const actual = usuarios.find(u => Number(u.id) === Number(userId));
      if (actual) {
        this.username = actual.username;
        this.correo = actual.email;
        this.fechaRegistro = actual.fecha_registro || '01/01/2024';
      }
    });
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
      const imagenes = this.nuevoAlbum.imagenes.map(file => ({
        url: URL.createObjectURL(file)
      }));

      this.albumes.push({
        nombre: this.nuevoAlbum.nombre,
        descripcion: this.nuevoAlbum.descripcion,
        imagenes,
        expandido: false
      });

      this.nuevoAlbum = { nombre: '', descripcion: '', imagenes: [] };
      this.cerrarModalAlbum();
    } else {
      alert('El álbum debe tener un nombre y al menos una imagen.');
    }
  }

  toggleAlbum(index: number) {
    this.albumes[index].expandido = !this.albumes[index].expandido;
  }
}
