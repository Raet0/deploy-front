import { CommonModule, DOCUMENT } from '@angular/common'; // 1. Importar DOCUMENT
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ThemeRepository } from '../../../landing/services/localStorage-Theme';

@Component({
  selector: 'app-theme-switcher',
  standalone: true, // Asumí que es standalone por los imports
  imports: [CommonModule],
  templateUrl: './theme-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcher {
  
  // 2. Inyectar el documento para manipular el HTML
  private document = inject(DOCUMENT);
  readonly themeRepository = inject(ThemeRepository);

  // Temas disponibles
  themes = ['light', 'dark'];

  // Tema actual reactivo
  currentTheme = signal<string>(this.getCurrentTheme());

  constructor() {
    // 3. El effect escucha cambios en la señal y aplica el cambio VISUAL
    effect(() => {
      const theme = this.currentTheme();
      
      // ESTA ES LA LÍNEA QUE TE FALTABA:
      this.document.documentElement.setAttribute('data-theme', theme);
      
      // Guardar en localStorage
      this.themeRepository.setTheme(theme);
    });
  }

  private getCurrentTheme(): string {
    // Es buena práctica poner un fallback por si el repo devuelve null
    return this.themeRepository.getTheme() || 'light';
  }

  // 4. Simplificamos setTheme para que solo actualice la señal
  // El effect se encargará del resto automáticamente
  setTheme(theme: string): void {
    this.currentTheme.set(theme);
  }
}