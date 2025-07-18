import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private baseUrl = 'http://localhost:5000'; // Ajustá si usás otro backend

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  enviarSolicitud(receiver_id: number) {
    return this.http.post(`${this.baseUrl}/friends/request`, { receiver_id }, this.getAuthHeaders());
  }

  obtenerSolicitudesRecibidas() {
    return this.http.get(`${this.baseUrl}/friends/received`, this.getAuthHeaders());
  }

  confirmarSolicitud(id: number, action: 'accept' | 'reject') {
    return this.http.put(`${this.baseUrl}/friends/confirm/${id}`, { action }, this.getAuthHeaders());
  }
}
