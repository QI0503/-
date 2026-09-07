/**
 * 工具函数
 */

/**
 * 格式化日期
 */
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${padZero(month)}-${padZero(day)}`
}

/**
 * 格式化时间
 */
const formatTime = (date) => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${padZero(hour)}:${padZero(minute)}:${padZero(second)}`
}

/**
 * 补零
 */
const padZero = (n) => {
  return n.toString().padStart(2, '0')
}

/**
 * 生成唯一ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 防抖函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
const throttle = (fn, delay = 300) => {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

/**
 * 计算营养成分总和
 */
const calcTotalNutrition = (recipes) => {
  const total = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0
  }
  
  recipes.forEach(recipe => {
    if (recipe.nutritionPerServing) {
      total.calories += recipe.nutritionPerServing.calories || 0
      total.protein += recipe.nutritionPerServing.protein || 0
      total.fat += recipe.nutritionPerServing.fat || 0
      total.carbs += recipe.nutritionPerServing.carbs || 0
      total.fiber += recipe.nutritionPerServing.fiber || 0
    }
  })
  
  return total
}

/**
 * 获取难度文本
 */
const getDifficultyText = (level) => {
  const texts = {
    1: '新手友好',
    2: '简单',
    3: '中等',
    4: '较难',
    5: '大厨级'
  }
  return texts[level] || '未知'
}

/**
 * 获取难度星级数组
 */
const getDifficultyStars = (level) => {
  return Array.from({ length: 5 }, (_, i) => i < level)
}

module.exports = {
  formatDate,
  formatTime,
  padZero,
  generateId,
  debounce,
  throttle,
  calcTotalNutrition,
  getDifficultyText,
  getDifficultyStars
}
