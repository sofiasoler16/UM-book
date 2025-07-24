import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subir-foto',
  templateUrl: './subir-foto.component.html',
  styleUrls: ['./subir-foto.component.css'],
  imports: [FormsModule],
})
export class SubirFotoComponent {
  titulo = '';
  url = '';
  albumId: number | null = null;

  constructor(private http: HttpClient) {}

  subirFoto() {
    const fotoData: any = {
      titulo: this.titulo,
      url: this.url
    };

    if (this.albumId) {
      fotoData.album_id = this.albumId;
    }

    this.http.post('http://127.0.0.1:5000/fotos', fotoData).subscribe({
      next: (response) => {
        alert('Foto subida correctamente');
        this.titulo = '';
        this.url = '';
        this.albumId = null;
      },
      error: (err) => {
        console.error(err);
        alert('Error al subir la foto');
      }
    });
  }
}
