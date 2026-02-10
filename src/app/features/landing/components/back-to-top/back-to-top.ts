import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  imports: [],
  templateUrl: './back-to-top.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackToTop {
  // Signal que controla la visibilidad del botón
  isVisible = signal(false);

  // Detecta el desplazamiento vertical para mostrar el botón
  @HostListener('window:scroll', [])
  onScroll(): void {
    this.isVisible.set(window.scrollY > 300);
  }

  // Smooth scroll back to top
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
