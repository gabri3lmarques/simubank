// src/app/shared/modal/modal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  // Expose signals from the service to the template
  isOpen = this.modalService.isOpen;
  message = this.modalService.message;
  modalType = this.modalService.modalType;

  constructor(private modalService: ModalService) {}

  closeModal() {
    this.modalService.close();
  }
}
