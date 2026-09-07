/**
 * 数据库操作工具
 */

const db = wx.cloud.database()
const _ = db.command

/**
 * 获取菜谱列表
 */
const getRecipes = async (params = {}) => {
  const { page = 1, pageSize = 20, category, keyword, difficulty } = params
  
  let query = db.collection('recipes').where({
    isDeleted: false
  })
  
  // 分类筛选
  if (category) {
    query = query.where({
      'category.cuisine': category
    })
  }
  
  // 关键词搜索
  if (keyword) {
    query = query.where(_.or([
      { name: db.RegExp({ regexp: keyword, options: 'i' }) },
      { tags: db.RegExp({ regexp: keyword, options: 'i' }) }
    ]))
  }
  
  // 难度筛选
  if (difficulty) {
    query = query.where({ difficulty })
  }
  
  try {
    const countResult = await query.count()
    const total = countResult.total
    
    const result = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createdAt', 'desc')
      .get()
    
    return {
      data: result.data,
      total,
      hasMore: page * pageSize < total
    }
  } catch (err) {
    console.error('获取菜谱列表失败:', err)
    throw err
  }
}

/**
 * 获取菜谱详情
 */
const getRecipeDetail = async (id) => {
  try {
    const result = await db.collection('recipes').doc(id).get()
    return result.data
  } catch (err) {
    console.error('获取菜谱详情失败:', err)
    throw err
  }
}

/**
 * 获取每日推荐
 */
const getDailyRecommend = async () => {
  try {
    const countResult = await db.collection('recipes').where({
      isDeleted: false
    }).count()
    
    const total = countResult.total
    const randomIndex = Math.floor(Math.random() * Math.min(total, 50))
    
    const result = await db.collection('recipes')
      .where({ isDeleted: false })
      .skip(randomIndex)
      .limit(1)
      .get()
    
    return result.data[0] || null
  } catch (err) {
    console.error('获取每日推荐失败:', err)
    throw err
  }
}

/**
 * 获取收藏列表
 */
const getFavorites = async () => {
  try {
    const configResult = await db.collection('user_config').limit(1).get()
    const config = configResult.data[0]
    
    if (!config || !config.favorites || config.favorites.length === 0) {
      return []
    }
    
    const result = await db.collection('recipes').where({
      _id: _.in(config.favorites),
      isDeleted: false
    }).get()
    
    return result.data
  } catch (err) {
    console.error('获取收藏列表失败:', err)
    throw err
  }
}

/**
 * 切换收藏状态
 */
const toggleFavorite = async (recipeId) => {
  try {
    const configResult = await db.collection('user_config').limit(1).get()
    const config = configResult.data[0]
    
    if (!config) {
      // 创建配置
      await db.collection('user_config').add({
        data: {
          favorites: [recipeId],
          dislikeFoods: [],
          allergies: [],
          totalCookCount: 0
        }
      })
      return true
    }
    
    const isFavorite = config.favorites.includes(recipeId)
    
    if (isFavorite) {
      // 取消收藏
      await db.collection('user_config').doc(config._id).update({
        data: {
          favorites: _.pull(recipeId)
        }
      })
      return false
    } else {
      // 添加收藏
      await db.collection('user_config').doc(config._id).update({
        data: {
          favorites: _.addToSet(recipeId)
        }
      })
      return true
    }
  } catch (err) {
    console.error('切换收藏状态失败:', err)
    throw err
  }
}

/**
 * 获取做菜记录
 */
const getCookRecords = async (params = {}) => {
  const { page = 1, pageSize = 20, recipeId } = params
  
  let query = db.collection('cook_records')
  
  if (recipeId) {
    query = query.where({ recipeId })
  }
  
  try {
    const countResult = await query.count()
    const total = countResult.total
    
    const result = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('cookDate', 'desc')
      .get()
    
    return {
      data: result.data,
      total,
      hasMore: page * pageSize < total
    }
  } catch (err) {
    console.error('获取做菜记录失败:', err)
    throw err
  }
}

/**
 * 添加做菜记录
 */
const addCookRecord = async (data) => {
  try {
    const result = await db.collection('cook_records').add({
      data: {
        ...data,
        createdAt: new Date()
      }
    })
    return result._id
  } catch (err) {
    console.error('添加做菜记录失败:', err)
    throw err
  }
}

/**
 * 获取购物清单
 */
const getShoppingLists = async () => {
  try {
    const result = await db.collection('shopping_lists')
      .orderBy('createdAt', 'desc')
      .get()
    return result.data
  } catch (err) {
    console.error('获取购物清单失败:', err)
    throw err
  }
}

/**
 * 创建购物清单
 */
const createShoppingList = async (data) => {
  try {
    const result = await db.collection('shopping_lists').add({
      data: {
        ...data,
        isCompleted: false,
        createdAt: new Date()
      }
    })
    return result._id
  } catch (err) {
    console.error('创建购物清单失败:', err)
    throw err
  }
}

/**
 * 更新购物清单项勾选状态
 */
const updateShoppingItemCheck = async (listId, itemIndex, checked) => {
  try {
    const listResult = await db.collection('shopping_lists').doc(listId).get()
    const list = listResult.data
    
    list.items[itemIndex].checked = checked
    
    await db.collection('shopping_lists').doc(listId).update({
      data: {
        items: list.items
      }
    })
  } catch (err) {
    console.error('更新购物清单项失败:', err)
    throw err
  }
}

module.exports = {
  getRecipes,
  getRecipeDetail,
  getDailyRecommend,
  getFavorites,
  toggleFavorite,
  getCookRecords,
  addCookRecord,
  getShoppingLists,
  createShoppingList,
  updateShoppingItemCheck
}
