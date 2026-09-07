// 收藏页逻辑
const db = require('../../utils/db')
const util = require('../../utils/util')

Page({
  data: {
    favorites: [],
    loading: false
  },

  onLoad() {
    this.loadFavorites()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadFavorites()
  },

  onPullDownRefresh() {
    this.loadFavorites().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载收藏列表
  async loadFavorites() {
    this.setData({ loading: true })
    
    try {
      const favorites = await db.getFavorites()
      
      // 添加难度文本
      const list = favorites.map(item => ({
        ...item,
        difficultyText: util.getDifficultyText(item.difficulty)
      }))
      
      this.setData({
        favorites: list,
        loading: false
      })
    } catch (err) {
      console.error('加载收藏失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 取消收藏
  async removeFavorite(e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    
    wx.showModal({
      title: '提示',
      content: '确定取消收藏这道菜吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await db.toggleFavorite(id)
            
            // 从列表中移除
            const favorites = [...this.data.favorites]
            favorites.splice(index, 1)
            this.setData({ favorites })
            
            wx.showToast({ title: '已取消收藏', icon: 'success' })
          } catch (err) {
            console.error('取消收藏失败:', err)
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
  },

  // 跳转首页
  goToIndex() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
