import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://127.0.0.1:5000/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

interface DecodedToken {
  id: number;
  username: string;
}

const token = localStorage.getItem('access_token');
const decoded: DecodedToken = jwtDecode(token!);  // ! porque sabemos que existe

const currentUserId = decoded.id;
