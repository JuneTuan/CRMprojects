import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import CustomTabBar from '@/components/CustomTabBar'
import { useResponsive, responsive } from '@/utils/responsive'

export default function ImportPage() {
  const [importType, setImportType] = useState<'customer' | 'product'>('customer')
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const { isMobile, breakpoint } = useResponsive()

  const handleChooseFile = async () => {
    try {
      const res = await Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['xlsx', 'xls']
      })

      if (res.tempFiles && res.tempFiles.length > 0) {
        handleImport(res.tempFiles[0])
      }
    } catch (error) {
      console.error('选择文件失败:', error)
    }
  }

  const handleImport = async (file: any) => {
    setLoading(true)
    setImportResult(null)

    try {
      const filePath = file.path

      const url = importType === 'customer' ? '/api/import/customers' : '/api/import/products'

      const res = await Taro.uploadFile({
        url: Network.getBaseUrl() + url,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': Taro.getStorageSync('token') || ''
        }
      })

      const data = JSON.parse(res.data)
      if (data.code === 200) {
        setImportResult(data.data)
        Taro.showToast({
          title: '导入完成',
          icon: 'success'
        })
      } else {
        throw new Error(data.msg || '导入失败')
      }
    } catch (error: any) {
      console.error('导入失败:', error)
      Taro.showToast({
        title: error.message || '导入失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const url = importType === 'customer' 
        ? '/api/import/template/customers' 
        : '/api/import/template/products'

      const res = await Taro.downloadFile({
        url: Network.getBaseUrl() + url,
        header: {
          'Authorization': Taro.getStorageSync('token') || ''
        }
      })

      if (res.statusCode === 200) {
        Taro.openDocument({
          filePath: res.tempFilePath,
          fileType: 'xlsx',
          success: () => {
            console.log('打开模板成功')
          }
        })
      }
    } catch (error) {
      console.error('下载模板失败:', error)
      Taro.showToast({
        title: '下载模板失败',
        icon: 'none'
      })
    }
  }

  return (
    <View className={`import-page min-h-screen bg-gray-50 pb-20 ${responsive.padding[breakpoint]}`}>
      <View className="mb-6">
        <Text className={`block ${responsive.text['2xl']} font-bold text-gray-800 mb-2`}>批量导入</Text>
        <Text className={`block ${responsive.text.md} text-gray-500`}>支持Excel文件批量导入数据</Text>
      </View>

      <View className={`bg-white rounded-2xl ${responsive.padding.lg} shadow-sm mb-6`}>
        <Text className={`block ${responsive.text.lg} font-semibold text-gray-800 mb-4`}>选择导入类型</Text>
        <View className={`flex ${responsive.gap[breakpoint]}`}>
          <Button
            className={`flex-1 py-3 rounded-xl ${responsive.text.md} font-semibold ${
              importType === 'customer' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setImportType('customer')}
          >
            客户数据
          </Button>
          <Button
            className={`flex-1 py-3 rounded-xl ${responsive.text.md} font-semibold ${
              importType === 'product' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setImportType('product')}
          >
            产品数据
          </Button>
        </View>
      </View>

      <View className={`bg-white rounded-2xl ${responsive.padding.lg} shadow-sm mb-6`}>
        <Text className={`block ${responsive.text.lg} font-semibold text-gray-800 mb-4`}>操作步骤</Text>
        <View className={`space-y-3 ${responsive.gap[breakpoint]}`}>
          <View className="flex items-start">
            <View className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center ${responsive.text.sm} font-bold mr-3 mt-0.5">
              1
            </View>
            <View className="flex-1">
              <Text className={`block ${responsive.text.md} text-gray-800`}>下载导入模板</Text>
              <Text className={`block ${responsive.text.sm} text-gray-500 mt-1`}>点击下方按钮下载Excel模板文件</Text>
            </View>
          </View>
          <View className="flex items-start">
            <View className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center ${responsive.text.sm} font-bold mr-3 mt-0.5">
              2
            </View>
            <View className="flex-1">
              <Text className={`block ${responsive.text.md} text-gray-800`}>填写数据</Text>
              <Text className={`block ${responsive.text.sm} text-gray-500 mt-1`}>按照模板格式填写需要导入的数据</Text>
            </View>
          </View>
          <View className="flex items-start">
            <View className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center ${responsive.text.sm} font-bold mr-3 mt-0.5">
              3
            </View>
            <View className="flex-1">
              <Text className={`block ${responsive.text.md} text-gray-800`}>上传文件</Text>
              <Text className={`block ${responsive.text.sm} text-gray-500 mt-1`}>选择填写好的Excel文件进行导入</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={`space-y-4 ${responsive.gap[breakpoint]}`}>
        <Button
          className={`w-full bg-blue-600 text-white rounded-xl py-4 ${responsive.text.md} font-semibold`}
          onClick={handleDownloadTemplate}
        >
          📥 下载导入模板
        </Button>
        <Button
          className={`w-full bg-red-600 text-white rounded-xl py-4 ${responsive.text.md} font-semibold`}
          onClick={handleChooseFile}
          disabled={loading}
        >
          {loading ? '导入中...' : '📤 上传文件导入'}
        </Button>
      </View>

      {importResult && (
        <View className={`mt-6 bg-white rounded-2xl ${responsive.padding.lg} shadow-sm`}>
          <Text className={`block ${responsive.text.lg} font-semibold text-gray-800 mb-4`}>导入结果</Text>
          <View className={`space-y-3 ${responsive.gap[breakpoint]}`}>
            <View className="flex justify-between items-center py-3 border-b border-gray-100">
              <Text className={`${responsive.text.md} text-gray-600`}>成功导入</Text>
              <Text className={`${responsive.text.xl} font-bold text-green-600`}>{importResult.success} 条</Text>
            </View>
            <View className="flex justify-between items-center py-3 border-b border-gray-100">
              <Text className={`${responsive.text.md} text-gray-600`}>导入失败</Text>
              <Text className={`${responsive.text.xl} font-bold text-red-600`}>{importResult.failed} 条</Text>
            </View>
            {importResult.errors && importResult.errors.length > 0 && (
              <View className="mt-4">
                <Text className={`block ${responsive.text.md} font-semibold text-gray-800 mb-2`}>错误详情</Text>
                <View className="bg-red-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                  {importResult.errors.map((error: string, index: number) => (
                    <Text key={index} className={`block ${responsive.text.sm} text-red-600 mb-2`}>
                      {error}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      <CustomTabBar />
    </View>
  )
}
