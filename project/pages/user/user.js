// pages/user/user.js
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
    faceImg: '../../images/photo.png',
    name: '',
    phone: '',
    gender: '',
    idcard: '',
    firm:"",
    playQrcode:true,
    imgQrcode:"",
    qrcodeText:"",
    loadingTime: "",
    messageInfo:true,
    newToken: wx.getStorageSync('token'),
  },
  bindFirm:function(){
    const that = this;
    if (that.data.firm == "未绑定企业"){
      wx.showToast({
        title: "您尚未绑定企业,请等待管理员审核！",
        icon: 'none',
        duration: 2000
      })
    }else{
      wx.navigateTo({
        url: '../share/share'
      })
    }
    
  },
  personDetial:function(){
    wx.navigateTo({
      url: '../changeInfo/changeInfo?data='
    })
  },
  
 //我的二维码
  showQrCode:function(){
    const that = this;
    wx.navigateTo({
      url: '../qrcode/qrcode'
    })
  },
  hideInFo: function () {
    let that = this;
    that.setData({
      playQrcode: true
    })
  },

  //跳转邀约访客界面
  inviation:function(){
    const that = this;
    let firm = that.data.firm;
    if ( "未绑定企业" == firm){
       firm = "";
    }
    wx.navigateTo({
      url: '../invitation/invitation?firm=' + firm
    })
  },

  //跳转我的访客界面
  visitor: function () {
    wx.navigateTo({
      url: '../visitor/visitor'
    })
  },

  //跳转我的预约界面
  order: function () {
    wx.navigateTo({
      url: '../order/order'
    })
  },

  //跳转邀请记录界面
  record: function () {
    wx.navigateTo({
      url: '../record/record'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
  },
  getNewToken:function(){
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
            newToken:body.token,
          })
        } 
      }
    })
  },
  
  unTotalAuditCount:function(){
      let unTotalAuditCount = wx.getStorageSync('unTotalAuditCount');
      if (unTotalAuditCount != "0") {
        wx.setTabBarBadge({
          index: 0,
          text: unTotalAuditCount + ""
        })
      } else {
        wx.removeTabBarBadge({
          index: 0,
        });
      }
    },

 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  getUserInfo:function(){
    const that = this;
    let token = wx.getStorageSync('token');
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_PERSON_MY_COMPANY_INFO",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
      },
      success: res => {
        if ("SUCCESS" == res.data.code && "WX_PERSON_MY_COMPANY_INFO" == res.data.type) {
          wx.setStorageSync('examine',"1");
          if (res.data.body.unReadCount > 0){
            that.setData({
              messageInfo:false
            })
          }else{
            that.setData({
              messageInfo: true
            })
          }
          let faceEnabled = wx.getStorageSync('faceEnabled');
          let avatarUrl = wx.getStorageSync('avatarUrl');
          if (!faceEnabled || !res.data.body.faceImg) {
            res.data.body.faceImg = avatarUrl;
          }
          if (!res.data.body.companyName){
            res.data.body.companyName = "未绑定企业";
          }
          let roale = wx.getStorageSync('roleName');
          if ("admin" == roale){
            wx.setNavigationBarTitle({
              title: res.data.body.companyName
            });
            that.setData({
              bindFirms:true,
            })
          }else{
            wx.setNavigationBarTitle({
              title: "小Q园区管家"
            });
          }
          wx.setStorageSync('personImg', res.data.body.faceImg);
          wx.setStorageSync('personName', res.data.body.name);
          wx.setStorageSync('personIdcard', res.data.body.idNo);
          wx.setStorageSync('personPhone', res.data.body.mobilePhone);
          wx.setStorageSync('personGender', res.data.body.sex);
          that.setData({
            faceImg: res.data.body.faceImg,
            name: res.data.body.name,
            idcard: res.data.body.idNo,
            phone: res.data.body.mobilePhone,
            firm: res.data.body.companyName,
            gender:res.data.body.sex
          })
          
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_MY_COMPANY_INFO" == res.data.type){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
        } else if ("ARGS_MISSING" == res.data.code && "token" == res.data.msg){
          wx.showToast({
            title: "小程序信息已过期,即将从新登录",
            icon: 'none',
            duration: 2000
          })
          app.argsmissing = "user"
          setTimeout(() => {
            wx.reLaunch({
              url: '../index/index' 
            })
          }, 1000)
        } else{
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    that.getUserInfo();
    that.getNewToken();
  },
  getPic: function (value) {
    const that = this;
    if ("savedFilePath" == value) {
      let savedFilePath = wx.getStorageSync('savedFilePath');
      if (savedFilePath != "") {
        that.setData({
          faceImg: savedFilePath,
        })
      } else {
        that.getPersonInfo()
      }
    }
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

  }
})