// pages/invitationLink/invitationLink.js// pages/invitation/invitation.js
import WxValidate from '../../utils/WxValidate.js'
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const currentPage = 0;
const pageSize = 20;
const timeCurrent = util.formatTime
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    select: false,
    date: "2020-03-04",
    selectList: [],
    // companyArray: ["公司1", "公司2", "公司3"],
    companyArray: [],
    firmList: [],
    causeAeeay: [],
    form: {
      tihuoWay: "",
      officeAddress: "",
      id: "",//公司id
      asterask: "",
      date: ""
    }
  },

  // bindShowMsg() {
  //   this.setData({
  //     select: !this.data.select
  //   })
  // },
  // mySelect(e) {
  //   let name = e.currentTarget.dataset.name;
  //   this.setData({
  //     ["form.tihuoWay"]: name,
  //     select: false
  //   })
  // },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    let datetimes = timeCurrent(timeStamp, "Y/M/D");
    let timeStr = (datetimes.slice(0, 10)).replace(/\//g, "-");
    that.setData({
      ["form.tihuoWay"]: options.firm,
      ["form.date"]: timeStr,
    });
    that.initValidate();
  },


  //请求获取公司列表
  getFirmList: function () {
    const that = this;
    let token = wx.getStorageSync('token');
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_PERSON_MY_COMPANY_BIND",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
        }
      },
      method: 'POST',
      success: function (res) {
        if ("SUCCESS" == res.data.code && "WX_PERSON_MY_COMPANY_BIND" == res.data.type) {
          if (res.data.body.employees.length > 0) {
            let arrayList = [];
            let firmInfo = [];
            res.data.body.employees.forEach((item, index) => {
              let infoJson = {};
              if (!item.companyName) {
                item.companyName = "";
              }
              if (!item.address) {
                item.address = "";
              }
              if (1 == item.defBind) {
                that.setData({
                  ["form.tihuoWay"]: item.companyName,
                  ["form.officeAddress"]: item.address,
                  ["form.id"]: item.id,
                })
              }
              infoJson.name = item.companyName;
              infoJson.address = item.address;
              infoJson.id = item.id;
              arrayList.push(item.companyName);
              firmInfo.push(infoJson);
            })
            that.setData({
              companyArray: arrayList,
              firmList: firmInfo
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_MY_COMPANY_BIND" == res.data.type) {
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

  //发送数据
  sumbInvitation: function (value) {
    const that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading({
      title: '请等待。。。',
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_INVITE_VISIT_IFNO",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          conmpayName: value.tihuoWay,
          officeAddress: value.officeAddress,
          id: value.id,
          visitorType: value.asterask,
          visitStartTime: value.date,
        }
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if ("SUCCESS" == res.data.code && "WX_INVITE_VISIT_IFNO" == res.data.type) {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_INVITE_VISIT_IFNO" == res.data.type) {
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


  //获取公司地址
  // trimOfficeAddress: function(e) {
  //   const that = this;
  //   let value = e.detail.value;
  //   that.setData({
  //     ["form.officeAddress"]: value.replace(/\s+/g, '')
  //   })
  // },

  //获取输入时的访客事由
  // trimAsterask: function(e) {
  //   const that = this;
  //   let value = e.detail.value;
  //   that.setData({
  //     ["form.asterask"]: value.replace(/\s+/g, '')
  //   })
  // },

  //验证表单
  initValidate() {
    let messages = {};
    let rules = {};
    rules = {
      asterask: {
        required: true,
      }
    }
    messages = {
      asterask: {
        required: '请输入访客事由',
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //选择绑定公司
  companySelect: function (e) {
    const that = this;
    that.setData({
      ["form.tihuoWay"]: that.data.firmList[e.detail.value].name,
      ["form.officeAddress"]: that.data.firmList[e.detail.value].address,
      ["form.id"]: that.data.firmList[e.detail.value].id,
    })
  },

  //选择访问事由
  causeSelect: function (e) {
    const that = this;
    that.setData({
      ["form.asterask"]: that.data.causeAeeay[e.detail.value],
    })
  },

  //时间选择器
  dateSelect: function (e) {
    const that = this;
    that.setData({
      ["form.date"]: e.detail.value,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    that.getFirmList();
  },

  //报错 
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    })
  },

  //发送邀请数据
  formSubmit: function (e) {
    let params = e.detail.value;
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0];
      if ("idcard" != error.param) {
        this.showModal(error.msg)
      }
      return false
    } else {
      //发送邀请数据
      that.sumbInvitation(params);
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