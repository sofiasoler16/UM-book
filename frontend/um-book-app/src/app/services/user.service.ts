import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://127.0.0.1:5000/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUsuarioActual(): Observable<DecodedToken | null> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Token no encontrado');
      return of(null);
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return of(decoded);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return of(null);
    }
  }
}

export interface DecodedToken {
  id: number;
  username: string;
}
