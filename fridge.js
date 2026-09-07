// 冰箱推荐页逻辑
const db = require('../../utils/db')
const util = require('../../utils/util')

// 食材分类数据
const ingredientCategories = [
  {
    name: '蔬菜',
    items: ['番茄', '土豆', '茄子', '黄瓜', '白菜', '青椒', '洋葱', '胡萝卜', '西兰花', '豆角', '生菜', '菠菜']
  },
  {
    name: '肉类',
    items: ['猪肉', '牛肉', '鸡肉', '鸡翅', '排骨', '五花肉', '里脊肉', '鸡腿', '鸭肉', '羊肉']
  },
  {
    name: '海鲜',
    items: ['虾', '鱼', '螃蟹', '蛤蜊', '鱿鱼', '带鱼', '三文鱼', '鲈鱼', '龙虾', '扇贝']
  },
  {
    name: '蛋奶豆',
    items: ['鸡蛋', '豆腐', '牛奶', '酸奶', '芝士', '豆浆', '豆皮', '腐竹', '鹌鹑蛋', '咸鸭蛋']
  },
  {
    name: '主食',
    items: ['米饭', '面条', '面粉', '馒头', '饺子皮', '粉丝', '年糕', '意面', '面包', '糯米']
  },
  {
    name: '调料',
    items: ['葱', '姜', '蒜', '辣椒', '花椒', '八角', '酱油', '醋', '料酒', '蚝油']
  }
]

Page({
  data: {
    ingredientCategories,
    activeCategory: '蔬菜',
    currentIngredients: ingredientCategories[0].items.map(name => ({ name, selected: false })),
    selectedIngredients: [],
    recommendList: [],
    searched: false,
    loading: false
  },

  // 切换分类
  switchCategory(e) {
    const name = e.currentTarget.dataset.name
    const category = ingredientCategories.find(c => c.name === name)
    
    if (category) {
      const currentIngredients = category.items.map(item => ({
        name: item,
        selected: this.data.selectedIngredients.includes(item)
      }))
      
      this.setData({
        activeCategory: name,
        currentIngredients
      })
    }
  },

  // 切换食材选择
  toggleIngredient(e) {
    const name = e.currentTarget.dataset.name
    const { selectedIngredients, currentIngredients } = this.data
    
    const index = selectedIngredients.indexOf(name)
    if (index > -1) {
      selectedIngredients.splice(index, 1)
    } else {
      selectedIngredients.push(name)
    }
    
    // 更新当前列表的选中状态
    const updatedIngredients = currentIngredients.map(item => ({
      ...item,
      selected: selectedIngredients.includes(item.name)
    }))
    
    this.setData({
      selectedIngredients,
      currentIngredients: updatedIngredients
    })
  },

  // 移除食材
  removeIngredient(e) {
    const name = e.currentTarget.dataset.name
    const { selectedIngredients, currentIngredients } = this.data
    
    const index = selectedIngredients.indexOf(name)
    if (index > -1) {
      selectedIngredients.splice(index, 1)
    }
    
    // 更新当前列表的选中状态
    const updatedIngredients = currentIngredients.map(item => ({
      ...item,
      selected: selectedIngredients.includes(item.name)
    }))
    
    this.setData({
      selectedIngredients,
      currentIngredients: updatedIngredients
    })
  },

  // 清空选择
  clearAll() {
    const currentIngredients = this.data.currentIngredients.map(item => ({
      ...item,
      selected: false
    }))
    
    this.setData({
      selectedIngredients: [],
      currentIngredients,
      recommendList: [],
      searched: false
    })
  },

  // 获取推荐
  async getRecommendations() {
    const { selectedIngredients } = this.data
    
    if (selectedIngredients.length === 0) {
      wx.showToast({ title: '请先选择食材', icon: 'none' })
      return
    }
    
    this.setData({ loading: true, searched: true })
    
    try {
      // 获取所有菜谱
      const result = await db.getRecipes({ pageSize: 1000 })
      
      // 计算每个菜谱与已选食材的匹配度
      const recipesWithMatch = result.data.map(recipe => {
        const ingredientNames = recipe.ingredients.map(i => i.name)
        const matchCount = selectedIngredients.filter(item => 
          ingredientNames.some(name => name.includes(item) || item.includes(name))
        ).length
        
        return {
          ...recipe,
          matchCount,
          difficultyText: util.getDifficultyText(recipe.difficulty)
        }
      })
      
      // 过滤出有匹配的菜谱，并按匹配度排序
      const recommendList = recipesWithMatch
        .filter(recipe => recipe.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
      
      this.setData({
        recommendList,
        loading: false
      })
    } catch (err) {
      console.error('获取推荐失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '获取推荐失败', icon: 'none' })
    }
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
  }
})
