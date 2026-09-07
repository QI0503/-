// 我的页面逻辑
const db = require('../../utils/db')

Page({
  data: {
    cookCount: 0,
    favoriteCount: 0,
    streakDays: 0,
    dislikeCount: 0,
    cacheSize: '0KB'
  },

  onLoad() {
    this.loadStats()
    this.calcCacheSize()
  },

  onShow() {
    this.loadStats()
  },

  // 加载统计数据
  async loadStats() {
    try {
      // 获取收藏数量
      const favorites = await db.getFavorites()
      
      // 获取做菜记录数量
      const recordsResult = await db.getCookRecords({ pageSize: 1000 })
      
      // 获取用户配置（忌口）
      const configResult = await wx.cloud.database().collection('user_config').limit(1).get()
      const config = configResult.data[0] || {}
      
      // 计算连续做菜天数
      const streakDays = this.calcStreakDays(recordsResult.data)
      
      this.setData({
        cookCount: recordsResult.total || 0,
        favoriteCount: favorites.length,
        streakDays,
        dislikeCount: (config.dislikeFoods || []).length + (config.allergies || []).length
      })
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  },

  // 计算连续做菜天数
  calcStreakDays(records) {
    if (!records || records.length === 0) return 0
    
    // 按日期排序
    const dates = records
      .map(r => r.cookDate)
      .filter(Boolean)
      .sort()
      .reverse()
    
    if (dates.length === 0) return 0
    
    // 去重
    const uniqueDates = [...new Set(dates)]
    
    let streak = 1
    const today = new Date().toISOString().split('T')[0]
    
    // 检查最近的记录是否是今天或昨天
    const lastDate = uniqueDates[0]
    const diffDays = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
    
    if (diffDays > 1) return 0
    
    // 计算连续天数
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1])
      const curr = new Date(uniqueDates[i])
      const diff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24))
      
      if (diff === 1) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  },

  // 计算缓存大小
  calcCacheSize() {
    try {
      const res = wx.getStorageInfoSync()
      const size = res.currentSize || 0
      
      let sizeText = ''
      if (size >= 1024) {
        sizeText = (size / 1024).toFixed(1) + 'MB'
      } else {
        sizeText = size + 'KB'
      }
      
      this.setData({ cacheSize: sizeText })
    } catch (err) {
      console.error('获取缓存大小失败:', err)
    }
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            this.setData({ cacheSize: '0KB' })
            wx.showToast({ title: '清除成功', icon: 'success' })
          } catch (err) {
            console.error('清除缓存失败:', err)
            wx.showToast({ title: '清除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 跳转页面
  goToPage(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  }
})
