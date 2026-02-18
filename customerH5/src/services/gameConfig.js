import { ref, computed } from 'vue'
import { lotteryAPI } from '@/api/index.js'

class GameConfigService {
  constructor() {
    this.activityId = null
    this.activityInfo = ref(null)
    this.gameTypes = ref([])
    this.selectedGameType = ref(null)
    this.prizes = ref([])
    
    this.availableGameTypes = computed(() => {
      const gameTypes = this.gameTypes.value || []
      return gameTypes.map(gt => ({
        gameTypeId: gt.gameTypeId,
        gameTypeName: gt.gameTypeName,
        gameTypeCode: gt.gameTypeCode,
        costPoints: gt.costPoints,
        maxDrawCount: gt.maxDrawCount,
        remainingDrawCount: gt.remainingDrawCount,
        config: this.getGameConfig(gt.gameTypeCode)
      }))
    })
    
    this.currentGameItems = computed(() => {
      if (!this.selectedGameType.value) return []
      return this.getGameItems(this.selectedGameType.value.gameTypeCode)
    })
    
    this.currentGameConfig = computed(() => {
      if (!this.selectedGameType.value) return null
      return this.getGameConfig(this.selectedGameType.value.gameTypeCode)
    })
  }

  async loadActivityInfo(activityId) {
    try {
      this.activityId = activityId
      const data = await lotteryAPI.getDrawInfo(activityId)
      this.activityInfo.value = data
      this.gameTypes.value = data.gameTypes || []
      return data
    } catch (error) {
      console.error('加载活动信息失败', error)
      throw error
    }
  }

  selectGameType(gameTypeId) {
    this.selectedGameType.value = this.gameTypes.value.find(
      gt => gt.gameTypeId === gameTypeId
    )
    
    if (this.selectedGameType.value && this.selectedGameType.value.prizes) {
      this.prizes.value = this.selectedGameType.value.prizes
    }
  }

  getGameItems(gameTypeCode) {
    if (!this.selectedGameType.value || !this.selectedGameType.value.prizes) {
      return []
    }

    const prizes = this.selectedGameType.value.prizes || []
    
    switch (gameTypeCode) {
      case 'wheel':
        return prizes.map(prize => ({
          text: prize.prizeName,
          icon: this.getPrizeIcon(prize.prizeType),
          prizeId: prize.prizeId,
          prizeType: prize.prizeType,
          value: prize.value,
          probability: prize.probability
        }))
      case 'slot-machine':
        return prizes.map(prize => ({
          icon: this.getPrizeIcon(prize.prizeType),
          prizeId: prize.prizeId,
          prizeType: prize.prizeType,
          value: prize.value,
          probability: prize.probability
        }))
      case 'blind-box':
        return prizes.map(prize => ({
          text: prize.prizeName,
          icon: this.getPrizeIcon(prize.prizeType),
          prizeId: prize.prizeId,
          prizeType: prize.prizeType,
          value: prize.value,
          probability: prize.probability
        }))
      case 'nine-grid':
        return prizes.map(prize => ({
          icon: this.getPrizeIcon(prize.prizeType),
          prizeId: prize.prizeId,
          prizeType: prize.prizeType,
          value: prize.value,
          probability: prize.probability
        }))
      case 'scratch-card':
        return prizes.map(prize => ({
          text: prize.prizeName,
          icon: this.getPrizeIcon(prize.prizeType),
          prizeId: prize.prizeId,
          prizeType: prize.prizeType,
          value: prize.value,
          probability: prize.probability
        }))
      default:
        return []
    }
  }

  getPrizeIcon(prizeType) {
    const iconMap = {
      '券': '🎫',
      '实物': '🎁',
      '积分': '💰'
    }
    return iconMap[prizeType] || '🎁'
  }

  getGameConfig(gameTypeCode) {
    const configs = {
      'wheel': {
        name: '大转盘',
        icon: '🎡',
        duration: 3000
      },
      'slot-machine': {
        name: '老虎机',
        icon: '🎰',
        duration: 2000
      },
      'blind-box': {
        name: '盲盒',
        icon: '🎁',
        duration: 500
      },
      'nine-grid': {
        name: '九宫格',
        icon: '🎯',
        duration: 3000
      },
      'scratch-card': {
        name: '刮刮乐',
        icon: '🎫',
        duration: 1000
      }
    }
    
    return configs[gameTypeCode] || null
  }

  getAvailableGameTypes() {
    const gameTypes = this.gameTypes.value || []
    return gameTypes.map(gt => ({
      gameTypeId: gt.gameTypeId,
      gameTypeName: gt.gameTypeName,
      gameTypeCode: gt.gameTypeCode,
      costPoints: gt.costPoints,
      maxDrawCount: gt.maxDrawCount,
      remainingDrawCount: gt.remainingDrawCount,
      config: this.getGameConfig(gt.gameTypeCode)
    }))
  }

  getCurrentGameItems() {
    if (!this.selectedGameType.value) return []
    return this.getGameItems(this.selectedGameType.value.gameTypeCode)
  }

  getCurrentGameConfig() {
    if (!this.selectedGameType.value) return null
    return this.getGameConfig(this.selectedGameType.value.gameTypeCode)
  }
}

export default new GameConfigService()
