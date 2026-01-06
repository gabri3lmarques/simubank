// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankService } from '../bank.service';
import { Router } from '@angular/router';
import { ModalService } from '../shared/modal/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Placeholder for eventual CSS
})
export class LoginComponent {
  accountId: string = '';
  password: string = '';
  name: string = '';
  isRegisterMode = false;

  constructor(
    private bankService: BankService,
    private router: Router,
    private modalService: ModalService
  ) {
    // If already authenticated, redirect to dashboard
    if (this.bankService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
  }

  onSubmit(): void {
    if (this.isRegisterMode) {
      this.onRegister();
    } else {
      this.onLogin();
    }
  }

  private onLogin(): void {
    if (!this.accountId || !this.password) {
      this.modalService.open('Please enter both Account ID and Password.', 'error');
      return;
    }
    this.bankService.login(this.accountId, this.password).subscribe({
      error: (err) => {
        console.error('Login error', err);
        this.modalService.open('An error occurred during login. Please try again later.', 'error');
      }
    });
  }

  private onRegister(): void {
    if (!this.name || !this.accountId || !this.password) {
      this.modalService.open('Please fill in all fields: Name, Account ID, and Password.', 'error');
      return;
    }
    this.bankService.register(this.name, this.accountId, this.password).subscribe({
      next: (user) => {
        if (user) {
          console.log('Registration successful');
        }
      },
      error: (err) => {
        console.error('Registration error', err);
        this.modalService.open('An error occurred during registration. Please try again later.', 'error');
      }
    });
  }
}
