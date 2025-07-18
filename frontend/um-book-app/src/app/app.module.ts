import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // para usar ngModel
import { HttpClientModule } from '@angular/common/http'; // para hacer peticiones HTTP

// COMPONENTES
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { BuscarUserComponent } from './pages/buscar-user/buscar-user.component';
import { RegistrarseComponent } from './pages/registrarse/registrarse.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BuscarUserComponent,
    RegistrarseComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
