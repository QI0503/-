// 营养统计页逻辑
const db = require('../../utils/db')
const util = require('../../utils.util')

Page({
  data: {
    activeTab: 'daily',
    currentDate: '',
    currentWeekText: '',
    isToday: true,
    isThisWeek: true,
    
    // 目标值
    targetCalories: 2000,
    targetProtein: 60,
    targetFat: 65,
    targetCarbs: 300,
    
    // 今日数据
    dailyNutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    dailyCaloriesPercent: 0,
    dailyProteinPercent: 0,
    dailyFatPercent: 0,
    dailyCarbsPercent: 0,
    todayRecipes: [],
    
    // 本周数据
    weeklyNutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    weeklyAvg: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    weeklyChart: []
  },

  onLoad() {
    this.initDate()
    this.loadDailyData()
  },

  onShow() {
    if (this.data.activeTab === 'daily') {
      this.loadDailyData()
    } else {
      this.loadWeeklyData()
    }
  },

  // 初始化日期
  initDate() {
    const today = new Date()
    this.setData({
      currentDate: util.formatDate(today),
      currentWeekText: this.getWeekText(today),
      isToday: true,
      isThisWeek: true
    })
  },

  // 获取周文本
  getWeekText(date) {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay() + 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    
    return `${util.formatDate(start)} - ${util.formatDate(end)}`
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    
    if (tab === 'daily') {
      this.loadDailyData()
    } else {
      this.loadWeeklyData()
    }
  },

  // 前一天
  prevDay() {
    const current = new Date(this.data.currentDate)
    current.setDate(current.getDate() - 1)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    this.setData({
      currentDate: util.formatDate(current),
      isToday: current.getTime() >= today.getTime()
    })
    
    this.loadDailyData()
  },

  // 后一天
  nextDay() {
    if (this.data.isToday) return
    
    const current = new Date(this.data.currentDate)
    current.setDate(current.getDate() + 1)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    this.setData({
      currentDate: util.formatDate(current),
      isToday: current.getTime() >= today.getTime()
    })
    
    this.loadDailyData()
  },

  // 上一周
  prevWeek() {
    const current = this.parseWeekText(this.data.currentWeekText)
    current.start.setDate(current.start.getDate() - 7)
    current.end.setDate(current.end.getDate() - 7)
    
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1)
    thisWeekStart.setHours(0, 0, 0, 0)
    
    this.setData({
      currentWeekText: `${util.formatDate(current.start)} - ${util.formatDate(current.end)}`,
      isThisWeek: current.start.getTime() >= thisWeekStart.getTime()
    })
    
    this.loadWeeklyData()
  },

  // 下一周
  nextWeek() {
    if (this.data.isThisWeek) return
    
    const current = this.parseWeekText(this.data.currentWeekText)
    current.start.setDate(current.start.getDate() + 7)
    current.end.setDate(current.end.getDate() + 7)
    
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1)
    thisWeekStart.setHours(0, 0, 0, 0)
    
    this.setData({
      currentWeekText: `${util.formatDate(current.start)} - ${util.formatDate(current.end)}`,
      isThisWeek: current.start.getTime() >= thisWeekStart.getTime()
    })
    
    this.loadWeeklyData()
  },

  // 解析周文本
  parseWeekText(text) {
    const parts = text.split(' - ')
    return {
      start: new Date(parts[0]),
      end: new Date(parts[1])
    }
  },

  // 加载今日数据
  async loadDailyData() {
    try {
      const date = this.data.currentDate
      
      // 获取今日的做菜记录
      const recordsResult = await db.getCookRecords({ pageSize: 100 })
      const todayRecords = recordsResult.data.filter(record => record.cookDate === date)
      
      // 计算营养总和
      const dailyNutrition = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      }
      
      const todayRecipes = []
      
      for (const record of todayRecords) {
        try {
          const recipe = await db.getRecipeDetail(record.recipeId)
          if (recipe && recipe.nutritionPerServing) {
            dailyNutrition.calories += recipe.nutritionPerServing.calories || 0
            dailyNutrition.protein += recipe.nutritionPerServing.protein || 0
            dailyNutrition.fat += recipe.nutritionPerServing.fat || 0
            dailyNutrition.carbs += recipe.nutritionPerServing.carbs || 0
            
            todayRecipes.push({
              ...record,
              nutritionText: `${recipe.nutritionPerServing.calories}千卡`
            })
          }
        } catch (err) {
          console.error('获取菜谱详情失败:', err)
        }
      }
      
      // 计算百分比
      const dailyCaloriesPercent = Math.min(100, Math.round((dailyNutrition.calories / this.data.targetCalories) * 100))
      const dailyProteinPercent = Math.min(100, Math.round((dailyNutrition.protein / this.data.targetProtein) * 100))
      const dailyFatPercent = Math.min(100, Math.round((dailyNutrition.fat / this.data.targetFat) * 100))
      const dailyCarbsPercent = Math.min(100, Math.round((dailyNutrition.carbs / this.data.targetCarbs) * 100))
      
      this.setData({
        dailyNutrition,
        dailyCaloriesPercent,
        dailyProteinPercent,
        dailyFatPercent,
        dailyCarbsPercent,
        todayRecipes
      })
    } catch (err) {
      console.error('加载今日数据失败:', err)
    }
  },

  // 加载本周数据
  async loadWeeklyData() {
    try {
      const weekRange = this.parseWeekText(this.data.currentWeekText)
      
      // 获取所有记录
      const recordsResult = await db.getCookRecords({ pageSize: 1000 })
      
      // 筛选本周的记录
      const weeklyRecords = recordsResult.data.filter(record => {
        const recordDate = new Date(record.cookDate)
        return recordDate >= weekRange.start && recordDate <= weekRange.end
      })
      
      // 计算每日数据
      const dailyData = {}
      const days = ['日', '一', '二', '三', '四', '五', '六']
      
      for (let d = new Date(weekRange.start); d <= weekRange.end; d.setDate(d.getDate() + 1)) {
        const dateStr = util.formatDate(d)
        dailyData[dateStr] = {
          date: dateStr,
          day: days[d.getDay()],
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0
        }
      }
      
      // 填充数据
      for (const record of weeklyRecords) {
        if (dailyData[record.cookDate]) {
          try {
            const recipe = await db.getRecipeDetail(record.recipeId)
            if (recipe && recipe.nutritionPerServing) {
              dailyData[record.cookDate].calories += recipe.nutritionPerServing.calories || 0
              dailyData[record.cookDate].protein += recipe.nutritionPerServing.protein || 0
              dailyData[record.cookDate].fat += recipe.nutritionPerServing.fat || 0
              dailyData[record.cookDate].carbs += recipe.nutritionPerServing.carbs || 0
            }
          } catch (err) {
            console.error('获取菜谱详情失败:', err)
          }
        }
      }
      
      // 转换为数组
      const weeklyChart = Object.values(dailyData)
      
      // 计算最大热量用于百分比
      const maxCalories = Math.max(...weeklyChart.map(d => d.calories), 1)
      
      weeklyChart.forEach(item => {
        item.percent = Math.round((item.calories / maxCalories) * 100)
      })
      
      // 计算汇总
      const weeklyNutrition = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      }
      
      weeklyChart.forEach(item => {
        weeklyNutrition.calories += item.calories
        weeklyNutrition.protein += item.protein
        weeklyNutrition.fat += item.fat
        weeklyNutrition.carbs += item.carbs
      })
      
      const weeklyAvg = {
        calories: Math.round(weeklyNutrition.calories / 7),
        protein: Math.round(weeklyNutrition.protein / 7),
        fat: Math.round(weeklyNutrition.fat / 7),
        carbs: Math.round(weeklyNutrition.carbs / 7)
      }
      
      this.setData({
        weeklyChart,
        weeklyNutrition,
        weeklyAvg
      })
    } catch (err) {
      console.error('加载本周数据失败:', err)
    }
  },

  // 跳转详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
  }
})
