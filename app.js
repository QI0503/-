App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-d4g00jyvs49925c7f', // 云开发环境ID，需要替换
        traceUser: true,
      })
    }

    this.globalData = {}
  },

  globalData: {
    userInfo: null,
    // 用户配置
    userConfig: {
      favorites: [],      // 收藏的菜谱ID
      dislikeFoods: [],   // 忌口食材
      allergies: [],      // 过敏原
    }
  }
})
