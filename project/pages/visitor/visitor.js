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
let currentPageHistory = 0
let currentPageThrough = 0
const pageSize = 5
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allContent: false,
    bigImg: true,
    faceEnabled: true,
    fisrtContent: true,
    firstNofind: false,
    secondContent: true,
    secondNofind: false,
    thirdContent: true,
    thirdNofind: false,
    scrollHeight: 0,
    parentScrollHeight:0,
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
          parentScrollHeight: res.windowHeight - res.windowWidth / 750 * 120 - 10
        })
      }
    });
    currentPage = 0;
    currentPageHistory = 0;
    currentPageThrough = 0;
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
    if ( "" != e.detail.source){
      if (1 === e.detail.current) {
        that.setData({
          currentIndex: 1
        });
        currentPageHistory = 0;
        that.data.secondList = [];
        that.getHistoryList();
      } else if (2 === e.detail.current) {
        that.setData({
          currentIndex: 2
        });
        currentPageThrough = 0
        that.data.thirdList = [];
        that.getThroughList();
      } else {
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
    if ( "1" == e.currentTarget.dataset.idx){
      currentPageHistory = 0;
      that.data.secondList = [];
      that.getHistoryList();
    } else if ("2" == e.currentTarget.dataset.idx){
      currentPageThrough = 0;
      that.data.thirdList = [];
      that.getThroughList();
    }else{
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
    let faceEnabled = wx.getStorageSync('faceEnabled');
    if (faceEnabled) {
      that.setData({
        faceEnabled: false
      })
    } else {
      that.setData({
        faceEnabled: true
      })
    }
  },

  //获取大图
  getBigImg: function (e) {
    let that = this;
    let bigImg = e.currentTarget.dataset.img;
    let attr = bigImg.split("?")
    let newImg = attr[0] + "?" + attr[1].split("&")[2];
    // wx.hideTabBar();
    that.setData({
      allContent: true,
      bigImg: false,
      showBigImg: newImg
    })
  },

  //关闭大图
  closeBigImg: function () {
    let that = this;
    // wx.showTabBar();
    that.setData({
      allContent: false,
      bigImg: true,
    })

  },

  //获取未审核访客列表数据
  getVisitorList: function () {
    const that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_MY_VISIT_IFNO",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            sourceName: "",
            status:[0],
          },
          orderBy: [{
            visit_start_time: "desc"
          }]
        }
      },
      success: res => {
        wx.hideLoading();
        if (res.data.code == "SUCCESS" && res.data.type == "WX_MY_VISIT_IFNO") {
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
            let oldData = that.data.firstList;
            that.setData({
              firstList: oldData.concat(res.data.body.visits),
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
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_MY_VISIT_IFNO" == res.data.type) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
        } else if ("ARGS_MISSING" == res.data.code && "token" == res.data.msg) {
          wx.showToast({
            title: "小程序信息已过期,即将从新登录",
            icon: 'none',
            duration: 2000
          })
          app.argsmissing = "visitor"
          setTimeout(() => {
            wx.reLaunch({
              url: '../index/index'
            })
          }, 1000)
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  
  //获取历史访客列表数据
  getHistoryList:function(){
    const that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_MY_VISIT_IFNO",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPageHistory,
          pageSize: pageSize,
          condition: {
            sourceName: "",
            status: [1,3],
          },
          orderBy: [{
            visit_start_time: "desc"
          }]
        }
      },
      success: res => {
        wx.hideLoading();
        if (res.data.code == "SUCCESS" && res.data.type == "WX_MY_VISIT_IFNO") {
          if (res.data.body.visits.length > 0) {
            currentPageHistory++;
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
            let oldData = that.data.secondList;
            that.setData({
              secondList: oldData.concat(res.data.body.visits),
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
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_MY_VISIT_IFNO" == res.data.type) {
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
  getThroughList:function(){
    const that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_MY_VISIT_IFNO",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPageThrough,
          pageSize: pageSize,
          condition: {
            sourceName: "",
            status: [2,4],
          },
          orderBy: [{
            visit_start_time: "desc"
          }]
        }
      },
      success: res => {
        wx.hideLoading();
        if (res.data.code == "SUCCESS" && res.data.type == "WX_MY_VISIT_IFNO") {
          if (res.data.body.visits.length > 0) {
            currentPageThrough++;
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
            let oldData = that.data.thirdList;
            that.setData({
              thirdList: oldData.concat(res.data.body.visits),
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
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_MY_VISIT_IFNO" == res.data.type) {
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

  
  //待审核--同意
  loadOk:function(e){
    const that = this;
    let id = e.currentTarget.dataset.id;
    let token = wx.getStorageSync('token');
    wx.showModal({
      title: '确定同意吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '请等待...',
          })
          wx.request({
            url: dataUrl,
            data: {
              type: "WX_APPOINTMENT_VISIT_INFO_AUDIT",
              requestId: requestId(),
              appId: appId,
              timestamp: timeStamp,
              token: token,
              body: {
                id: id,
                isPass:"1"
              }
            },
            method: 'POST',
            success: function (res) {
              wx.hideLoading();
              if ("SUCCESS" == res.data.code && "WX_APPOINTMENT_VISIT_INFO_AUDIT" == res.data.type) {
                wx.showToast({
                  title: '同意通过',
                  icon: 'success',
                  duration: 2000
                })
                currentPage = 0;
                wx.request({
                  url: dataUrl,
                  method: "POST",
                  data: {
                    type: "WX_MY_VISIT_IFNO",
                    requestId: requestId(),
                    appId: appId,
                    timestamp: timeStamp,
                    token: token,
                    body: {
                      currentPage: currentPage,
                      pageSize: pageSize,
                      condition: {
                        sourceName: "",
                        status:[0]
                      },
                      orderBy: [{
                        visit_start_time: "desc"
                      }]
                    }
                  },
                  success: res => {
                    if (res.data.code == "SUCCESS" && res.data.type == "WX_MY_VISIT_IFNO") {
                      if (res.data.body.visits.length > 0) {
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
                        that.setData({
                          firstList: res.data.body.visits,
                          firstNofind: true,
                          firstContent: false,
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
                    } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_UN_AUDIT_LIST" == res.data.type) {
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
              } else if ("TOKEN_EXPIRED" == res.data.code && "WX_APPOINTMENT_VISIT_INFO_AUDIT" == res.data.type) {
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

  //待审核--拒绝
  loadReject:function(e){
    const that = this;
    let id = e.currentTarget.dataset.id;
    let token = wx.getStorageSync('token');
    wx.showModal({
      title: '确定拒绝吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '请等待...',
          })
          wx.request({
            url: dataUrl,
            data: {
              type: "WX_APPOINTMENT_VISIT_INFO_AUDIT",
              requestId: requestId(),
              appId: appId,
              timestamp: timeStamp,
              token: token,
              body: {
                id: id,
                isPass:"2",
              }
            },
            method: 'POST',
            success: function (res) {
              wx.hideLoading();
              if ("SUCCESS" == res.data.code && "WX_APPOINTMENT_VISIT_INFO_AUDIT" == res.data.type) {
                wx.showToast({
                  title: '已解决',
                  icon: 'success',
                  duration: 2000
                })
                currentPage = 0;
                wx.request({
                  url: dataUrl,
                  method: "POST",
                  data: {
                    type: "WX_MY_VISIT_IFNO",
                    requestId: requestId(),
                    appId: appId,
                    timestamp: timeStamp,
                    token: token,
                    body: {
                      currentPage: currentPage,
                      pageSize: pageSize,
                      condition: {
                        sourceName: "",
                        status:[0]
                      },
                      orderBy: [{
                        visit_start_time: "desc"
                      }]
                    }
                  },
                  success: res => {
                    if (res.data.code == "SUCCESS" && res.data.type == "WX_MY_VISIT_IFNO") {
                      if (res.data.body.visits.length > 0) {
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
                        that.setData({
                          firstList: res.data.body.visits,
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
                    } else if ("TOKEN_EXPIRED" == res.data.code && "WX_MY_VISIT_IFNO" == res.data.type) {
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
              } else if ("TOKEN_EXPIRED" == res.data.code && "WX_APPOINTMENT_VISIT_INFO_AUDIT" == res.data.type) {
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



  //历史访客--删除列表
  historyDelete: function (e) {
    const that = this;
    let id = e.currentTarget.dataset.id;
    let token = wx.getStorageSync('token');
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
              type: "WX_MY_VISIT_REMOVE",
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
              if ("SUCCESS" == res.data.code && "WX_MY_VISIT_REMOVE" == res.data.type) {
                wx.showToast({
                  title: '删除记录成功',
                  icon: 'success',
                  duration: 2000
                })
                currentPageHistory = 0;
                wx.request({
                  url: dataUrl,
                  method: "POST",
                  data: {
                    type: "WX_MY_VISIT_IFNO",
                    requestId: requestId(),
                    appId: appId,
                    timestamp: timeStamp,
                    token: token,
                    body: {
                      currentPage: currentPageHistory,
                      pageSize: pageSize,
                      condition: {
                        sourceName: "",
                        status:[1,3]
                      },
                      orderBy: [{
                        visit_start_time: "desc"
                      }]
                    }
                  },
                  success: res => {
                    if (res.data.code == "SUCCESS" && res.data.type == "WX_MY_VISIT_IFNO") {
                      if (res.data.body.visits.length > 0) {
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
                        that.setData({
                          secondList: res.data.body.visits,
                          secondContent: false,
                          secondNofind: true,
                        })
                      } else {
                        that.setData({
                          secondList:[],
                          secondContent: true,
                          secondNofind: false,
                        })
                        wx.showToast({
                          title: "没有数据了",
                          icon: 'success',
                          duration: 2000
                        })
                      }
                    } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_UN_AUDIT_LIST" == res.data.type) {
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

 //已拒绝--删除列表
  throughDelete:function(e){
    const that = this;
    let id = e.currentTarget.dataset.id;
    let token = wx.getStorageSync('token');
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
              type: "WX_MY_VISIT_REMOVE",
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
              if ("SUCCESS" == res.data.code && "WX_MY_VISIT_REMOVE" == res.data.type) {
                wx.showToast({
                  title: '删除记录成功',
                  icon: 'success',
                  duration: 2000
                })
                currentPageThrough = 0;
                wx.request({
                  url: dataUrl,
                  method: "POST",
                  data: {
                    type: "WX_MY_VISIT_IFNO",
                    requestId: requestId(),
                    appId: appId,
                    timestamp: timeStamp,
                    token: token,
                    body: {
                      currentPage: currentPageThrough,
                      pageSize: pageSize,
                      condition: {
                        sourceName: "",
                        status:[2,4]
                      },
                      orderBy: [{
                        visit_start_time: "desc"
                      }]
                    }
                  },
                  success: res => {
                    that.data.thirdList = [];
                    if (res.data.code == "SUCCESS" && res.data.type == "WX_MY_VISIT_IFNO") {
                      if (res.data.body.visits.length > 0) {
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
                        that.setData({
                          thirdList: res.data.body.visits,
                          thirdContent:false,
                          thirdNofind:true,
                        })
                      } else {
                        that.setData({
                          thirdList:[],
                          thirdContent: true,
                          thirdNofind: false,
                        })
                        wx.showToast({
                          title: "没有数据了",
                          icon: 'success',
                          duration: 2000
                        })
                      }
                    } else if ("TOKEN_EXPIRED" == res.data.code && "WX_MY_VISIT_IFNO" == res.data.type) {
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


  //未审核--触底加载
  upper: function (e) {
    const that = this;
    that.getVisitorList();
  },
  
  //历史访客--触底加载
  historyUpper:function(){
    const that = this;
    that.getHistoryList();
  },

  //已审核--触底加载
  throughUpper:function(){
    const that = this;
    that.getThroughList();
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