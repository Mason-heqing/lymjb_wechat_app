// pages/details/details.js
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
     src:'../../images/photo.png',
     faceLabel:'',
    faceEnabled:true,
    idNoLabel: "",
    idNoEnabled: true,
    hideBtn:true,
     name:'',
     phone:'',
     gender:'',
     idcard:'',
     disstid:'',
  },
  /**
   * 事件处理
   */
  deletePerson:function(){
    const that = this;
    let id = that.data.disstid;
    let token = wx.getStorageSync('token');
    wx.showModal({
      title: '删除员工',
      content: '删除后，该员工将无法通行，确定要删除吗？',
      showCancel:true,
      cancelColor:"#3399ea",
      confirmColor:"#3399ea",
      success(res) {
        if (res.confirm) {
          //删除员工数据
            wx.request({
              url: dataUrl,
              method:"POST",
              data: {
                type: "WX_PERSON_EMPLOYEES_REMOVE",
                requestId: requestId(),
                appId: appId,
                timestamp: timeStamp,
                token: token,
                body:{
                  id: id
                }
              },
              success: res => {
                if (res.data.code == "SUCCESS" && res.data.type == "WX_PERSON_EMPLOYEES_REMOVE"){
                  wx.showToast({
                    title: '成功',
                    icon: 'success',
                    duration: 2000
                  })
                  wx.navigateTo({
                    url: '../employees/employees'
                  })
                  let pages = getCurrentPages();
                  if (pages.length > 1) {
                    let prePage = pages[pages.length - 2];
                    console.log(prePage);
                    prePage.onLoad();
                    app.globalData.deletePerson = true
                  }
                } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEES_REMOVE" == res.data.type){
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
                    title: '删除失败',
                    icon: 'none',
                    duration: 2000
                  })
                }
              }
            })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let token = wx.getStorageSync('token');
    let faceLabel = wx.getStorageSync('faceLabel');
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let idNoLabel = wx.getStorageSync('idNoLabel');
    if (idNoEnabled){
      that.setData({
        idNoEnabled: false
      })
    }else{
      that.setData({
        idNoEnabled: true
      })
    }
    if (faceEnabled){
      that.setData({
        faceEnabled:false
      })
    }else{
      that.setData({
        faceEnabled: true
      })
    }
    that.setData({
      faceLabel: faceLabel,
      idNoLabel: idNoLabel
    })
    that.setData({
      disstid: options.disstid
    })
    wx.request({
      url: dataUrl,
      method: "POST",
      data: {
        type: "WX_PERSON_EMPLOYEES_DETAIL",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          id: options.disstid
        }
      },
      success: res => {
        console.log(res);
        if ("SUCCESS" == res.data.code && "WX_PERSON_EMPLOYEES_DETAIL" == res.data.type ) {
          if (res.data.body.self){
             that.setData({
               hideBtn:true
             })
          }else{
            that.setData({
              hideBtn: false
            })
          }
          if (!res.data.body.imgPath){
            res.data.body.imgPath = "../../images/photo.png"
          }
          if (!res.data.body.idNo){
            res.data.body.idNo = ""
          }
          that.setData({
            src: res.data.body.imgPath,
            name: res.data.body.name,
            idcard:res.data.body.idNo,
            phone: res.data.body.mobilePhone,
            gender: res.data.body.sex,
            idcard: res.data.body.idNo,
          })
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEES_DETAIL" == res.data.type){
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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