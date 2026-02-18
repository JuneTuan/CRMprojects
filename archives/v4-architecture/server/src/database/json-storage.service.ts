import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JsonStorageService {
  private dataDir: string;
  private autoSave: boolean;
  private data: Map<string, any[]>;

  constructor(@Inject(ConfigService) private configService: ConfigService) {
    this.dataDir = this.configService.get('DATA_DIR') || './data';
    this.autoSave = true;
    this.data = new Map();
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private getFilePath(collection: string): string {
    return path.join(this.dataDir, `${collection}.json`);
  }

  private loadData(collection: string): any[] {
    if (this.data.has(collection)) {
      return this.data.get(collection) || [];
    }

    const filePath = this.getFilePath(collection);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        this.data.set(collection, data);
        return data;
      } catch (error) {
        console.error(`Failed to load data for collection ${collection}:`, error);
        return [];
      }
    }

    return [];
  }

  private saveData(collection: string, data: any[]): void {
    this.data.set(collection, data);
    const filePath = this.getFilePath(collection);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save data for collection ${collection}:`, error);
    }
  }

  findAll(collection: string): any[] {
    return this.loadData(collection);
  }

  findOne(collection: string, id: string): any | null {
    const data = this.loadData(collection);
    return data.find(item => item.id === id) || null;
  }

  find(collection: string, predicate: (item: any) => boolean): any[] {
    const data = this.loadData(collection);
    return data.filter(predicate);
  }

  create(collection: string, item: any): any {
    const data = this.loadData(collection);
    const newItem = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item,
    };
    data.push(newItem);
    if (this.autoSave) {
      this.saveData(collection, data);
    }
    return newItem;
  }

  update(collection: string, id: string, updates: Partial<any>): any | null {
    const data = this.loadData(collection);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }
    data[index] = {
      ...data[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    if (this.autoSave) {
      this.saveData(collection, data);
    }
    return data[index];
  }

  delete(collection: string, id: string): boolean {
    const data = this.loadData(collection);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    data.splice(index, 1);
    if (this.autoSave) {
      this.saveData(collection, data);
    }
    return true;
  }

  count(collection: string): number {
    return this.loadData(collection).length;
  }

  clear(collection: string): void {
    this.data.delete(collection);
    const filePath = this.getFilePath(collection);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
