// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // Esto asegura que el servicio esté disponible globalmente
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000';  // Cambiá si tu backend corre en otra URL

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }
  
  register(userData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/users`, userData);
}

}
