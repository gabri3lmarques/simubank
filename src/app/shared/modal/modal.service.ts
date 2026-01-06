// src/app/shared/modal/modal.service.ts
import { Injectable, signal } from '@angular/core';

export type ModalType = 'success' | 'error' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isOpen = signal(false);
  message = signal('');
  modalType = signal<ModalType>('info');

  open(message: string, type: ModalType = 'info') {
    this.message.set(message);
    this.modalType.set(type);
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.message.set('');
  }
}
