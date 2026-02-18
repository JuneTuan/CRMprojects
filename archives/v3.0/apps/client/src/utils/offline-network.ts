import { Network } from '@/network'
import { offlineStorage, OfflineOperation } from './offline-storage'
import Taro from '@tarojs/taro'

export interface NetworkOptions {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  skipOffline?: boolean
}

export class OfflineNetwork {
  private isOnline = true

  constructor() {
    this.initNetworkListener()
  }

  private initNetworkListener() {
    Taro.onNetworkStatusChange((res) => {
      this.isOnline = res.isConnected
    })

    Taro.getNetworkType({
      success: (res) => {
        this.isOnline = res.networkType !== 'none'
      }
    })
  }

  async request(options: NetworkOptions): Promise<any> {
    const { url, method, data, header, skipOffline = false } = options

    if (this.isOnline || skipOffline) {
      try {
        return await Network.request({ url, method, data, header })
      } catch (error) {
        if (!skipOffline && this.shouldCacheOperation(method)) {
          await this.cacheOfflineOperation(url, method, data)
          throw new Error('网络请求失败，数据已保存到离线队列')
        }
        throw error
      }
    } else {
      if (this.shouldCacheOperation(method)) {
        await this.cacheOfflineOperation(url, method, data)
        throw new Error('当前离线，数据已保存到离线队列')
      } else {
        throw new Error('当前离线，无法获取数据')
      }
    }
  }

  private shouldCacheOperation(method: string): boolean {
    return ['POST', 'PUT', 'DELETE'].includes(method)
  }

  private async cacheOfflineOperation(url: string, method: string, data: any) {
    const resource = this.extractResource(url)
    const operationType = method.toLowerCase() as 'create' | 'update' | 'delete'

    await offlineStorage.addOperation({
      type: operationType,
      resource,
      data
    })
  }

  private extractResource(url: string): string {
    const match = url.match(/\/api\/([^\/]+)/)
    return match ? match[1] : 'unknown'
  }

  async getCachedData(key: string): Promise<any | null> {
    return await offlineStorage.getCachedData(key)
  }

  async cacheData(key: string, data: any) {
    await offlineStorage.cacheData(key, data)
  }

  isNetworkOnline(): boolean {
    return this.isOnline
  }

  async checkNetworkStatus(): Promise<boolean> {
    return new Promise((resolve) => {
      Taro.getNetworkType({
        success: (res) => {
          this.isOnline = res.networkType !== 'none'
          resolve(this.isOnline)
        },
        fail: () => {
          this.isOnline = false
          resolve(false)
        }
      })
    })
  }
}

export const offlineNetwork = new OfflineNetwork()
