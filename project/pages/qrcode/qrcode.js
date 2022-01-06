const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date())
const qrcodeUrl = util.qrcodeUrl;
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgQrcode:"",
    loadingTime:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.getNewToken();
  },

  getNewToken: function () {
    const that = this;
    let token = wx.getStorageSync('token');
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_LOGIN_BY_TOKEN",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token
      },
      success: res => {
        let body = res.data.body;
        if ("SUCCESS" == res.data.code && "WX_LOGIN_BY_TOKEN" == res.data.type) {
          that.setData({
            newToken: body.token,
          })
        }
      }
    })
  },
  timneCtr: function () {
    const that = this;
    that.setData({
      loadingTime: setInterval(function () {
        that.getQrcode()
      }, 1000 * 60)
    })
  },

  getQrcode: function () {
    const that = this;
    that.getNewToken();
    let token = that.data.newToken;
    let times = new Date().getTime();
    let bindGroupId = wx.getStorageSync('personGroupId');
    let url = qrcodeUrl + "?token=" + token + "&bindGroupId=" + bindGroupId + "&times=" + times;
    that.setData({
      imgQrcode: url,
      qrcodeText: "二维码有效期1分钟,失效后自动刷新"
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    setTimeout(function () {
      that.getQrcode();
    }, 600);
    that.timneCtr();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    const that = this;
    clearInterval(that.data.loadingTime);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    const that = this;
    clearInterval(that.data.loadingTime);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
})