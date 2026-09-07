// 菜谱详情页逻辑
const db = require('../../utils/db')
const util = require('../../utils/util')

Page({
  data: {
    recipe: null,
    isFavorite: false,
    difficultyText: '',
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.loadRecipe(options.id)
    }
  },

  onShow() {
    // 检查收藏状态
    if (this.data.recipe) {
      this.checkFavoriteStatus()
    }
  },

  // 加载菜谱详情
  async loadRecipe(id) {
    this.setData({ loading: true })
    
    try {
      const recipe = await db.getRecipeDetail(id)
      
      this.setData({
        recipe,
        difficultyText: util.getDifficultyText(recipe.difficulty),
        loading: false
      })
      
      // 检查收藏状态
      this.checkFavoriteStatus()
    } catch (err) {
      console.error('加载菜谱详情失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 检查收藏状态
  async checkFavoriteStatus() {
    try {
      const favorites = await db.getFavorites()
      const isFavorite = favorites.some(item => item._id === this.data.recipe._id)
      this.setData({ isFavorite })
    } catch (err) {
      console.error('检查收藏状态失败:', err)
    }
  },

  // 切换收藏
  async toggleFavorite() {
    try {
      const result = await db.toggleFavorite(this.data.recipe._id)
      this.setData({ isFavorite: result })
      
      wx.showToast({
        title: result ? '已收藏' : '已取消收藏',
        icon: 'success'
      })
    } catch (err) {
      console.error('收藏操作失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 加入购物清单
  addToShoppingList() {
    const { recipe } = this.data
    
    wx.showModal({
      title: '生成购物清单',
      content: `将"${recipe.name}"的食材加入购物清单？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await db.createShoppingList({
              name: recipe.name,
              recipeIds: [recipe._id],
              items: recipe.ingredients.map(item => ({
                name: item.name,
                amount: item.amount,
                unit: item.unit,
                checked: false
              }))
            })
            
            wx.showToast({ title: '已生成购物清单', icon: 'success' })
          } catch (err) {
            console.error('生成购物清单失败:', err)
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 添加做菜记录
  addCookRecord() {
    const { recipe } = this.data
    wx.navigateTo({
      url: `/pages/add-record/add-record?id=${recipe._id}&name=${recipe.name}`
    })
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 分享
  onShareAppMessage() {
    const { recipe } = this.data
    return {
      title: recipe.name,
      path: `/pages/recipe-detail/recipe-detail?id=${recipe._id}`
    }
  }
})
