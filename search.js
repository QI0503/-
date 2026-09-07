// 搜索页逻辑
const db = require('../../utils/db')
const util = require('../../utils/util')

Page({
  data: {
    keyword: '',
    searchHistory: [],
    hotKeywords: ['番茄炒蛋', '红烧肉', '可乐鸡翅', '宫保鸡丁', '蛋炒饭', '糖醋排骨', '酸菜鱼', '麻婆豆腐'],
    resultList: [],
    resultCount: 0,
    hasMore: true,
    page: 1,
    loading: false
  },

  onLoad() {
    this.loadSearchHistory()
  },

  // 加载搜索历史
  loadSearchHistory() {
    try {
      const history = wx.getStorageSync('searchHistory') || []
      this.setData({ searchHistory: history })
    } catch (err) {
      console.error('加载搜索历史失败:', err)
    }
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    try {
      let history = wx.getStorageSync('searchHistory') || []
      
      // 去重，最新的放前面
      history = history.filter(item => item !== keyword)
      history.unshift(keyword)
      
      // 最多保存10条
      history = history.slice(0, 10)
      
      wx.setStorageSync('searchHistory', history)
      this.setData({ searchHistory: history })
    } catch (err) {
      console.error('保存搜索历史失败:', err)
    }
  },

  // 输入事件
  onInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })
    
    // 实时搜索（防抖）
    if (keyword) {
      this.debounceSearch()
    } else {
      this.setData({
        resultList: [],
        resultCount: 0,
        page: 1
      })
    }
  },

  // 防抖搜索
  debounceSearch: util.debounce(function () {
    this.doSearch()
  }, 500),

  // 执行搜索
  async doSearch() {
    const { keyword } = this.data
    if (!keyword) return
    
    this.setData({
      loading: true,
      page: 1,
      hasMore: true
    })
    
    try {
      const result = await db.getRecipes({
        keyword,
        page: 1,
        pageSize: 20
      })
      
      this.setData({
        resultList: result.data,
        resultCount: result.total,
        hasMore: result.hasMore,
        loading: false
      })
      
      // 保存搜索历史
      this.saveSearchHistory(keyword)
    } catch (err) {
      console.error('搜索失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '搜索失败', icon: 'none' })
    }
  },

  // 清空关键词
  clearKeyword() {
    this.setData({
      keyword: '',
      resultList: [],
      resultCount: 0,
      page: 1
    })
  },

  // 清空历史
  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({ searchHistory: [] })
        }
      }
    })
  },

  // 从历史搜索
  searchByHistory(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.doSearch()
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  onReachBottom() {
    if (this.data.hasMore && this.data.keyword) {
      this.loadMore()
    }
  },

  // 加载更多
  async loadMore() {
    if (this.data.loading) return
    
    const { keyword, page } = this.data
    
    this.setData({ loading: true })
    
    try {
      const result = await db.getRecipes({
        keyword,
        page: page + 1,
        pageSize: 20
      })
      
      this.setData({
        resultList: [...this.data.resultList, ...result.data],
        page: page + 1,
        hasMore: result.hasMore,
        loading: false
      })
    } catch (err) {
      console.error('加载更多失败:', err)
      this.setData({ loading: false })
    }
  }
})
