import Taro from '@tarojs/taro'

const PROJECT_DOMAIN = ''
const DEFAULT_MAX_RETRY = 3
const RETRY_DELAY = 1000

const getErrorMessage = (statusCode, data) => {
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

const showErrorToast = (message, show = true) => {
    if (show) {
        Taro.showToast({
            title: message,
            icon: 'none',
            duration: 3000
        })
    }
}

const sleep = (ms) => new Promise(function(resolve) { setTimeout(resolve, ms) })

export const Network = {
    createUrl: (url) => {
        if (url.startsWith('/api')) {
            return url
        }
        return `/api${url}`
    },

    getBaseUrl: () => {
        return 'http://localhost:3001'
    },

    request: (option) => {
        const retryCount = option.retryCount || 0
        const maxRetry = option.maxRetry || DEFAULT_MAX_RETRY
        const showErrorMessage = option.showErrorMessage !== false
        const restOption = { ...option }
        delete restOption.retryCount
        delete restOption.maxRetry
        delete restOption.showErrorMessage

        return new Promise(function(resolve, reject) {
            Taro.request({
                ...restOption,
                url: Network.createUrl(restOption.url),
                success: function(res) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res)
                    } else {
                        const errorMessage = getErrorMessage(res.statusCode, res.data)
                        showErrorToast(errorMessage, showErrorMessage)
                        
                        if (retryCount < maxRetry && res.statusCode >= 500) {
                            sleep(RETRY_DELAY * (retryCount + 1)).then(function() {
                                Network.request({
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
                fail: function(err) {
                    const errorMessage = '网络连接失败，请检查网络设置'
                    showErrorToast(errorMessage, showErrorMessage)
                    
                    if (retryCount < maxRetry) {
                        sleep(RETRY_DELAY * (retryCount + 1)).then(function() {
                            Network.request({
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
