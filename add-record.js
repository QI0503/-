// 添加做菜记录页逻辑
const db = require('../../utils/db')
const util = require('../../utils.util')

Page({
  data: {
    selectedRecipe: null,
    cookDate: '',
    photo: '',
    note: '',
    showPicker: false,
    pickerList: [],
    allRecipes: [],
    searchKeyword: '',
    canSubmit: false
  },

  onLoad(options) {
    // 初始化日期为今天
    this.setData({
      cookDate: util.formatDate(new Date())
    })
    
    // 如果传入了菜谱ID，自动选择
    if (options.id && options.name) {
      this.setData({
        selectedRecipe: {
          _id: options.id,
          name: decodeURIComponent(options.name),
          coverImage: options.cover || ''
        }
      })
      this.updateCanSubmit()
    }
    
    // 加载所有菜谱
    this.loadAllRecipes()
  },

  // 加载所有菜谱
  async loadAllRecipes() {
    try {
      const result = await db.getRecipes({ pageSize: 1000 })
      this.setData({
        allRecipes: result.data,
        pickerList: result.data
      })
    } catch (err) {
      console.error('加载菜谱失败:', err)
    }
  },

  // 显示菜谱选择器
  showRecipePicker() {
    this.setData({
      showPicker: true,
      searchKeyword: '',
      pickerList: this.data.allRecipes
    })
  },

  // 隐藏菜谱选择器
  hideRecipePicker() {
    this.setData({ showPicker: false })
  },

  // 阻止冒泡
  stopPropagation() {},

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    const { allRecipes } = this.data
    
    let pickerList = allRecipes
    if (keyword) {
      pickerList = allRecipes.filter(recipe =>
        recipe.name.includes(keyword) ||
        (recipe.tags && recipe.tags.some(tag => tag.includes(keyword)))
      )
    }
    
    this.setData({
      searchKeyword: keyword,
      pickerList
    })
  },

  // 选择菜谱
  selectRecipe(e) {
    const index = e.currentTarget.dataset.index
    const recipe = this.data.pickerList[index]
    
    this.setData({
      selectedRecipe: {
        _id: recipe._id,
        name: recipe.name,
        coverImage: recipe.coverImage
      },
      showPicker: false
    })
    
    this.updateCanSubmit()
  },

  // 更换菜谱
  changeRecipe() {
    this.showRecipePicker()
  },

  // 日期变化
  onDateChange(e) {
    this.setData({ cookDate: e.detail.value })
    this.updateCanSubmit()
  },

  // 选择照片
  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({ photo: tempFilePath })
        this.updateCanSubmit()
      }
    })
  },

  // 预览照片
  previewPhoto() {
    if (this.data.photo) {
      wx.previewImage({
        current: this.data.photo,
        urls: [this.data.photo]
      })
    }
  },

  // 删除照片
  deletePhoto() {
    this.setData({ photo: '' })
  },

  // 输入感受
  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  // 更新提交状态
  updateCanSubmit() {
    const { selectedRecipe, cookDate } = this.data
    this.setData({
      canSubmit: selectedRecipe && cookDate
    })
  },

  // 提交记录
  async submitRecord() {
    const { selectedRecipe, cookDate, photo, note, canSubmit } = this.data
    
    if (!canSubmit) {
      wx.showToast({ title: '请选择菜谱和日期', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '保存中...' })
    
    try {
      // 上传照片
      let photoUrl = ''
      if (photo) {
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath: `cook_records/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`,
          filePath: photo
        })
        photoUrl = uploadResult.fileID
      }
      
      // 保存记录
      await db.addCookRecord({
        recipeId: selectedRecipe._id,
        recipeName: selectedRecipe.name,
        cookDate,
        photo: photoUrl,
        note
      })
      
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      console.error('保存记录失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
