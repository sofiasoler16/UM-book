import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';

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
  urlPublicacion: string = '';

  nuevoAlbum: {
    nombre: string;
    descripcion: string;
    imagenes: string[]; // URLs de imágenes
  } = {
    nombre: '',
    descripcion: '',
    imagenes: []
  };

  albumes: {
    id?: number;
    nombre: string;
    descripcion: string;
    imagenes: { url: string }[];
    expandido: boolean;
  }[] = [];

  constructor(
    private userService: UserService,
    private http: HttpClient
  ) {}

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

    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Cargar publicaciones (fotos sin álbum)
    this.http.get<any[]>(`http://127.0.0.1:5000/fotos/usuario/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (fotos) => {
        this.publicaciones = fotos
          .filter(f => !f.album_id)
          .map(foto => ({
            titulo: foto.titulo,
            fecha: foto.fecha || 'Desconocida',
            imagen: foto.url
          }));
      },
      error: (err) => {
        console.error('Error al cargar fotos:', err);
      }
    });

    // Cargar álbumes
    this.http.get<any[]>(`http://127.0.0.1:5000/albums/usuario/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (albums) => {
        this.albumes = albums.map((album: any) => ({
          id: album.id,
          nombre: album.titulo,
          descripcion: album.descripcion,
          imagenes: album.fotos.map((f: { url: string }) => ({ url: f.url })),
          expandido: false
        }));
      },
      error: (err) => {
        console.error('Error al cargar álbumes:', err);
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

  publicar() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (this.nuevaPublicacion.trim() && this.urlPublicacion.trim()) {
      const body = {
        titulo: this.nuevaPublicacion,
        url: this.urlPublicacion,
        album_id: null
      };

      this.http.post('http://127.0.0.1:5000/fotos', body, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.publicaciones.push({
            titulo: this.nuevaPublicacion,
            fecha: new Date().toLocaleDateString(),
            imagen: this.urlPublicacion
          });
          this.nuevaPublicacion = '';
          this.urlPublicacion = '';
          this.cerrarModalPublicacion();
        },
        error: (err) => {
          console.error('Error al subir la publicación:', err);
        }
      });
    }
  }

  abrirModalAlbum() {
    this.mostrarModalAlbum = true;
  }

  cerrarModalAlbum() {
    this.mostrarModalAlbum = false;
  }

  agregarImagenUrl(): void {
    this.nuevoAlbum.imagenes.push('');
  }

  crearAlbum() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (this.nuevoAlbum.nombre.trim() && this.nuevoAlbum.imagenes.length > 0) {
      const albumBody = {
        titulo: this.nuevoAlbum.nombre,
        descripcion: this.nuevoAlbum.descripcion
      };

      this.http.post<any>('http://127.0.0.1:5000/albums', albumBody, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res) => {
          const albumId = res.album_id;
          const imagenes = this.nuevoAlbum.imagenes;

          const peticiones = imagenes.map(url =>
            this.http.post('http://127.0.0.1:5000/fotos', {
              titulo: 'Imagen',
              url,
              album_id: albumId
            }, {
              headers: { Authorization: `Bearer ${token}` }
            })
          );

          Promise.all(peticiones.map(p => p.toPromise()))
            .then(() => {
              this.albumes.push({
                nombre: this.nuevoAlbum.nombre,
                descripcion: this.nuevoAlbum.descripcion,
                imagenes: imagenes.map(url => ({ url })),
                expandido: false
              });

              this.nuevoAlbum = { nombre: '', descripcion: '', imagenes: [] };
              this.cerrarModalAlbum();
            })
            .catch((err) => {
              console.error('Error al subir imágenes del álbum:', err);
            });
        },
        error: (err) => {
          console.error('Error al crear álbum:', err);
        }
      });
    } else {
      alert('El álbum debe tener un nombre y al menos una imagen.');
    }
  }

  toggleAlbum(index: number) {
    this.albumes[index].expandido = !this.albumes[index].expandido;
  }
}
