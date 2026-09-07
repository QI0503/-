// 做菜记录页逻辑
const db = require('../../utils/db')
const util = require('../../utils.util')

Page({
  data: {
    records: [],
    totalCount: 0,
    thisMonthCount: 0,
    streakDays: 0,
    hasMore: true,
    page: 1,
    loading: false
  },

  onLoad() {
    this.loadStats()
    this.loadRecords(true)
  },

  onShow() {
    this.loadStats()
    this.loadRecords(true)
  },

  onPullDownRefresh() {
    this.loadStats()
    this.loadRecords(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载统计数据
  async loadStats() {
    try {
      const result = await db.getCookRecords({ pageSize: 1000 })
      const records = result.data
      
      // 总次数
      const totalCount = result.total
      
      // 本月次数
      const now = new Date()
      const thisMonth = `${now.getFullYear()}-${util.padZero(now.getMonth() + 1)}`
      const thisMonthCount = records.filter(r => r.cookDate && r.cookDate.startsWith(thisMonth)).length
      
      // 连续做菜天数
      const streakDays = this.calcStreakDays(records)
      
      this.setData({
        totalCount,
        thisMonthCount,
        streakDays
      })
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  },

  // 计算连续做菜天数
  calcStreakDays(records) {
    if (!records || records.length === 0) return 0
    
    const dates = records
      .map(r => r.cookDate)
      .filter(Boolean)
      .sort()
      .reverse()
    
    if (dates.length === 0) return 0
    
    const uniqueDates = [...new Set(dates)]
    
    let streak = 1
    const today = new Date().toISOString().split('T')[0]
    
    const lastDate = uniqueDates[0]
    const diffDays = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24))
    
    if (diffDays > 1) return 0
    
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

  // 加载记录
  async loadRecords(isRefresh = false) {
    if (this.data.loading && !isRefresh) return
    
    this.setData({ loading: true })
    
    try {
      const page = isRefresh ? 1 : this.data.page
      
      const result = await db.getCookRecords({
        page,
        pageSize: 20
      })
      
      // 格式化日期
      const records = result.data.map(record => ({
        ...record,
        cookDateText: record.cookDate || '未知日期'
      }))
      
      this.setData({
        records: isRefresh ? records : [...this.data.records, ...records],
        page: page + 1,
        hasMore: result.hasMore,
        loading: false
      })
    } catch (err) {
      console.error('加载记录失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore) {
      this.loadRecords()
    }
  },

  // 跳转添加
  goToAdd() {
    wx.navigateTo({ url: '/pages/add-record/add-record' })
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
  }
})
