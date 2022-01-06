const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const updataUrl = util.updataUrl
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
  onShareAppMessage() {
    return {
      title: '上传文件',
      path: 'page/upload/upload'
    }
  },

  onLoad() {
    this.setData({
      savedFilePath: wx.getStorageSync('savedFilePath')
    })
  },
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
  saveFile() {
    const that = this;
    let token = wx.getStorageSync('token');
    wx.showLoading({
      title: '请等待。。。',
    })
    if (this.data.tempFilePath.length > 0) {
      const that = this
      wx.saveFile({
        tempFilePath: this.data.tempFilePath,
        success(res) {
          that.setData({
            savedFilePath: res.savedFilePath
          })
          wx.setStorageSync('savedFilePath', res.savedFilePath)
          wx.uploadFile({
            url: updataUrl, 
            filePath: res.savedFilePath,
            name: 'file',
            formData: {
              'user': 'test',
              token: token,
            },
            success(respon) {
              const data = JSON.parse(respon.data)
              wx.hideLoading();
              wx.setStorageSync('imgUrl', data.imgUrl)
              if (data.code == "SUCCESS"){
                that.setData({
                  tempFilePath: data.faceUrl
                })
                wx.showToast({
                  title: "上传成功！",
                  icon: 'success',
                  duration: 2000
                })              
                // that.setData({
                //   dialog: {
                //     title: '保存成功',
                //     // content: '下次进入应用时，此文件仍可用！',
                //     hidden: false
                //   }
                // })
                wx.navigateTo({
                  url: '../changeInfo/changeInfo',
                })
          
                that.goto("savedFilePath");
              }else{
                wx.hideLoading();
                that.clear();
                wx.showToast({
                  title: data.msg,
                  icon: 'none',
                  duration: 2000
                })  
              }
              //do something
              
            }
          })
        },
        fail() {
          wx.hideLoading();
          that.clear();
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
      wx.hideLoading();
      that.clear();
      that.setData({
        dialog: {
          title: '保存失败',
          content: '请重新上传文件！',
          hidden: false
        }
      })
    }
  },
  clear() {
    const that = this;
    wx.removeStorageSync('savedFilePath')
    wx.setStorageSync('savedFilePath', '')
    this.setData({
      tempFilePath: '',
      savedFilePath: ''
    })
    that.goto("");
  },
  goto: function (value) {
    let pages = getCurrentPages();
    if (pages.length > 1) {
      let prePage = pages[pages.length - 2];
      let presPage = pages[pages.length - 3]
      prePage.getPic(value);
      if ("pages/user/user" == presPage.route){
        presPage.getPic(value);
      } else if ("pages/myself/myself" == presPage.route){
        presPage.refresh(value);
      }
    }
  },
  confirm() {
    this.setData({
      'dialog.hidden': true
    })
  },
  
  onUnload() {
   
  }
})
