import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from './shared/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-modal></app-modal>
  `,
  styles: [],
})
export class AppComponent {
  title = 'SimuBank';
}
