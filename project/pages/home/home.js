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
    "shareDes": "邀请员工填写登记信息，审核通过后可以通行",
    "registrationDes": "登记员工信息，完成登记后可通行",
    "managementDes": "查看已登记的员工，删除离职人员",
    advertising:false,
    invitationToken:'',
    carouselList: [{
        "img": '../../images/banner.png'
      }
    ]
  },
  /**
   * 事件处理 
   **/
  registration: function() {
    wx.navigateTo({
      url: '../information/information'　
    })
  },
  management: function() {
    console.log("员工管理");
    wx.navigateTo({
      url: '../employees/employees'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this;
    let  unTotalAuditCount = wx.getStorageSync('unTotalAuditCount');
    if (unTotalAuditCount != "0") {
      wx.setTabBarBadge({
        index: 0,
        text: unTotalAuditCount
      })
    }else{
      wx.removeTabBarBadge({
        index: 0,
      });
    }
    that.getLinkToken();
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let corporateName = wx.getStorageSync('corporateName');
    wx.setNavigationBarTitle({
      title: corporateName
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const that = this;
    let personGroupId = wx.getStorageSync('personGroupId');
    let companyName = wx.getStorageSync('corporateName');
    console.log("获取请求的参数",that.data.invitationToken);
    return {
      title: '邀请您加入:' + companyName,
      path: '/pages/index/index?personGroupId=' + personGroupId + "&companyName=" + companyName + "&invitationToken="+that.data.invitationToken,
      imageUrl: '/images/amd.png'
    }
  },
})