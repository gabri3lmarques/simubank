// src/app/bank.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { User, Transaction } from './models';
import { ModalService } from './shared/modal/modal.service';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private apiUrl = 'http://localhost:3000'; // json-server default port

  // State management with Signals
  currentUser = signal<User | null>(null);
  userTransactions = signal<Transaction[]>([]);
  isAuthenticated = computed(() => !!this.currentUser());

  constructor(
    private http: HttpClient, 
    private router: Router,
    private modalService: ModalService
  ) {
    // Attempt to load user from session storage on service initialization
    this.loadUserFromSessionStorage();
  }

  private loadUserFromSessionStorage(): void {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
      // Optionally fetch transactions if user is already logged in
      this.fetchTransactions(this.currentUser()!.id).subscribe();
    }
  }

  login(accountId: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?id=${accountId}&password=${password}`)
      .pipe(
        tap(users => {
          if (users.length > 0) {
            const user = users[0];
            this.currentUser.set(user);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            this.fetchTransactions(user.id).subscribe();
            this.router.navigate(['/dashboard']);
          } else {
            this.modalService.open('Invalid Account ID or Password', 'error');
          }
        })
      );
  }

  logout(): void {
    this.currentUser.set(null);
    this.userTransactions.set([]);
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  register(name: string, accountId: string, password: string): Observable<User | null> {
    return this.checkUserExists(accountId).pipe(
      switchMap(exists => {
        if (exists) {
          this.modalService.open('Account ID already exists. Please choose another.', 'error');
          return of(null);
        }

        const newUser: User = {
          id: accountId,
          password: password,
          name: name,
          balance: 0
        };

        return this.http.post<User>(`${this.apiUrl}/users`, newUser).pipe(
          tap(user => {
            // Automatically log in the new user
            this.currentUser.set(user);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            this.router.navigate(['/dashboard']);
            this.modalService.open('Registration successful! Welcome.', 'success');
          })
        );
      })
    );
  }

  private checkUserExists(accountId: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.apiUrl}/users?id=${accountId}`).pipe(
      map(users => users.length > 0)
    );
  }

  fetchTransactions(userId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions?userId=${userId}&_sort=date&_order=desc`)
      .pipe(
        tap(transactions => this.userTransactions.set(transactions))
      );
  }

  deposit(amount: number): Observable<User> {
    const user = this.currentUser();
    if (!user) throw new Error('No user logged in.');

    const newBalance = user.balance + amount;
    return this.updateUserBalance(user.id, newBalance).pipe(
      tap(updatedUser => {
        this.currentUser.set(updatedUser);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.addTransaction(user.id, 'deposit', amount).subscribe();
      }),
      map(() => user) // Return the original user or updated user if needed
    );
  }

  withdraw(amount: number): Observable<User> {
    const user = this.currentUser();
    if (!user) throw new Error('No user logged in.');

    if (user.balance < amount) {
      this.modalService.open('Insufficient balance.', 'error');
      throw new Error('Insufficient balance.');
    }

    const newBalance = user.balance - amount;
    return this.updateUserBalance(user.id, newBalance).pipe(
      tap(updatedUser => {
        this.currentUser.set(updatedUser);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.addTransaction(user.id, 'withdrawal', amount).subscribe();
      }),
      map(() => user) // Return the original user or updated user if needed
    );
  }

  private updateUserBalance(userId: string, newBalance: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, { balance: newBalance });
  }

  private addTransaction(userId: string, type: 'deposit' | 'withdrawal', amount: number): Observable<Transaction> {
    const newTransaction: Omit<Transaction, 'id'> = {
      userId,
      type,
      amount,
      date: new Date().toISOString()
    };
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, newTransaction).pipe(
      tap(transaction => {
        this.userTransactions.update(transactions => [transaction, ...transactions]);
      })
    );
  }
}
