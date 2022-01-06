// pages/choosePerson/choosePerson.js
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const app = getApp()
const TITLE_HEIGHT = 30
const ANCHOR_HEIGHT = 18
let currentPage = 0
const pageSize = 10
Page({

  /**
   * 页面的初始数据
   */
  data: {
    visitorContent: false,
    nofind: true,
    scrollHeight: 0,
    inputValue: "",
    appId:"",
    visitorList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    if(options.appId){
        that.setData({
          appId: options.appId
        })
    }
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res);
        // 可使用窗口宽度、高度
        // 计算主体部分高度,单位为px
        that.setData({
          // cameraHeight部分高度 = 利用窗口可使用高度 - 固定高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
          scrollHeight: res.windowHeight - res.windowWidth / 750 * 120 - 30
        })
      }
    });
    currentPage = 0;
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

  },

  //获取我的访客列表数据
  getVisitorList: function (phone) {
    const that = this;
    let token = wx.getStorageSync('token');
    let appIds = that.data.appId;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_APPOINTMENT_COMPANY_INFO",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            appId:appIds,
            phone: phone
          },
          orderBy: [{
            sourceName: "desc"
          }]
        }
      },
      success: res => {
        console.log(res);
        wx.hideLoading();
        if (res.data.code == "SUCCESS" && res.data.type == "WX_APPOINTMENT_COMPANY_INFO") {
          if (res.data.body.visits.length > 0) {
            currentPage++;
            res.data.body.visits.forEach(function (item, index) {
              if (!item.visitStartTime) {
                item.visitStartTime = "";
              } else {
                item.visitStartTime = item.visitStartTime.slice(0, 10);
              }
              if (!item.sourcePhone) {
                item.sourcePhone = "";
              }
              if (!item.sourceName) {
                item.sourceName = "";
              }
              if (!item.visitorType) {
                item.visitorType = "";
              }
            })
            let oldData = that.data.visitorList;
            that.setData({
              visitorList: oldData.concat(res.data.body.visits),
              nofind: true,
              visitorContent: false,
            })
          } else {
            wx.showToast({
              title: "没有数据了",
              icon: 'success',
              duration: 2000
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_APPOINTMENT_COMPANY_INFO" == res.data.type) {
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


  //搜索框文本内容显示
  inputBind: function (event) {
    const that = this;
    // currentPage = 0;
    that.setData({
      inputValue: event.detail.value
    })
  },

  //搜索执行按钮
  query: function () {
    let that = this;
    currentPage = 0;
    that.setData({
      visitorList:[],
    })
    if ("" != that.data.inputValue){
      that.getVisitorList(that.data.inputValue);
    }else{
      wx.showToast({
        title: "请在输入框中输入您的被访问人手机号码!",
        icon: 'none',
        duration: 2000
      })
    }
    /**
     * keyword string 搜索关键词 ; 这里是 this.data.inputValue
     * start int 分页起始值 ; 这里是 0
     */
  },

  //选中列表
  choose: function (e) {
    const that = this;
    console.log(e)
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.id.name;
    let phone = e.currentTarget.dataset.id.phone;
    let firm = e.currentTarget.dataset.id.companyName;
    let wxUserId = e.currentTarget.dataset.id.wxUserId;
    let companyId = e.currentTarget.dataset.id.companyId;
    let openId = e.currentTarget.dataset.id.openId;
    wx.showModal({
      title: '选择被访问人:' + name,
      success(res) {
        if (res.confirm) {
          wx.reLaunch({
            url: '../makeVisitor/makeVisitor?name=' + name + "&phone=" + phone + "&firm=" + firm + "&wxUserId=" + wxUserId + "&companyId=" + companyId + "&openId=" + openId,
          })
        } else if (res.cancel) {
          
        }
      }
    })
  },

  //触底加载
  upper: function (e) {
    const that = this;
    that.getVisitorList(that.data.inputValue);

  },

  scroll: function (e) {
    // console.log(e);
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