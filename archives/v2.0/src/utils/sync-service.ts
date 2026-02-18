import { Network } from '@/network'
import { offlineStorage, OfflineOperation } from './offline-storage'

export interface SyncResult {
  success: number
  failed: number
  errors: string[]
}

export class SyncService {
  private isSyncing = false

  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('同步正在进行中')
    }

    this.isSyncing = true
    const result: SyncResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    try {
      const pendingOperations = await offlineStorage.getPendingOperations()

      for (const operation of pendingOperations) {
        try {
          await this.syncOperation(operation)
          await offlineStorage.markOperationSynced(operation.id)
          result.success++
        } catch (error: any) {
          result.failed++
          result.errors.push(`${operation.resource} ${operation.type}: ${error.message}`)
        }
      }

      await offlineStorage.removeSyncedOperations()
      await offlineStorage.updateLastSyncTime()

      return result
    } finally {
      this.isSyncing = false
    }
  }

  private async syncOperation(operation: OfflineOperation): Promise<void> {
    const { type, resource, data } = operation

    switch (resource) {
      case 'customer':
        await this.syncCustomer(type, data)
        break
      case 'product':
        await this.syncProduct(type, data)
        break
      case 'order':
        await this.syncOrder(type, data)
        break
      case 'staff':
        await this.syncStaff(type, data)
        break
      default:
        throw new Error(`未知的资源类型: ${resource}`)
    }
  }

  private async syncCustomer(type: string, data: any): Promise<void> {
    switch (type) {
      case 'create':
        await Network.request({
          url: '/api/customer',
          method: 'POST',
          data
        })
        break
      case 'update':
        await Network.request({
          url: `/api/customer/${data.id}`,
          method: 'PUT',
          data
        })
        break
      case 'delete':
        await Network.request({
          url: `/api/customer/${data.id}`,
          method: 'DELETE'
        })
        break
    }
  }

  private async syncProduct(type: string, data: any): Promise<void> {
    switch (type) {
      case 'create':
        await Network.request({
          url: '/api/product',
          method: 'POST',
          data
        })
        break
      case 'update':
        await Network.request({
          url: `/api/product/${data.id}`,
          method: 'PUT',
          data
        })
        break
      case 'delete':
        await Network.request({
          url: `/api/product/${data.id}`,
          method: 'DELETE'
        })
        break
    }
  }

  private async syncOrder(type: string, data: any): Promise<void> {
    switch (type) {
      case 'create':
        await Network.request({
          url: '/api/order',
          method: 'POST',
          data
        })
        break
      case 'update':
        await Network.request({
          url: `/api/order/${data.id}`,
          method: 'PUT',
          data
        })
        break
      case 'delete':
        await Network.request({
          url: `/api/order/${data.id}`,
          method: 'DELETE'
        })
        break
    }
  }

  private async syncStaff(type: string, data: any): Promise<void> {
    switch (type) {
      case 'create':
        await Network.request({
          url: '/api/staff',
          method: 'POST',
          data
        })
        break
      case 'update':
        await Network.request({
          url: `/api/staff/${data.id}`,
          method: 'PUT',
          data
        })
        break
      case 'delete':
        await Network.request({
          url: `/api/staff/${data.id}`,
          method: 'DELETE'
        })
        break
    }
  }

  async syncWithRetry(maxRetries: number = 3): Promise<SyncResult> {
    let lastError: any
    let retryCount = 0

    while (retryCount < maxRetries) {
      try {
        return await this.sync()
      } catch (error: any) {
        lastError = error
        retryCount++

        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      }
    }

    throw lastError
  }

  isSyncInProgress(): boolean {
    return this.isSyncing
  }

  async getPendingCount(): Promise<number> {
    const operations = await offlineStorage.getPendingOperations()
    return operations.length
  }

  async getLastSyncTime(): Promise<number> {
    return offlineStorage.getLastSyncTime()
  }
}

export const syncService = new SyncService()
