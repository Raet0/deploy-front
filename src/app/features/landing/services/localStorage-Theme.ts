import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeRepository {
  THEME_KEY = 'app-theme';
  themes = ['light', 'dark', 'coffee'];

  saveTheme(theme: string) {
    const themeJson = JSON.stringify(theme);
    localStorage.setItem(this.THEME_KEY, themeJson);
  }

  getTheme() {
    const themeJson = localStorage.getItem(this.THEME_KEY);
    if (!themeJson) return 'dark';
    return JSON.parse(themeJson);
  }

  // // Temas disponibles

  // // Tema actual reactivo

  // // Obtiene el tema actual desde el atributo HTML
  // private getCurrentTheme(): string {
  //   return document.documentElement.getAttribute('data-theme') ?? 'light';
  // }

  // Cambia el tema y actualiza el atributo global
  setTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    this.saveTheme(theme);
  }
}