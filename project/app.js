//app.js
const APP_ID = 'wx960b9c007f135229'; //输入小程序appid  
const APP_SECRET = 'e7b528f7c06ba0604b6af5900e857071'; //输入小程序app_secret 
const util = require('utils/util.js')
const dataUrl = util.dataUrl
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
App({
  onLaunch: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    deletePerson:false,
    upData:false,
    argsmissing:"",
  }
})