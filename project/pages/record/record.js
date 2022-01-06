// pages/record/record.js
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

  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight: 0,
    recordList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    currentPage = 0;
    wx.getSystemInfo({
      success: function (res) {
        // 可使用窗口宽度、高度
        // 计算主体部分高度,单位为px
        that.setData({
          // cameraHeight部分高度 = 利用窗口可使用高度 - 固定高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
          scrollHeight: res.windowHeight - res.windowWidth / 750 * 60
        })
      }
    });
    that.getRecordList();
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
    currentPage = 0;
    
  },

  //分享邀约链接
  invitationLink:function(e){
    let companyId = e.currentTarget.dataset.info.companyId;
    let companyName = e.currentTarget.dataset.info.companyName;
    let officeAddress = e.currentTarget.dataset.info.officeAddress;
    let visitStartTime = e.currentTarget.dataset.info.visitStartTime;
    let visitorType = e.currentTarget.dataset.info.visitorType;
    let id = e.currentTarget.dataset.info.id;
    let wxUserId = e.currentTarget.dataset.info.wxUserId;

    wx.navigateTo({
      url: '../interlinkage/interlinkage?companyName=' + companyName + "&officeAddress=" + officeAddress + "&visitStartTime=" + visitStartTime + "&visitorType=" + visitorType + "&id=" + id + "&wxUserId=" + wxUserId + "&companyId=" + companyId,
    })
  },
 
 //删除邀约记录
  invitationDelete:function(e){
    const that = this;
    let id = e.currentTarget.dataset.id;
    let token = wx.getStorageSync('token');
    let invitationCompanyName = wx.getStorageSync('invitationCompanyName');
    let invitationAddress = wx.getStorageSync('invitationAddress');
    let invitationType = wx.getStorageSync('invitationType');
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
              type: "WX_INVITE_REMOVE_REMOVE",
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
              if ("SUCCESS" == res.data.code && "WX_INVITE_REMOVE_REMOVE" == res.data.type) {
                wx.showToast({
                  title: '删除记录成功',
                  icon: 'success',
                  duration: 2000
                })
                currentPage = 0;
                wx.request({
                  url: dataUrl,
                  data: {
                    type: "WX_INVITE_VISIT_LIST",
                    requestId: requestId(),
                    appId: appId,
                    timestamp: timeStamp,
                    token: token,
                    body: {
                      currentPage: currentPage,
                      pageSize: pageSize,
                      condition: {
                        conmpayName: invitationCompanyName,
                        officeAddress: invitationAddress,
                        visitorType: invitationType
                      },
                      orderBy: [
                        { " visit_start_time": "desc" }
                      ],
                    }
                  },
                  method: 'POST',
                  success: function (res) {
                    wx.hideLoading();
                    if ("SUCCESS" == res.data.code && "WX_INVITE_VISIT_LIST" == res.data.type) {
                      if (res.data.body.pageSize > 0) {
                        res.data.body.inviterList.forEach(function (item, index) {
                          item.visitStartTime = item.visitStartTime.slice(0, 16);
                          if (1 == item.visitorType) {
                            item.visitorType = "面试";
                          } else if (2 == item.visitorType) {
                            item.visitorType = "商务"
                          } else if (3 == item.visitorType) {
                            item.visitorType = "快递"
                          } else if (4 == item.visitorType) {
                            item.visitorType = "外卖"
                          } else if (5 == item.visitorType) {
                            item.visitorType = "送水"
                          } else if (6 == item.visitorType) {
                            item.visitorType = "送货"
                          } else if (7 == item.visitorType) {
                            item.visitorType = "装修"
                          } else if (0 == item.visitorType) {
                            item.visitorType = "其他"
                          }
                        })
                        that.setData({
                          recordList: res.data.body.inviterList,
                        })
                      } else {
                        wx.showToast({
                          title: "没有数据了",
                          icon: 'success',
                          duration: 2000
                        })
                        that.setData({
                          recordList: [],
                        })
                      }
                    } else if ("TOKEN_EXPIRED" == res.data.code && "WX_INVITE_VISIT_LIST" == res.data.type) {
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
              } else if ("TOKEN_EXPIRED" == res.data.code && "WX_INVITE_VISIT_LIST" == res.data.type) {
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

  //获取邀请记录列表
  getRecordList: function (value) {
    const that = this;
    let token = wx.getStorageSync('token');
    let invitationCompanyName = wx.getStorageSync('invitationCompanyName');
    let invitationAddress = wx.getStorageSync('invitationAddress');
    let invitationType = wx.getStorageSync('invitationType');
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_INVITE_VISIT_LIST",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
          condition: {
            conmpayName: invitationCompanyName,
            officeAddress: invitationAddress,
            visitorType: invitationType
          },
          orderBy: [
            { " visit_start_time": "desc" }
          ],
        }
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if ("SUCCESS" == res.data.code && "WX_INVITE_VISIT_LIST" == res.data.type) {
          currentPage++
          if (currentPage >= res.data.body.pageCount) {
            currentPage = res.data.body.pageCount
          } 
          if (res.data.body.inviterList.length > 0){
            res.data.body.inviterList.forEach(function(item,index){
              if (!item.visitStartTime) {
                item.visitStartTime = "";
              }else{
                item.visitStartTime = item.visitStartTime.slice(0, 16);
              }
              if ( 1 == item.visitorType){
                item.visitorType = "面试";
              } else if (2 == item.visitorType){
                item.visitorType = "商务"
              } else if (3 == item.visitorType){
                item.visitorType = "快递"
              } else if (4 == item.visitorType){
                item.visitorType = "外卖"
              } else if (5 == item.visitorType) {
                item.visitorType = "送水"
              } else if (6 == item.visitorType) {
                item.visitorType = "送货"
              } else if (7 == item.visitorType) {
                item.visitorType = "装修"
              } else if (0 == item.visitorType){
                item.visitorType = "其他"
              }else {
                item.visitorType = "";
              }
              if (!item.companyName){
                item.companyName = "";
              }
              if (!item.officeAddress){
                item.officeAddress = "";
              }
              
            })
            let oldData = that.data.recordList;
            that.setData({
              recordList: oldData.concat(res.data.body.inviterList),
            })
          } else {
            wx.showToast({
              title: "没有数据了",
              icon: 'success',
              duration: 2000
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_INVITE_VISIT_LIST" == res.data.type) {
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
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
    
  //触底刷新
  upper:function(e){
    const that = this;
    that.getRecordList();
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
  onShareAppMessage: function (e) {
    const that = this;
    let invitation = that.data.recordList[e.target.dataset.index];
    let companyId = invitation.companyId;
    let companyName = invitation.companyName;
    let id = invitation.id;
    let officeAddress = invitation.officeAddress;
    let visitEndTime = invitation.visitEndTime;
    let visitStartTime = invitation.visitStartTime;
    let visitorType = invitation.visitorType;
    let wxUserId = invitation.wxUserId;
    return {
      title: '邀请您访问:' + companyName,
      path: '/pages/index/index?companyId=' + companyId + "&companyName=" + companyName + "&id=" + id + "&officeAddress=" + officeAddress + "&visitStartTime="  + visitStartTime + "&visitorType=" + visitorType + "&wxUserId=" + wxUserId,
      imageUrl: '/images/amd.png',
    }
  }
})