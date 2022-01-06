// pages/visitor/visitor.js
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
let currentPageSuccess = 0
let currentPageReject = 0
const pageSize = 5
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allContent: false,
    bigImg: true,
    fisrtContent: true,
    firstNofind: false,
    secondContent: true,
    secondNofind: false,
    thirdContent: true,
    thirdNofind: false,
    targetName: "",
    targetCompanyName: "",
    targetPhone: "",
    scrollHeight: 0,
    parentScrollHeight: 0,
    inputValue: "",
    currentIndex: 0,
    firstList: [],
    secondList: [],
    thirdList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    wx.getSystemInfo({
      success: function (res) {
        // 可使用窗口宽度、高度
        // 计算主体部分高度,单位为px
        that.setData({
          // cameraHeight部分高度 = 利用窗口可使用高度 - 固定高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
          scrollHeight: res.windowHeight - res.windowWidth / 750 * 120 - 20,
          parentScrollHeight: res.windowHeight - res.windowWidth / 750 * 120 -10
        })
      }
    });
    currentPage = 0;
    currentPageSuccess = 0;
    currentPageReject = 0;
    that.getVisitorList("");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //swiper切换时会调用
  pagechange: function (e) {
    const that = this;
    if ("" != e.detail.source){
      if (1 === e.detail.current){
        that.setData({
          currentIndex: 1
        });
        currentPageSuccess = 0;
        that.data.secondList = [];
        that.getSuccessList();
      } else if (2 === e.detail.current){
        that.setData({
          currentIndex: 2
        });
        currentPageReject = 0;
        that.data.thirdList = [];
        that.getRejectList();
      }else{
        that.setData({
          currentIndex: 0
        });
        currentPage = 0;
        that.data.firstList = [];
        that.getVisitorList();
      }
    }
  },
  //用户点击tab时调用
  titleClick: function (e) {
    const that = this;
    let currentPageIndex =
      that.setData({
        //拿到当前索引并动态改变
        currentIndex: e.currentTarget.dataset.idx
      })
    if ("1" == e.currentTarget.dataset.idx) {
      currentPageSuccess = 0;
      that.data.secondList = [];
      that.getSuccessList();
    } else if ("2" == e.currentTarget.dataset.idx) {
      currentPageReject = 0
      that.data.thirdList = [];
      that.getRejectList();
    } else {
      currentPage = 0;
      that.data.firstList = [];
      that.getVisitorList();
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;

  },

 
 
 //获取人员详情信息
  getPersonInfo:function(){
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
        if (res.data.code == "SUCCESS" && res.data.type == "WX_PERSON_MY_COMPANY_INFO") {
          if (!res.data.body.name) {
            res.data.body.name = "";
          }
          if (!res.data.body.mobilePhone) {
            res.data.body.mobilePhone = "";
          }
          if (!res.data.body.companyName) {
            res.data.body.companyName = "";
          }

          that.setData({
            targetName: res.data.body.name,
            targetCompanyName: res.data.body.companyName,
            targetPhone: res.data.body.mobilePhone,
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

  //获取访客列表数据
  getVisitorList: function () {
    const that = this;
    let token = wx.getStorageSync('token');
    let targetName = that.data.targetName;
    let targetCompanyName = that.data.targetCompanyName;
    let targetPhone = that.data.targetPhone;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_VISTOR_PRECONTRACT_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            targetName: targetName,
            targetCompanyName: targetCompanyName,
            targetPhone: targetPhone,
            status:[0],
          },
          orderBy: [
            { "visit_start_time": "desc" }
          ],
        }
      },
      method: 'POST',
      success:function(res){
        wx.hideLoading();
        if ("SUCCESS" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type){
          currentPage++
          if (currentPage >= res.data.body.pageCount) {
            currentPage = res.data.body.pageCount
          }
          if (res.data.body.precontractList.length > 0) {
            res.data.body.precontractList.forEach(function (item, index) {
              if (!item.visitStartTime) {
                item.visitStartTime = "";
              } else {
                item.visitStartTime = item.visitStartTime.slice(0, 10);
              }
              if (!item.targetCompanyName) {
                item.targetCompanyName = "";
              }
              if (!item.targetCompanyAddress) {
                item.targetCompanyAddress = "";
              }
              if (!item.visitReason) {
                item.visitReason = "";
              }

            })
            let oldData = that.data.firstList;
            that.setData({
              firstList: oldData.concat(res.data.body.precontractList),
              firstNofind: true,
              fisrtContent: false,
            })
          } else {
            wx.showToast({
              title: "没有数据了",
              icon: 'success',
              duration: 2000
            })
          } 
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type){
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

  //获取预约成功访客列表数据
  getSuccessList: function () {
    const that = this;
    let token = wx.getStorageSync('token');
    let targetName = that.data.targetName;
    let targetCompanyName = that.data.targetCompanyName;
    let targetPhone = that.data.targetPhone;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_VISTOR_PRECONTRACT_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPageSuccess,
          pageSize: pageSize,
          condition: {
            targetName: targetName,
            targetCompanyName: targetCompanyName,
            targetPhone: targetPhone,
            status: [1,3],
          },
          orderBy: [
            { "visit_start_time": "desc" }
          ],
        }
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if ("SUCCESS" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type) {
          currentPageSuccess++
          if (currentPageSuccess >= res.data.body.pageCount) {
            currentPageSuccess = res.data.body.pageCount
          }
          if (res.data.body.precontractList.length > 0) {
            res.data.body.precontractList.forEach(function (item, index) {
              if (!item.visitStartTime) {
                item.visitStartTime = "";
              } else {
                item.visitStartTime = item.visitStartTime.slice(0, 10);
              }
              if (!item.targetCompanyName) {
                item.targetCompanyName = "";
              }
              if (!item.targetCompanyAddress) {
                item.targetCompanyAddress = "";
              }
              if (!item.visitReason) {
                item.visitReason = "";
              }

            })
            let oldData = that.data.secondList;
            that.setData({
              secondList: oldData.concat(res.data.body.precontractList),
              secondNofind: true,
              secondContent: false,
            })

          } else {
            wx.showToast({
              title: "没有数据了",
              icon: 'success',
              duration: 2000
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type) {
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

  //获取已拒绝访客列表数据
  getRejectList: function () {
    const that = this;
    let token = wx.getStorageSync('token');
    let targetName = that.data.targetName;
    let targetCompanyName = that.data.targetCompanyName;
    let targetPhone = that.data.targetPhone;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_VISTOR_PRECONTRACT_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPageReject,
          pageSize: pageSize,
          condition: {
            targetName: targetName,
            targetCompanyName: targetCompanyName,
            targetPhone: targetPhone,
            status: [2,4],
          },
          orderBy: [
            { "visit_start_time": "desc" }
          ],
        }
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if ("SUCCESS" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type) {
          currentPageReject++
          if (currentPageReject >= res.data.body.pageCount) {
            currentPageReject = res.data.body.pageCount
          }
          if (res.data.body.precontractList.length > 0) {
            res.data.body.precontractList.forEach(function (item, index) {
              if (!item.visitStartTime) {
                item.visitStartTime = "";
              } else {
                item.visitStartTime = item.visitStartTime.slice(0, 10);
              }
              if (!item.targetCompanyName) {
                item.targetCompanyName = "";
              }
              if (!item.targetCompanyAddress) {
                item.targetCompanyAddress = "";
              }
              if (!item.visitReason) {
                item.visitReason = "";
              }

            })
            let oldData = that.data.thirdList;
            that.setData({
              thirdList: oldData.concat(res.data.body.precontractList),
              thirdNofind: true,
              thirdContent: false,
            })

          } else {
            wx.showToast({
              title: "没有数据了",
              icon: 'success',
              duration: 2000
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type) {
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

  //待审核--取消
  cancel: function (e) {
    const that = this;
    let id = e.currentTarget.dataset.id;
    let token = wx.getStorageSync('token');
    let targetName = that.data.targetName;
    let targetCompanyName = that.data.targetCompanyName;
    let targetPhone = that.data.targetPhone;
    wx.showModal({
      title: '确定取消吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '请等待...',
          })
          wx.request({
            url: dataUrl,
            data: {
              type: "WX_MY_VISIT_REMOVE",
              requestId: requestId(),
              appId: appId,
              timestamp: timeStamp,
              token: token,
              body: {
                id: id,
                isPass:"4"
              }
            },
            method: 'POST',
            success: function (res) {
              wx.hideLoading();
              if ("SUCCESS" == res.data.code && "WX_MY_VISIT_REMOVE" == res.data.type) {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success',
                  duration: 2000
                })
                currentPage = 0;
                wx.request({
                  url: dataUrl,
                  method: "POST",
                  data: {
                    type: "WX_VISTOR_PRECONTRACT_LIST",
                    requestId: requestId(),
                    appId: appId,
                    timestamp: timeStamp,
                    token: token,
                    body: {
                      currentPage: currentPage,
                      pageSize: pageSize,
                      condition: {
                        targetName: targetName,
                        targetCompanyName: targetCompanyName,
                        targetPhone: targetPhone,
                        status: [0]
                      },
                      orderBy: [{
                        visit_start_time: "desc"
                      }]
                    }
                  },
                  success: res => {
                    if (res.data.code == "SUCCESS" && res.data.type == "WX_VISTOR_PRECONTRACT_LIST") {
                      if (res.data.body.precontractList.length > 0) {
                        res.data.body.precontractList.forEach(function (item, index) {
                          if (!item.visitStartTime) {
                            item.visitStartTime = "";
                          } else {
                            item.visitStartTime = item.visitStartTime.slice(0, 10);
                          }
                          if (!item.targetCompanyName) {
                            item.targetCompanyName = "";
                          }
                          if (!item.targetCompanyAddress) {
                            item.targetCompanyAddress = "";
                          }
                          if (!item.visitReason) {
                            item.visitReason = "";
                          }
                        })
                        that.setData({
                          firstList: res.data.body.precontractList,
                          firstNofind: true,
                          fisrtContent: false,
                        })
                      } else {
                        that.setData({
                          firstList: [],
                          firstNofind: false,
                          fisrtContent: true,
                        })
                        wx.showToast({
                          title: "没有数据了",
                          icon: 'success',
                          duration: 2000
                        })
                      }
                    } else if ("TOKEN_EXPIRED" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type) {
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
              } else if ("TOKEN_EXPIRED" == res.data.code && "WX_MY_VISIT_REMOVE" == res.data.type) {
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
        } else if (res.cancel) {
          wx.hideLoading();
        }
      }
    })
  },

  //预约成功--删除列表
  orderSuccess: function (e) {
    const that = this;
    let id = e.currentTarget.dataset.id;
    let token = wx.getStorageSync('token');
    let targetName = that.data.targetName;
    let targetCompanyName = that.data.targetCompanyName;
    let targetPhone = that.data.targetPhone;
    wx.showModal({
      title: '确定要删除吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除。。。',
          })
          wx.request({
            url: dataUrl,
            data: {
              type: "WX_APPOINTMENT_REMOVE",
              requestId: requestId(),
              appId: appId,
              timestamp: timeStamp,
              token: token,
              body: {
                id: id,
              }
            },
            method: 'POST',
            success: function (res) {
              wx.hideLoading();
              if ("SUCCESS" == res.data.code && "WX_APPOINTMENT_REMOVE" == res.data.type) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                })
                currentPageSuccess = 0;
                wx.request({
                  url: dataUrl,
                  method: "POST",
                  data: {
                    type: "WX_VISTOR_PRECONTRACT_LIST",
                    requestId: requestId(),
                    appId: appId,
                    timestamp: timeStamp,
                    token: token,
                    body: {
                      currentPage: currentPageSuccess,
                      pageSize: pageSize,
                      condition: {
                        targetName: targetName,
                        targetCompanyName: targetCompanyName,
                        targetPhone: targetPhone,
                        status: [1,3]
                      },
                      orderBy: [{
                        visit_start_time: "desc"
                      }]
                    }
                  },
                  success: res => {
                    if (res.data.code == "SUCCESS" && res.data.type == "WX_VISTOR_PRECONTRACT_LIST") {
                      if (res.data.body.precontractList.length > 0) {
                        res.data.body.precontractList.forEach(function (item, index) {
                          if (!item.visitStartTime) {
                            item.visitStartTime = "";
                          } else {
                            item.visitStartTime = item.visitStartTime.slice(0, 10);
                          }
                          if (!item.targetCompanyName) {
                            item.targetCompanyName = "";
                          }
                          if (!item.targetCompanyAddress) {
                            item.targetCompanyAddress = "";
                          }
                          if (!item.visitReason) {
                            item.visitReason = "";
                          }
                        })
                        that.setData({
                          secondList: res.data.body.precontractList,
                          secondContent: false,
                          secondNofind: true,
                        })
                      } else {
                        that.setData({
                          secondList: [],
                          secondContent: true,
                          secondNofind: false,
                        })
                        wx.showToast({
                          title: "没有数据了",
                          icon: 'success',
                          duration: 2000
                        })
                      }
                    } else if ("TOKEN_EXPIRED" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type) {
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
              } else if ("TOKEN_EXPIRED" == res.data.code && "WX_APPOINTMENT_REMOVE" == res.data.type) {
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
        } else if (res.cancel) {
          wx.hideLoading();
        }
      }
    })
  },

  //已拒绝--删除列表
  rejectDelete: function (e) {
    const that = this;
    let id = e.currentTarget.dataset.id;
    let token = wx.getStorageSync('token');
    let targetName = that.data.targetName;
    let targetCompanyName = that.data.targetCompanyName;
    let targetPhone = that.data.targetPhone;
    wx.showModal({
      title: '确定要删除吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除。。。',
          })
          wx.request({
            url: dataUrl,
            data: {
              type: "WX_APPOINTMENT_REMOVE",
              requestId: requestId(),
              appId: appId,
              timestamp: timeStamp,
              token: token,
              body: {
                id: id,
              }
            },
            method: 'POST',
            success: function (res) {
              wx.hideLoading();
              if ("SUCCESS" == res.data.code && "WX_APPOINTMENT_REMOVE" == res.data.type) {
                wx.showToast({
                  title: '删除记录成功',
                  icon: 'success',
                  duration: 2000
                })
                currentPageReject = 0;
                wx.request({
                  url: dataUrl,
                  method: "POST",
                  data: {
                    type: "WX_VISTOR_PRECONTRACT_LIST",
                    requestId: requestId(),
                    appId: appId,
                    timestamp: timeStamp,
                    token: token,
                    body: {
                      currentPage: currentPageReject,
                      pageSize: pageSize,
                      condition: {
                        targetName: targetName,
                        targetCompanyName: targetCompanyName,
                        targetPhone: targetPhone,
                        status: [2,4]
                      },
                      orderBy: [{
                        visit_start_time: "desc"
                      }]
                    }
                  },
                  success: res => {
                    if (res.data.code == "SUCCESS" && res.data.type == "WX_VISTOR_PRECONTRACT_LIST") {
                      if (res.data.body.precontractList.length > 0) {
                        res.data.body.precontractList.forEach(function (item, index) {
                          if (!item.visitStartTime) {
                            item.visitStartTime = "";
                          } else {
                            item.visitStartTime = item.visitStartTime.slice(0, 10);
                          }
                          if (!item.targetCompanyName) {
                            item.targetCompanyName = "";
                          }
                          if (!item.targetCompanyAddress) {
                            item.targetCompanyAddress = "";
                          }
                          if (!item.visitReason) {
                            item.visitReason = "";
                          }
                        })
                        that.setData({
                          thirdList: res.data.body.precontractList,
                          thirdContent: false,
                          thirdNofind: true,
                        })
                      } else {
                        that.setData({
                          thirdList: [],
                          thirdContent: true,
                          thirdNofind: false,
                        })
                        wx.showToast({
                          title: "没有数据了",
                          icon: 'success',
                          duration: 2000
                        })
                      }
                    } else if ("TOKEN_EXPIRED" == res.data.code && "WX_VISTOR_PRECONTRACT_LIST" == res.data.type) {
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
              } else if ("TOKEN_EXPIRED" == res.data.code && "WX_APPOINTMENT_REMOVE" == res.data.type) {
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
        } else if (res.cancel) {
          wx.hideLoading();
        }
      }
    })
  },


  //未审核--触底加载
  upper: function (e) {
    const that = this;
    that.getVisitorList();
  },

  //预约成功--触底加载
  successUpper: function () {
    const that = this;
    that.getSuccessList();
  },

  //已拒绝--触底加载
  rejectUpper: function () {
    const that = this;
    that.getRejectList();
  },

  scroll: function (e) {
   
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