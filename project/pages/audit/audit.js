const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken;
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
let currentPage = 0;
const pageSize = 10;
var app = getApp()
Page({
  data: {
    allContent:false,
    bigImg:true,
    auditContent: true,
    nofind: false,
    showBigImg:"",
    inputValue: '', //搜索的内容
    currentTab: 0,
    scrollHeight: 0,
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    indicatorDots: true,
    interval: 2000,
    duration: 500,
    auditList: []
  },
  onLoad: function(options) {
    currentPage = 0;
    let that = this;
  },
  onShow: function() {
    const that = this;
    currentPage = 0;
    wx.getSystemInfo({
      success: function(res) {
        // console.log(res);
        // 可使用窗口宽度、高度
        // 计算主体部分高度,单位为px
        that.setData({
          // cameraHeight部分高度 = 利用窗口可使用高度 - 固定高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
          scrollHeight: res.windowHeight - res.windowWidth / 750 * 142
        })
      }
    });
    that.getList();
    // wx.removeTabBarBadge({
    //   index: 0,
    // });
  },
  //获取大图
  getBigImg:function(e){
    let that = this;
    let bigImg = e.currentTarget.dataset.img;
    let attr = bigImg.split("?")
    let newImg = attr[0] +"?"+ attr[1].split("&")[2];
    wx.hideTabBar();
    that.setData({
      allContent: true,
      bigImg: false,
      showBigImg: newImg
    }) 
  },
  //关闭大图
  closeBigImg:function(){
      let that = this;
      wx.showTabBar();
      that.setData({
        allContent: false,
        bigImg: true,
      }) 
      
  },
  //通过
  through: function(e) {
    const that = this;
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let isPass = e.currentTarget.dataset.ispass;
    that.submitAudit(index, id, isPass);
  },
  //不通过
  refused: function(e) {
    const that = this;
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let isPass = e.currentTarget.dataset.ispass;
    that.submitAudit(index, id, isPass);
  },
  //根据关键字搜索
  auditSearch: function(value) {
    const that = this;
    const token = wx.getStorageSync('token');
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_PERSON_UN_AUDIT_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            name: value
          },
          orderBy: [{
            name: "desc"
          }]
        }
      },
      method: 'POST',
      success: function(res) {
        console.log(res)
        if ("SUCCESS" == res.data.code && "WX_PERSON_UN_AUDIT_LIST" == res.data.type) {
          if (res.data.body.employees.length > 0){
            that.setData({
              auditList: res.data.body.employees,
              auditContent: false,
              nofind: true
            })
          }else{
            that.setData({
              auditContent: true,
              nofind: false
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_UN_AUDIT_LIST" == res.data.type){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000,
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000,
          })
          that.setData({
            auditList: []
          })
        }
      }
    })
  },

  //获取未审核的数据
  getList: function() {
    const that = this;
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let token = wx.getStorageSync('token');
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_PERSON_UN_AUDIT_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            name: ""
          },
          orderBy: [{
            name: "desc"
          }]
        }
      },
      success: res => {
        console.log(res);
        console.log("获取列表信息");
        if (res.data.code == "SUCCESS" && res.data.type == "WX_PERSON_UN_AUDIT_LIST") {
          let totalSize = res.data.body.totalSize + ""
          if (totalSize != "0") {
            wx.setTabBarBadge({
              index: 0,
              text: totalSize
            })
          } else {
            wx.removeTabBarBadge({
              index: 0,
            });
          }
          if (res.data.body.employees.length > 0){
            for (let i = 0; i < res.data.body.employees.length; i++) {
              if (!res.data.body.employees[i].faceImg) {
                res.data.body.employees[i].faceImg = "../../images/photo.png";
              }
              if (!faceEnabled) {
                res.data.body.employees[i].faceImg = ""
              }
              if (!res.data.body.employees[i].idNo) {
                res.data.body.employees[i].idNo = "";
              }
            }
            console.log("获取图片", res.data.body.employees)
            // let oldData = that.data.auditList;
            that.setData({
              auditList: res.data.body.employees,
              auditContent:false,
              nofind:true
            })
            
          }else{
              that.setData({
                auditContent: true,
                nofind: false
              })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_UN_AUDIT_LIST" == res.data.type){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout( () => {
            invalidToken();
          },2000)
        } else if ("ARGS_MISSING" == res.data.code && "token" == res.data.msg){
          wx.showToast({
            title: "小程序信息已过期,即将从新登录",
            icon: 'none',
            duration: 2000
          })
          app.argsmissing = "audit"
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
  //上拉触底加载
  onReachBottom: function(e) {
    const that = this;
    let faceEnabled = wx.getStorageSync('faceEnabled');
    wx.showLoading({
      title: '加载中',
    })
    let token = wx.getStorageSync('token');
    currentPage++;
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_PERSON_UN_AUDIT_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            name: ""
          },
          orderBy: [{
            name: "desc"
          }]
        }
      },
      success: res => {
        console.log(res);
        if (res.data.code == "SUCCESS" && res.data.type == "WX_PERSON_UN_AUDIT_LIST") {
          console.log("返回数据");
          wx.hideLoading();
          if (currentPage >= res.data.body.pageCount-1){
            currentPage = res.data.body.pageCount-1
          }
          console.log("currentPage",currentPage)
          if (res.data.body.employees.length > 0) {
            
            for (let i = 0; i < res.data.body.employees.length; i++) {
              if (!res.data.body.employees[i].faceImg) {
                res.data.body.employees[i].faceImg = "../../images/photo.png";
              }
              if (!faceEnabled) {
                res.data.body.employees[i].faceImg = ""
              }
              if (!res.data.body.employees[i].idNo) {
                res.data.body.employees[i].idNo = "";
              }
            }
            let oldData = that.data.auditList;
            that.setData({
              auditList: oldData.concat(res.data.body.employees)
            })
            let totalSize = res.data.body.totalSize + ""
            wx.setTabBarBadge({
              index: 0,
              text: totalSize
            })
          } else {
            wx.showToast({
              title: "没有数据了",
              icon: 'success',
              duration: 2000
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code &&  "WX_PERSON_UN_AUDIT_LIST" == res.data.type){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
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
  //触底加载
  upper: function(e) {
    const that = this;
    console.log("触底加载。。。", e);
    // that.getList();
    that.onReachBottom();
  },
  scroll: function(e) {
    // console.log("滚动", e);
  },
  submitAudit: function(index, id, isPass) {
    console.log("isPass", isPass);
    const that = this;
    const token = wx.getStorageSync('token');
    let auditList_length = that.data.auditList.length;
    let newArray = [];
    currentPage = 0
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_PERSON_INFO_AUDIT",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          id: id,
          isPass: isPass
        }
      },
      success: res => {
        console.log(res);
        if (res.data.code == "SUCCESS" && res.data.type == "WX_PERSON_INFO_AUDIT") {
          that.getList();
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_INFO_AUDIT" == res.data.type){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
          that.getList();
        }
      }
    })
  },
  //搜索框文本内容显示
  inputBind: function(event) {
    const that = this;
    currentPage = 0;
    that.setData({
      inputValue: event.detail.value
    })
    // console.log('bindInput' + this.data.inputValue)
    that.auditSearch(event.detail.value);
  },

  //搜索执行按钮
  query: function(event) {
    let that = this;
    currentPage = 0;
    /**
     * keyword string 搜索关键词 ; 这里是 this.data.inputValue
     * start int 分页起始值 ; 这里是 0
     */
    if (!that.data.inputValue || that.data.inputValue == "") {
      //没有搜索词 友情提示
      wx.showToast({
        title: '请输入内容',
        image: '../../images/none.png',
        duration: 2000,
      })
    } else {
      const token = wx.getStorageSync('token');
      wx.showLoading({
      title: '请等待。。。',
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_PERSON_UN_AUDIT_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            name: that.data.inputValue
          },
          orderBy: [{
            name: "desc"
          }]
        }
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        console.log(res)
        if ("SUCCESS" == res.data.code && "WX_PERSON_UN_AUDIT_LIST" == res.data.type) {
          if (res.data.body.employees.length > 0){
            that.setData({
              auditList: res.data.body.employees,
              auditContent: false,
              nofind: true,
            })
          }else{
            that.setData({
              auditContent: true,
              nofind: false,
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_UN_AUDIT_LIST" == res.data.type){
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000,
          })
          setTimeout(() => {
            invalidToken();
          }, 2000)
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000,
          })
          that.setData({
            auditList: []
          })
        }
      }
    })
    }
  }
})