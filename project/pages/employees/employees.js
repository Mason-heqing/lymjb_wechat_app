//employess.js
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
const pageSize = 20
Page({
  data: {
    group: {
      title: "",
    },
    scrollHeight: 0,
    inputValue: '', //搜索的内容
    toSingerNum: '',
    logs: [],
    listData: [],
    scrollTop: 0,
    HOT_NAME: '热',
    HOT_SINGER_LEN: 10,
    listHeight: [],
    currentIndex: 0,
    fixedTitle: '',
    fixedTop: 0,
  },
  onLoad: function () {
    let that = this;
    currentPage = 0;
    let personGroupId = wx.getStorageSync('personGroupId');
    wx.showShareMenu();
    that.setData({
      logs: [],
      listData: [],
    })
    that.fetchTestData("", personGroupId);
    setTimeout(() => {
      that._calculateHeight();
    }, 2000);
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res);
        // 可使用窗口宽度、高度
        // 计算主体部分高度,单位为px
        that.setData({
          // cameraHeight部分高度 = 利用窗口可使用高度 - 固定高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
          scrollHeight: res.windowHeight - res.windowWidth / 750 * 142
        })
      }
    });
    that.setData({
      inputValue:''
    })
  },
  onShow() {
    var pages = getCurrentPages().length;
    console.log("页面路径", pages)
    if (2 < pages) {
      wx.navigateBack({
        delta: 2
      })
    }
  },
  upper: function (e) {
    const that = this;
    if (app.globalData.deletePerson){
      currentPage = 1;
      app.globalData.deletePerson = false
    }
    let personGroupId = wx.getStorageSync('personGroupId');
    let token = wx.getStorageSync('token');
    
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_PERSON_EMPLOYEES_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            name: "",
            personGroupId: personGroupId
          },
          orderBy: [{
            name: "asc"
          }]
        }
      },
      success: res => {
        if ("SUCCESS" == res.data.code && "WX_PERSON_EMPLOYEES_LIST" == res.data.type) {
          currentPage++
          wx.hideLoading();
          if (currentPage >= res.data.body.pageCount) {
            currentPage = res.data.body.pageCount
          }
          // let oldData = that.data.logs;
          if (res.data.body.employees.length > 0) {
            res.data.body.employees.forEach((item,index)=>{
              if(!item.imgPath || "" == item.imgPath || undefined == item.imgPath){
                item.imgPath = '../../images/photo.png';
              }
            })
            let oldData = that.data.listData;
            let newData = oldData.concat(res.data.body.employees);
            if (oldData.length > 0) {
              that.setData({
                logs: that.normalizeSinger(newData),
                listData: newData
              })
            } else {
              that.setData({
                logs: that.normalizeSinger(res.data.body.employees),
                listData: res.data.body.employees
              })
            }
          } else {
            wx.showToast({
              title: "没有数据了",
              icon: 'success',
              duration: 2000
            })
          }

        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEES_LIST" == res.data.type) {
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
  //获取员工管理列表数据
  fetchTestData: function (keyword, personGroupId) {
    let that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_PERSON_EMPLOYEES_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            name: keyword,
            personGroupId: personGroupId
          },
          orderBy: [{
            name: "asc"
          }]
        }
      },
      success: res => {
        // console.log(res);
        if ("SUCCESS" == res.data.code && "WX_PERSON_EMPLOYEES_LIST" == res.data.type) {
          wx.hideLoading();
          currentPage++;
          if (res.data.body.employees.length > 0) {
            res.data.body.employees.forEach((item, index) => {
              if (!item.imgPath || "" == item.imgPath || undefined == item.imgPath) {
                item.imgPath = "../../images/photo.png";
              }
            })
            let oldData = that.data.listData;
            let newData = oldData.concat(res.data.body.employees);
            if (oldData.length > 0) {
              that.setData({
                logs: that.normalizeSinger(newData),
                listData: newData
              })
            } else {
              that.setData({
                logs: that.normalizeSinger(res.data.body.employees),
                listData: res.data.body.employees
              })
            }
          } else {
            wx.showToast({
              title: "没有数据了",
              icon: 'success',
              duration: 2000
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEES_LIST" == res.data.type) {
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
  //搜索执行按钮
  query: function (event) {
    currentPage = 0;
    let that = this
    let token = wx.getStorageSync('token');
    let inputValue = that.data.inputValue;
    let personGroupId = wx.getStorageSync('personGroupId');
    wx.showLoading({
      title: '请等待。。。',
    })
    /**
     * keyword string 搜索关键词 ; 这里是 this.data.inputValue
     * start int 分页起始值 ; 这里是 0
     */
    if (!that.data.inputValue) {
      wx.hideLoading();
      //没有搜索词 友情提示
      wx.showToast({
        title: '请重新输入',
        image: '../../images/none.png',
        duration: 2000,
      })
    } else {
      wx.request({
        url: dataUrl,
        data: {
          type: "WX_PERSON_EMPLOYEES_LIST",
          requestId: requestId(),
          appId: appId,
          timestamp: timeStamp,
          token: token,
          body: {
            currentPage: currentPage,
            pageSize: pageSize,
            condition: {
              name: inputValue,
              personGroupId: personGroupId
            },
            orderBy: [{
              name: "asc"
            }]
          }
        },
        method: 'POST',
        success: function (res) {
          if ("SUCCESS" == res.data.code && "WX_PERSON_EMPLOYEES_LIST" == res.data.type) {
            wx.hideLoading();
            if (0 < res.data.body.employees.length){
              res.data.body.employees.forEach((item,index)=>{
                if (!item.imgPath || "" == item.imgPath || undefined == item.imgPath){
                   item.imgPath = "../../images/photo.png";
                 }
              })
            }
            that.setData({
              logs: that.normalizeSinger(res.data.body.employees)
            })
          } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEES_LIST" == res.data.type) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            })
            setTimeout(() => {
              invalidToken();
            }, 2000)
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '未找到信息',
              image: '../../images/fail.png',
              duration: 2000,
            })
          }
        }
      })
    }
  },
  //搜索框文本内容显示
  inputBind: function (event) {
    currentPage = 0;
    let that = this;
    let personGroupId = wx.getStorageSync('personGroupId');
    let token = wx.getStorageSync('token');
    let inputValue = that.data.inputValue;
    that.setData({
      inputValue: event.detail.value,
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_PERSON_EMPLOYEES_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            name: event.detail.value,
            personGroupId: personGroupId
          },
          orderBy: [{
            name: "asc"
          }]
        }
      },
      method: 'POST',
      success: function (res) {
        console.log(res);
        if ("SUCCESS" == res.data.code && "WX_PERSON_EMPLOYEES_LIST" == res.data.type) {
          if (0 < res.data.body.employees.length){
            res.data.body.employees.forEach((item,index)=>{
              if (!item.imgPath || "" == item.imgPath || undefined == item.imgPath){
                item.imgPath = "../../images/photo.png";
                }
            })
          }
          that.setData({
            logs: that.normalizeSinger(res.data.body.employees)
          })
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEES_LIST" == res.data.type) {
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
            duration: 2000,
          })
          that.setData({
            logs: []
          })
        }
      }
    })
  },
  normalizeSinger(list) {
    console.log("获取数据");
    console.log(list)
    let faceEnabled = wx.getStorageSync('faceEnabled');
    //人员列表渲染
    let map = {
      hot: {
        title: "",
        items: []
      }
    }
    list.forEach((item, index) => {
      if (!faceEnabled) {
        item.imgPath = ""
      }
      map.hot.items.push({
        name: item.name,
        avatar: item.imgPath,
        personid: item.id
      })
      const key = item.index
      if (!map[key]) {
        map[key] = {
          title: key,
          items: []
        }
      }
      map[key].items.push({
        name: item.name,
        avatar: item.imgPath,
        personid: item.id
      })
    })
    // 为了得到有序列表，我们需要处理 map
    let ret = []
    let hot = []
    for (let key in map) {
      let val = map[key]
      if (val.title == null){
        val.title = ""
      }else{
        if (val.title.match(/[a-zA-Z]/)) {
        ret.push(val)
      }
      }
      
    }
    ret.sort((a, b) => {
      return a.title.charCodeAt(0) - b.title.charCodeAt(0)
    })
    return hot.concat(ret)
  },
  scroll: function (e) {
    var newY = e.detail.scrollTop;
    this.scrollY(newY);
  },
  scrollY(newY) {
    const listHeight = this.data.listHeight;
    // 当滚动到顶部，newY>0
    if (newY == 0 || newY < 0) {
      this.setData({
        currentIndex: 0,
        fixedTitle: ''
      })
      return
    }
    // 在中间部分滚动
    for (let i = 0; i < listHeight.length - 1; i++) {
      let height1 = listHeight[i]
      if (listHeight[i] != 0){
        height1 = height1 -72;
      }
      let height2 = listHeight[i]
      if (newY >= height1 && newY < height2) {
        this.setData({
          currentIndex: i,
          fixedTitle: this.data.logs[i].title
        })
        this.fixedTt(height2 - newY);
        return
      }
    }
  },
  fixedTt(newVal) {
    let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
    if (this.data.fixedTop === fixedTop) {
      return
    }
    this.setData({
      fixedTop: fixedTop
    })
  },
  _calculateHeight() {
    var lHeight = [],
      that = this;
    let height = 0;
    lHeight.push(height);
    var query = wx.createSelectorQuery();
    query.selectAll('.list-group').boundingClientRect(function (rects) {
      var rect = rects,
        len = rect.length;
      for (let i = 0; i < len; i++) {
        height += rect[i].height;
        lHeight.push(height)
      }

    }).exec();
    let calHeight = setInterval(function () {
      if (lHeight != [0]) {
        that.setData({
          listHeight: lHeight
        });
        clearInterval(calHeight);
      }
    }, 1000)
  },
  scrollToview(e) {
    let id = e.target.dataset.id;
    let index = e.target.dataset.index;
    if (id == '热') {
      this.setData({
        scrollTop: 0
      })
    } else {
      this.setData({
        toSingerNum: id,
        currentIndex: index,
      })
    }
  },
  toSinger(e) {
    console.log(e);
    var id = e.currentTarget.dataset.id;
    console.log("id", id);
    wx.navigateTo({
      url: '../details/details?disstid=' + id,
    })
  },
  onReachBottom:function(e){
     console.log("触底了。。。。。。",e);
  }
})