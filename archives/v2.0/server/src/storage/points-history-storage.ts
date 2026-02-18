import JsonStorage from './json-storage';

export interface PointsTransaction {
  id: string;
  customerId: string;
  type: 'earn' | 'spend' | 'refund' | 'adjust';
  amount: number;
  balance: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export class PointsHistoryStorage {
  private static readonly FILE_NAME = 'points-history';

  static findAll(): PointsTransaction[] {
    return JsonStorage.readData<PointsTransaction>(this.FILE_NAME);
  }

  static findById(id: string): PointsTransaction | null {
    const transactions = this.findAll();
    return transactions.find(t => t.id === id) || null;
  }

  static findByCustomerId(customerId: string): PointsTransaction[] {
    const transactions = this.findAll();
    return transactions
      .filter(t => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static create(transactionData: Omit<PointsTransaction, 'id' | 'createdAt'>): PointsTransaction {
    const transactions = this.findAll();
    const newTransaction: PointsTransaction = {
      id: JsonStorage.generateId(),
      ...transactionData,
      createdAt: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    JsonStorage.writeData(this.FILE_NAME, transactions);
    return newTransaction;
  }

  static delete(id: string): boolean {
    const transactions = this.findAll();
    const initialLength = transactions.length;
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length === initialLength) return false;
    
    JsonStorage.writeData(this.FILE_NAME, filteredTransactions);
    return true;
  }

  static getCustomerBalance(customerId: string): number {
    const transactions = this.findByCustomerId(customerId);
    if (transactions.length === 0) return 0;
    
    return transactions[0].balance;
  }
}