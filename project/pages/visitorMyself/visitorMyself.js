// pages/visitorMyself/visitorMyself.js
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
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
    firm: "",
    imgQrcode: "",
    qrcodeText: "",
    loadingTime: "",
    newToken: wx.getStorageSync('token'),
  },

  bindFirm: function () {
    const that = this;
    if ("未绑定企业" == that.data.firm) {
      wx.showToast({
        title: "您尚未绑定企业,请先提交您的个人信息！",
        icon: 'none',
        duration: 2000
      })
    } else if ("正在审核中" == that.data.firm) {
      wx.showToast({
        title: "您尚未绑定企业,请等待管理员审核！",
        icon: 'none',
        duration: 2000
      })
    } else if ("审核未通过" == that.data.firm) {
      wx.showToast({
        title: "您的审核未通过,请通过分享链接重新提交个人信息！",
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.navigateTo({
        url: '../share/share'
      })
    }
  },
  personDetial: function () {
    wx.navigateTo({
      url: '../changeInfo/changeInfo'
    })
  },


  //跳转邀约访客界面
  inviation: function () {
    const that = this;
    let firm = that.data.firm;
    if ("未绑定企业" == firm) {
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
    that.getUserInfo();
    that.getNewToken();
    let updataUrl = wx.getStorageSync('updataUrl');
    if (updataUrl) {
      that.setData({
        faceImg: updataUrl,
      })
    }
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  getQrcode: function () {
    const that = this;
    that.getNewToken();
    let token = that.data.newToken;
    let times = new Date().getTime();
    let bindGroupId = wx.getStorageSync('personGroupId');
    let url = qrcodeUrl + "?token=" + token + "&bindGroupId=" + bindGroupId + "&times=" + times;
    // wx.request({
    //   url: url,
    //   method: "POST",
    //   success: res => {
    that.setData({
      imgQrcode: url,
      qrcodeText: "二维码有效期1分钟，失效后自动刷新"
    })
    //   }
    // })
  },
  getUserInfo: function () {
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
          wx.hideLoading();
          let faceEnabled = wx.getStorageSync('faceEnabled');
          let avatarUrl = wx.getStorageSync('avatarUrl');
          let firm = "";
          if (0 == res.data.body.bindStatus) {
            firm = "正在审核中"
          } else if (1 == res.data.body.bindStatus) {
            firm = res.data.body.companyName
          } else if (2 == res.data.body.bindStatus) {
            firm = "审核未通过"
          } else {
            firm = "未绑定企业"
          }
          wx.setStorageSync('personImg', res.data.body.faceImg);
          if (faceEnabled && !res.data.body.faceImg) {
            res.data.body.faceImg = avatarUrl
          }
          if (!faceEnabled) {
            res.data.body.faceImg = avatarUrl
          }
          if (!res.data.body.name) {
            res.data.body.name = "请完善个人信息"
          }
          wx.setStorageSync('personName', res.data.body.name);
          wx.setStorageSync('personIdcard', res.data.body.idNo);
          wx.setStorageSync('personPhone', res.data.body.mobilePhone);
          wx.setStorageSync('personGender', res.data.body.sex);
          that.setData({
            faceImg: res.data.body.faceImg,
            name: res.data.body.name,
            firm: firm
          })
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_MY_COMPANY_INFO" == res.data.type) {
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
   * 生命周期函数--监听页面显示
   */
  timneCtr: function (value) {
    const that = this;
    that.setData({
      loadingTime: setInterval(function () {
        that.getUserInfo();
        that.getQrcode()
      }, 1000 * 60)
    })
  },
  onShow: function () {
    const that = this;
    that.getUserInfo();
    setTimeout(function () {
      that.getQrcode();
    }, 600);
    that.timneCtr();
    that.sendCode();
  },
  sendCode: function (e) {
    var that = this;
    var i = setInterval(function () {
      let firm = that.data.firm;
      if (firm !== "正在审核中") {
        clearInterval(i)
      } else {
        that.getUserInfo();
      }
    }, 1000)
  },
  refresh: function (value) {
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
  onPullDownRefresh: function (e) {
    const that = this;
    wx.showLoading({
      title: '正在更新用户信息中。。。',
    })
    that.getUserInfo();
    wx.stopPullDownRefresh()
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