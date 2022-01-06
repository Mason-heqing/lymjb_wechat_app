const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const updataUrl = util.updataUrl
const adminUpdataUrl = util.adminUpdataUrl
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const app = getApp()
Page({
  data: {
    tempFilePath: '',
    savedFilePath: '',
    dialog: {
      hidden: true
    }
  },
  onLoad() {
    this.setData({
      savedFilePath: wx.getStorageSync('savedFilePath')
    })
  },
  //获取本地临时图片
  chooseImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success(res) {
        that.setData({
          tempFilePath: res.tempFilePaths[0]
        })
      }
    })
  },
 //本地文件保存
  saveFile() {
    const that = this;
    let token = wx.getStorageSync('token');
    if (this.data.tempFilePath.length > 0) {
      const that = this
      wx.saveFile({
        tempFilePath: this.data.tempFilePath,
        success(res) {
          console.log(res);
          that.setData({
            savedFilePath: res.savedFilePath
          })
          wx.setStorageSync('facePath', res.savedFilePath)
          that.goto();
          wx.navigateTo({
            url: '../information/information',
          })
        },
        fail() {
          that.setData({
            dialog: {
              title: '保存失败',
              content: '请重新上传文件！',
              hidden: false
            }
          })
        }
      })
    }else{
      that.setData({
        dialog: {
          title: '保存失败',
          content: '请先上传文件！',
          hidden: false
        }
      })
    }
  },
  clear() {
    const that = this;
    wx.removeStorageSync('facePath')
    wx.setStorageSync('facePath', '')
    that.setData({
      tempFilePath: '',
      savedFilePath: ''
    })
    that.goto();
  },
  //返回上级触发函数
  goto:function(){
    let pages = getCurrentPages();
    if (pages.length > 1) {
      let prePage = pages[pages.length - 2];
      prePage.getPic("facePath");
    }
  },
  confirm() {
    this.setData({
      'dialog.hidden': true
    })
  },
  onUnload() {
    this.setData({
      tempFilePath: ''
    })
  }
})
