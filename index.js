// 首页逻辑
const db = require('../../utils/db')
const util = require('../../utils/util')

Page({
  data: {
    dailyRecipe: null,
    recentFavorites: [],
    recommendList: [],
    hasMore: true,
    page: 1,
    loading: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 每次显示页面时刷新收藏数据
    this.loadRecentFavorites()
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadData() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      await Promise.all([
        this.loadDailyRecommend(),
        this.loadRecentFavorites(),
        this.loadRecommendList()
      ])
    } catch (err) {
      console.error('加载数据失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  // 加载每日推荐
  async loadDailyRecommend() {
    try {
      const recipe = await db.getDailyRecommend()
      if (recipe) {
        recipe.difficultyText = util.getDifficultyText(recipe.difficulty)
      }
      this.setData({ dailyRecipe: recipe })
    } catch (err) {
      console.error('加载每日推荐失败:', err)
    }
  },

  // 加载最近收藏
  async loadRecentFavorites() {
    try {
      const favorites = await db.getFavorites()
      this.setData({
        recentFavorites: favorites.slice(0, 6)
      })
    } catch (err) {
      console.error('加载收藏失败:', err)
    }
  },

  // 加载推荐列表
  async loadRecommendList(isRefresh = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const page = isRefresh ? 1 : this.data.page
      const result = await db.getRecipes({
        page,
        pageSize: 10
      })
      
      // 添加难度文本
      const list = result.data.map(item => ({
        ...item,
        difficultyText: util.getDifficultyText(item.difficulty)
      }))
      
      this.setData({
        recommendList: isRefresh ? list : [...this.data.recommendList, ...list],
        page: page + 1,
        hasMore: result.hasMore,
        loading: false
      })
    } catch (err) {
      console.error('加载推荐列表失败:', err)
      this.setData({ loading: false })
    }
  },

  // 刷新推荐
  refreshRecommend() {
    this.setData({ page: 1 })
    this.loadRecommendList(true)
  },

  // 跳转搜索
  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
  },

  // 跳转页面
  goToPage(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadRecommendList()
    }
  }
})
