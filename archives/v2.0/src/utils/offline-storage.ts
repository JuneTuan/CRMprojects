import Taro from '@tarojs/taro'

export interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  data: any
  timestamp: number
  synced: boolean
}

export interface OfflineData {
  operations: OfflineOperation[]
  lastSyncTime: number
}

const OFFLINE_DATA_KEY = 'offline_data'
const OFFLINE_CACHE_PREFIX = 'offline_cache_'

class OfflineStorage {
  private data: OfflineData = {
    operations: [],
    lastSyncTime: 0
  }

  async init() {
    try {
      const stored = await Taro.getStorage({ key: OFFLINE_DATA_KEY })
      this.data = stored.data || this.data
    } catch (error) {
      this.data = { operations: [], lastSyncTime: 0 }
    }
  }

  async save() {
    await Taro.setStorage({
      key: OFFLINE_DATA_KEY,
      data: this.data
    })
  }

  async addOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'synced'>) {
    const newOperation: OfflineOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false
    }
    this.data.operations.push(newOperation)
    await this.save()
    return newOperation
  }

  async getPendingOperations(): Promise<OfflineOperation[]> {
    return this.data.operations.filter(op => !op.synced)
  }

  async markOperationSynced(operationId: string) {
    const operation = this.data.operations.find(op => op.id === operationId)
    if (operation) {
      operation.synced = true
      await this.save()
    }
  }

  async removeSyncedOperations() {
    this.data.operations = this.data.operations.filter(op => !op.synced)
    await this.save()
  }

  async updateLastSyncTime() {
    this.data.lastSyncTime = Date.now()
    await this.save()
  }

  getLastSyncTime(): number {
    return this.data.lastSyncTime
  }

  async cacheData(key: string, data: any) {
    await Taro.setStorage({
      key: `${OFFLINE_CACHE_PREFIX}${key}`,
      data: {
        data,
        timestamp: Date.now()
      }
    })
  }

  async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await Taro.getStorage({ key: `${OFFLINE_CACHE_PREFIX}${key}` })
      return cached.data.data
    } catch (error) {
      return null
    }
  }

  async clearCache() {
    const info = await Taro.getStorageInfo() as any
    const cacheKeys = (info.keys || []).filter((key: string) => key.startsWith(OFFLINE_CACHE_PREFIX))
    for (const key of cacheKeys) {
      await Taro.removeStorage({ key })
    }
  }

  async clearAll() {
    await Taro.removeStorage({ key: OFFLINE_DATA_KEY })
    await this.clearCache()
    this.data = { operations: [], lastSyncTime: 0 }
  }

  getOperationCount(): number {
    return this.data.operations.filter(op => !op.synced).length
  }
}

export const offlineStorage = new OfflineStorage()
