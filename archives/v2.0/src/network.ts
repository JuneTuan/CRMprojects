import Taro from '@tarojs/taro'

interface RequestOptions extends Omit<Taro.request.Option, 'url'> {
    url: string
    retryCount?: number
    maxRetry?: number
    showErrorMessage?: boolean
}

interface UploadFileOptions extends Omit<Taro.uploadFile.Option, 'url'> {
    url: string
    retryCount?: number
    maxRetry?: number
    showErrorMessage?: boolean
}

interface DownloadFileOptions extends Omit<Taro.downloadFile.Option, 'url'> {
    url: string
    retryCount?: number
    maxRetry?: number
    showErrorMessage?: boolean
}

const DEFAULT_MAX_RETRY = 3
const RETRY_DELAY = 1000

const getErrorMessage = (statusCode: number, data?: any): string => {
    if (data && data.msg) {
        return data.msg
    }
    
    switch (statusCode) {
        case 400:
            return '请求参数错误'
        case 401:
            return '未授权，请重新登录'
        case 403:
            return '拒绝访问'
        case 404:
            return '请求的资源不存在'
        case 500:
            return '服务器内部错误'
        case 502:
            return '网关错误'
        case 503:
            return '服务不可用'
        case 504:
            return '网关超时'
        default:
            return '网络请求失败'
    }
}

const showErrorToast = (message: string, show: boolean = true) => {
    if (show) {
        Taro.showToast({
            title: message,
            icon: 'none',
            duration: 3000
        })
    }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export namespace Network {
    const createUrl = (url: string): string => {
        if (process.env.NODE_ENV === 'development') {
            if (url.startsWith('/api')) {
                return url
            }
            return `/api${url}`
        }
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        return `${PROJECT_DOMAIN}${url}`
    }

    export const getBaseUrl = (): string => {
        if (process.env.NODE_ENV === 'development') {
            return 'http://localhost:3001'
        }
        return PROJECT_DOMAIN || ''
    }

    export const request = (option: RequestOptions): Promise<Taro.request.SuccessCallbackResult> => {
        const {
            retryCount = 0,
            maxRetry = DEFAULT_MAX_RETRY,
            showErrorMessage = true,
            ...restOption
        } = option

        return new Promise((resolve, reject) => {
            Taro.request({
                ...restOption,
                url: createUrl(restOption.url),
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res)
                    } else {
                        const errorMessage = getErrorMessage(res.statusCode, res.data)
                        showErrorToast(errorMessage, showErrorMessage)
                        
                        if (retryCount < maxRetry && res.statusCode >= 500) {
                            sleep(RETRY_DELAY * (retryCount + 1)).then(() => {
                                request({
                                    ...option,
                                    retryCount: retryCount + 1
                                }).then(resolve).catch(reject)
                            })
                        } else {
                            reject({
                                statusCode: res.statusCode,
                                message: errorMessage,
                                data: res.data
                            })
                        }
                    }
                },
                fail: (err) => {
                    const errorMessage = '网络连接失败，请检查网络设置'
                    showErrorToast(errorMessage, showErrorMessage)
                    
                    if (retryCount < maxRetry) {
                        sleep(RETRY_DELAY * (retryCount + 1)).then(() => {
                            request({
                                ...option,
                                retryCount: retryCount + 1
                            }).then(resolve).catch(reject)
                        })
                    } else {
                        reject({
                            statusCode: 0,
                            message: errorMessage,
                            data: err
                        })
                    }
                }
            })
        })
    }

    export const uploadFile = (option: UploadFileOptions): Promise<Taro.uploadFile.SuccessCallbackResult> => {
        const {
            retryCount = 0,
            maxRetry = DEFAULT_MAX_RETRY,
            showErrorMessage = true,
            ...restOption
        } = option

        return new Promise((resolve, reject) => {
            Taro.uploadFile({
                ...restOption,
                url: createUrl(restOption.url),
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res)
                    } else {
                        const errorMessage = getErrorMessage(res.statusCode)
                        showErrorToast(errorMessage, showErrorMessage)
                        
                        if (retryCount < maxRetry && res.statusCode >= 500) {
                            sleep(RETRY_DELAY * (retryCount + 1)).then(() => {
                                uploadFile({
                                    ...option,
                                    retryCount: retryCount + 1
                                }).then(resolve).catch(reject)
                            })
                        } else {
                            reject({
                                statusCode: res.statusCode,
                                message: errorMessage,
                                data: res.data
                            })
                        }
                    }
                },
                fail: (err) => {
                    const errorMessage = '文件上传失败，请检查网络设置'
                    showErrorToast(errorMessage, showErrorMessage)
                    
                    if (retryCount < maxRetry) {
                        sleep(RETRY_DELAY * (retryCount + 1)).then(() => {
                            uploadFile({
                                ...option,
                                retryCount: retryCount + 1
                            }).then(resolve).catch(reject)
                        })
                    } else {
                        reject({
                            statusCode: 0,
                            message: errorMessage,
                            data: err
                        })
                    }
                }
            })
        })
    }

    export const downloadFile = (option: DownloadFileOptions): Promise<Taro.downloadFile.FileSuccessCallbackResult> => {
        const {
            retryCount = 0,
            maxRetry = DEFAULT_MAX_RETRY,
            showErrorMessage = true,
            ...restOption
        } = option

        return new Promise((resolve, reject) => {
            Taro.downloadFile({
                ...restOption,
                url: createUrl(restOption.url),
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res)
                    } else {
                        const errorMessage = getErrorMessage(res.statusCode)
                        showErrorToast(errorMessage, showErrorMessage)
                        
                        if (retryCount < maxRetry && res.statusCode >= 500) {
                            sleep(RETRY_DELAY * (retryCount + 1)).then(() => {
                                downloadFile({
                                    ...option,
                                    retryCount: retryCount + 1
                                }).then(resolve).catch(reject)
                            })
                        } else {
                            reject({
                                statusCode: res.statusCode,
                                message: errorMessage
                            })
                        }
                    }
                },
                fail: (err) => {
                    const errorMessage = '文件下载失败，请检查网络设置'
                    showErrorToast(errorMessage, showErrorMessage)
                    
                    if (retryCount < maxRetry) {
                        sleep(RETRY_DELAY * (retryCount + 1)).then(() => {
                            downloadFile({
                                ...option,
                                retryCount: retryCount + 1
                            }).then(resolve).catch(reject)
                        })
                    } else {
                        reject({
                            statusCode: 0,
                            message: errorMessage,
                            data: err
                        })
                    }
                }
            })
        })
    }
}
