export interface Foto {
  id: number;
  titulo: string;
  url: string;
  fecha_subida: string;
  album_id?: number;
  usuario_id: number;
}
