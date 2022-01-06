// pages/invitationDetail/invitationDetail.js
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const updataUrl = util.updataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const timeCurrent = util.formatTime
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jump:"",
    visitorInfo:{},
    conmpayName:"",
    officeAddress:"",
    visitorType:"",
    visitStartTime:"",
    invitationToken:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    if(options){
      that.setData({
        visitorInfo: options,
      })
      if (1 == options.visitorType){
        options.visitorType = "面试";
      } else if (2 == options.visitorType){
        options.visitorType = "商务";
      } else if (3 == options.visitorType){
        options.visitorType = "快递";
      } else if (4 == options.visitorType){
        options.visitorType = "外卖";
      } else if (5 == options.visitorType){
        options.visitorType = "送水";
      } else if (6 == options.visitorType) {
        options.visitorType = "送货";
      } else if (7 == options.visitorType) {
        options.visitorType = "装修";
      } else if (0 == options.visitorType) {
        options.visitorType = "其他";
      }
      that.setData({
        conmpayName: options.conmpayName,
        officeAddress: options.officeAddress,
        visitorType: options.visitorType,
        visitStartTime: options.visitStartTime,
      })
    }
    that.getLinkToken();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  jump: function (value) {
    const that = this;
    let roleName = wx.getStorageSync('roleName');
    if ("jump" == value) {
      if (roleName == "admin") {
        wx.switchTab({
          url: '../user/user'
        })
      } else {
        wx.reLaunch({
          url: '../myself/myself'
        })
      }
      that.setData({
        jump: "",
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    let jump = that.data.jump;
    if ("jump" == jump) {
      that.jump(jump)
    } else {
      that.jump("")
    }
  },

  getLinkToken(){
    const that = this;
    let token = wx.getStorageSync('token');
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_INVITATION_TOKEN",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {}
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        if ("SUCCESS" == res.data.code && "WX_INVITATION_TOKEN" == res.data.type) {
          if(res.data.body.invitationToken && '' != res.data.body.invitationToken){
            that.setData({
              invitationToken:res.data.body.invitationToken
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_INVITATION_TOKEN" == res.data.type) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    const that = this;
    let visitorInfo = that.data.visitorInfo;
    let invitationToken = that.data.invitationToken;
    console.log("获取新增token值",invitationToken)
    that.setData({
      jump: "jump",
    })
    return {
      title: '邀请您访问:' + that.data.visitorInfo.conmpayName,
      path: '/pages/index/index?companyName=' + that.data.visitorInfo.conmpayName + "&companyId=" + that.data.visitorInfo.companyId + "&id=" + that.data.visitorInfo.id + "&officeAddress=" + that.data.visitorInfo.officeAddress + "&visitStartTime=" + that.data.visitorInfo.visitStartTime + "&visitorType=" + that.data.visitorInfo.visitorType + "&wxUserId=" + that.data.visitorInfo.wxUserId + "&invitationToken=" + invitationToken,
      imageUrl: '/images/amd.png',
      success() {
        wx.navigateTo({
          url: '../record/record'
        })
      }
    }

  }
})