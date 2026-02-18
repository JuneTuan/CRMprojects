// server/src/storage/json-storage.ts
import * as fs from 'fs';
import * as path from 'path';

export class JsonStorage {
  private static dataDir = path.join(__dirname, '../../data');

  static ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  static readData<T>(fileName: string): T[] {
    this.ensureDataDirectory();
    const filePath = path.join(this.dataDir, `${fileName}.json`);
    
    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${fileName}:`, error);
      return [];
    }
  }

  static writeData<T>(fileName: string, data: T[]): void {
    this.ensureDataDirectory();
    const filePath = path.join(this.dataDir, `${fileName}.json`);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${fileName}:`, error);
    }
  }

  static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export default JsonStorage;