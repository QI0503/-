// 购物清单页逻辑
const db = require('../../utils/db')
const util = require('../../utils/util')

Page({
  data: {
    currentList: null,
    historyLists: [],
    checkedCount: 0,
    totalCount: 0,
    progressPercent: 0
  },

  onLoad() {
    this.loadShoppingLists()
  },

  onShow() {
    this.loadShoppingLists()
  },

  // 加载购物清单
  async loadShoppingLists() {
    try {
      const lists = await db.getShoppingLists()
      
      if (lists.length > 0) {
        // 第一个未完成的作为当前清单
        const currentList = lists.find(list => !list.isCompleted)
        
        // 已完成的作为历史清单
        const historyLists = lists
          .filter(list => list.isCompleted)
          .map(list => ({
            ...list,
            dateText: this.formatDate(list.createdAt),
            expanded: false
          }))
        
        if (currentList) {
          const checkedCount = currentList.items.filter(item => item.checked).length
          const totalCount = currentList.items.length
          const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0
          
          this.setData({
            currentList,
            checkedCount,
            totalCount,
            progressPercent
          })
        } else {
          this.setData({ currentList: null })
        }
        
        this.setData({ historyLists })
      } else {
        this.setData({
          currentList: null,
          historyLists: []
        })
      }
    } catch (err) {
      console.error('加载购物清单失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 切换勾选状态
  async toggleItem(e) {
    const index = e.currentTarget.dataset.index
    const { currentList } = this.data
    
    if (!currentList) return
    
    const item = currentList.items[index]
    const newChecked = !item.checked
    
    try {
      await db.updateShoppingItemCheck(currentList._id, index, newChecked)
      
      // 更新本地数据
      currentList.items[index].checked = newChecked
      
      const checkedCount = currentList.items.filter(i => i.checked).length
      const totalCount = currentList.items.length
      const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0
      
      this.setData({
        currentList,
        checkedCount,
        totalCount,
        progressPercent
      })
    } catch (err) {
      console.error('更新勾选状态失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 完成清单
  async completeList() {
    const { currentList, totalCount, checkedCount } = this.data
    
    if (!currentList) return
    
    if (checkedCount < totalCount) {
      wx.showModal({
        title: '提示',
        content: `还有${totalCount - checkedCount}项未完成，确定完成清单吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.markListComplete()
          }
        }
      })
    } else {
      await this.markListComplete()
    }
  },

  // 标记清单完成
  async markListComplete() {
    const { currentList } = this.data
    
    try {
      await wx.cloud.database().collection('shopping_lists').doc(currentList._id).update({
        data: { isCompleted: true }
      })
      
      wx.showToast({ title: '清单已完成', icon: 'success' })
      this.loadShoppingLists()
    } catch (err) {
      console.error('完成清单失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 展开/收起历史清单
  expandList(e) {
    const index = e.currentTarget.dataset.index
    const historyLists = [...this.data.historyLists]
    historyLists[index].expanded = !historyLists[index].expanded
    
    this.setData({ historyLists })
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return util.formatDate(date)
  }
})
