// src/app/models.ts

export interface User {
  id: string;
  password?: string; // Optional for when fetched from API to avoid sending it back
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string; // ISO 8601 string
}
