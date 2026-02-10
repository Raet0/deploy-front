import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ThemeRepository } from '../../services/localStorage-Theme';

@Component({
  selector: 'app-theme-switcher',
  imports: [CommonModule],
  templateUrl: './theme-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcher {
    constructor() {
    effect(() => {
      this.setTheme(this.currentTheme());
    });
  }

  // Temas disponibles
  themes = ['light', 'dark'];
  readonly themeRepository = inject(ThemeRepository);

  // Tema actual reactivo
  currentTheme = signal<string>(this.getCurrentTheme());

  // Obtiene el tema actual desde el atributo HTML
  private getCurrentTheme(): string {
    const theme = this.themeRepository.getTheme();
    return theme;
  }

  // Cambia el tema y actualiza el atributo global
  setTheme(theme: string): void {
    this.currentTheme.set(theme);
    this.themeRepository.setTheme(theme);
  }
}
