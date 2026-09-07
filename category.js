// 分类页逻辑
const db = require('../../utils/db')
const util = require('../../utils/util')

// 分类数据
const categories = {
  cuisine: [
    { name: '家常菜', icon: '/images/icons/cat_jiachang.png' },
    { name: '川菜', icon: '/images/icons/cat_chuan.png' },
    { name: '粤菜', icon: '/images/icons/cat_yue.png' },
    { name: '湘菜', icon: '/images/icons/cat_xiang.png' },
    { name: '西餐', icon: '/images/icons/cat_xican.png' },
    { name: '日韩料理', icon: '/images/icons/cat_rihan.png' }
  ],
  method: [
    { name: '炒', icon: '/images/icons/method_chao.png' },
    { name: '炖', icon: '/images/icons/method_dun.png' },
    { name: '煮', icon: '/images/icons/method_zhu.png' },
    { name: '蒸', icon: '/images/icons/method_zheng.png' },
    { name: '烤', icon: '/images/icons/method_kao.png' },
    { name: '炸', icon: '/images/icons/method_zha.png' },
    { name: '煎', icon: '/images/icons/method_jian.png' },
    { name: '拌', icon: '/images/icons/method_ban.png' }
  ],
  scene: [
    { name: '早餐', icon: '/images/icons/scene_zaochan.png' },
    { name: '午餐', icon: '/images/icons/scene_wucan.png' },
    { name: '晚餐', icon: '/images/icons/scene_wancan.png' },
    { name: '夜宵', icon: '/images/icons/scene_yexiao.png' },
    { name: '便当', icon: '/images/icons/scene_biandang.png' }
  ]
}

Page({
  data: {
    activeTab: 'cuisine',
    currentCategories: categories.cuisine,
    selectedCategory: '',
    recipeList: [],
    recipeCount: 0,
    hasMore: true,
    page: 1,
    loading: false
  },

  onLoad() {
    this.setData({
      currentCategories: categories.cuisine
    })
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab,
      currentCategories: categories[tab],
      selectedCategory: '',
      recipeList: [],
      page: 1,
      hasMore: true
    })
  },

  // 选择分类
  async selectCategory(e) {
    const name = e.currentTarget.dataset.name
    this.setData({
      selectedCategory: name,
      recipeList: [],
      page: 1,
      hasMore: true,
      loading: true
    })
    
    await this.loadRecipes(true)
  },

  // 清除分类选择
  clearCategory() {
    this.setData({
      selectedCategory: '',
      recipeList: [],
      page: 1,
      hasMore: true
    })
  },

  // 加载菜谱
  async loadRecipes(isRefresh = false) {
    if (this.data.loading && !isRefresh) return
    
    this.setData({ loading: true })
    
    try {
      const { activeTab, selectedCategory, page } = this.data
      const categoryField = `category.${activeTab}`
      
      const result = await db.getRecipes({
        page: isRefresh ? 1 : page,
        pageSize: 10,
        category: selectedCategory
      })
      
      // 添加难度文本
      const list = result.data.map(item => ({
        ...item,
        difficultyText: util.getDifficultyText(item.difficulty)
      }))
      
      this.setData({
        recipeList: isRefresh ? list : [...this.data.recipeList, ...list],
        recipeCount: result.total,
        page: (isRefresh ? 1 : page) + 1,
        hasMore: result.hasMore,
        loading: false
      })
    } catch (err) {
      console.error('加载菜谱失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
  },

  onReachBottom() {
    if (this.data.hasMore && this.data.selectedCategory) {
      this.loadRecipes()
    }
  }
})
