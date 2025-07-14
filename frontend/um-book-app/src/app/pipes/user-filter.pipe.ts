import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userFilter',
  standalone: true
})
export class UserFilterPipe implements PipeTransform {
  transform(usuarios: any[], search: string): any[] {
    if (!search) return usuarios;
    const lowerSearch = search.toLowerCase();
    return usuarios.filter(user =>
      user.username.toLowerCase().includes(lowerSearch) ||
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(lowerSearch)
    );
  }
}
