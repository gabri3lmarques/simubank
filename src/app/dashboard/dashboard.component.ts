// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankService } from '../bank.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalService } from '../shared/modal/modal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] // Placeholder for eventual CSS
})
export class DashboardComponent implements OnInit {
  depositAmount: number | null = null;
  withdrawAmount: number | null = null;

  // Expose signals from BankService
  currentUser = this.bankService.currentUser;
  userTransactions = this.bankService.userTransactions;

  constructor(
    private bankService: BankService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    if (!this.bankService.isAuthenticated()) {
      this.router.navigate(['/login']);
    } else {
      // Ensure transactions are loaded if not already
      if (this.userTransactions().length === 0 && this.currentUser()) {
        this.bankService.fetchTransactions(this.currentUser()!.id).subscribe();
      }
    }
  }

  onDeposit(): void {
    if (!this.depositAmount || this.depositAmount <= 0) {
      this.modalService.open('Deposit amount must be greater than zero.', 'error');
      return;
    }
    this.bankService.deposit(this.depositAmount).subscribe({
      next: () => {
        this.modalService.open('Deposit successful!', 'success');
        this.depositAmount = null;
      },
      error: (err) => {
        console.error('Deposit error', err);
        this.modalService.open('Deposit failed. Please try again.', 'error');
      }
    });
  }

  onWithdraw(): void {
    if (!this.withdrawAmount || this.withdrawAmount <= 0) {
      this.modalService.open('Withdrawal amount must be greater than zero.', 'error');
      return;
    }
    this.bankService.withdraw(this.withdrawAmount).subscribe({
      next: () => {
        this.modalService.open('Withdrawal successful!', 'success');
        this.withdrawAmount = null;
      },
      error: (err) => {
        // Error message for insufficient balance is already handled by the service
        if (err.message !== 'Insufficient balance.') {
            console.error('Withdrawal error', err);
            this.modalService.open('Withdrawal failed. Please try again.', 'error');
        }
      }
    });
  }

  onLogout(): void {
    this.bankService.logout();
  }
}
