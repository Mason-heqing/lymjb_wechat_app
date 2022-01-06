const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const currentPage = 0;
const pageSize = 20;
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ifName: false,
    setName: "",
    face_list: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
      success: function(res) {
        if ("SUCCESS" == res.data.code && "WX_PERSON_MY_COMPANY_BIND" == res.data.type) {
          if (res.data.body.employees.length>0){
            res.data.body.employees.forEach((item,index)=>{
              if ( 1 == item.defBind){
                wx.setNavigationBarTitle({
                  title: item.companyName
                });
              }
            })
          }
          that.setData({
            face_list: res.data.body.employees
          })
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_MY_COMPANY_BIND" == res.data.type){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  addBind: function() {
    let that = this;
    that.setData({
      ifName: true,
    })
  },
  cancel: function() {
    let that = this;
    that.setData({
      ifName: false,
    })
  },
  confirm: function() {
    let that = this;
    let addArray = [{
      name: that.data.setName,
    }]
    that.setData({
      face_list: addArray.concat(that.data.face_list),
      inputValue: '',
      ifName: false,
    })


  },
  setValue: function(e) {
    let that = this;
    let inputValue = e.detail.value;
    that.setData({
      setName: inputValue,
    })
  },
  share: function() {
    // wx.navigateTo({
    //   url: '../information/information'
    // })
  },
  goto: function () {
    let pages = getCurrentPages();
    if (pages.length > 1) {
      let prePage = pages[pages.length - 2];
      prePage.unTotalAuditCount();
    }
  },
  toggle: function(e) {
    let that = this;
    let token = wx.getStorageSync('token');
    let wxUserId = wx.getStorageSync('wxUserId');
    // let roleName = wx.getStorageSync('roleName');
    let id = e.currentTarget.dataset.id
    wx.showLoading({
      title: '请等待。。。',
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_PERSON_COMPANY_REBIND",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          id: id,
          wxUserId:wxUserId,
        },
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == "SUCCESS" && res.data.type == "WX_PERSON_COMPANY_REBIND"){
          wx.showToast({
            title: '当前企业切换成功',
            icon: 'success',
            duration: 2000
          })
          wx.removeStorageSync('personGroupId')
          wx.setStorageSync('personGroupId', res.data.body.personGroupId);
          wx.removeStorageSync('corporateName');
          wx.setStorageSync('corporateName', e.currentTarget.dataset.name);
          wx.removeStorageSync('unTotalAuditCount')
          wx.setStorageSync('unTotalAuditCount', res.data.body.unAuditCount);
          // let personGroupId = wx.getStorageSync('personGroupId');
          if (res.data.body.roleName == "admin"){
           setTimeout(function(){
             wx.switchTab({
               url: '../user/user'
             })
             that.goto();
           },2000)
          }else{
           setTimeout(function(){
             wx.reLaunch({
               url: '../myself/myself'
             })
           },2000)
          } 
          
        } else if ("SUCCESS" == res.data.code && "WX_PERSON_COMPANY_REBIND" == res.data.type){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
        } else if ("ARGS_MISSING" == res.data.code ){
          wx.removeStorageSync('token')
          setTimeout(() => {
            invalidToken();
          }, 2000)
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  delete: function(e) {
    let that = this;
    let token = wx.getStorageSync('token');
    let id = e.currentTarget.dataset.id;
    let face_list_length = that.data.face_list.length;
    let newArray = [];
    wx.showModal({
      title: '确定要解绑吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '请等待。。。',
          })
          wx.request({
            url: dataUrl,
            method: "POST",
            data: {
              type: "WX_PERSON_EMPLOYEES_REMOVE",
              requestId: requestId(),
              appId: appId,
              timestamp: timeStamp,
              token: token,
              body: {
                id: id
              }
            },
            success: res => {
              wx.hideLoading();
              if ("SUCCESS" == res.data.code && "WX_PERSON_EMPLOYEES_REMOVE" == res.data.type) {
                wx.removeStorageSync('token');
                wx.setStorageSync('examine', "1");
                wx.showToast({
                  title: '解绑成功',
                  icon: 'success',
                  duration: 2000
                })
                wx.reLaunch({
                  url: '../index/index'
                })
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
                  success: function(res) {
                    if ("SUCCESS" == res.data.code && "WX_PERSON_MY_COMPANY_BIND" == res.data.type) {
                      if (res.data.body.employees.length > 0) {
                        that.setData({
                          face_list: res.data.body.employees
                        })
                      }else{
                        that.setData({
                          face_list: []
                        })
                        wx.reLaunch({
                          url: '../index/index'
                        })
                      }
                    }else{
                      wx.showToast({
                        title: '获取绑定的企业失败！',
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  }
                })
              } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEES_REMOVE" == res.data.type){
                wx.setStorageSync('examine', "1");
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 2000
                })
                setTimeout(() => {
                  invalidToken();
                }, 2000)
              } else if ("ARGS_MISSING" == res.data.code) {
                wx.removeStorageSync('token')
                setTimeout(() => {
                  invalidToken();
                }, 2000)
              } else {
                wx.setStorageSync('examine', "1");
                wx.showToast({
                  title: '解绑失败！',
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        } else if (res.cancel) {
          wx.hideLoading();
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
  // onShareAppMessage: function() {
  //   return {
  //     title: '我邀请加入人脸识别',
  //     path: '/pages/index/index',
  //     imageUrl: '/images/mine-path.png'
  //   }
  // },
})