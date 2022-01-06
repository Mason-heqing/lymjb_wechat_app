//index.js
//获取应用实例
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const requestId = util.requestId
const appId = util.appId
const version = util.version
const timeStamp = Date.parse(new Date());
const app = getApp();
let scene = "";
let argsmissing = "";

Page({
  data: {
    submit: false,
    btnShow: "注册",
    // scene:"70576623ccb146dd8456a3ef96e39efc",
  },


  //事件处理函数
  onLoad: function(options) {
    let that = this;
    console.log("链接携带参数：",options);
    if (options.argsmissing){
      argsmissing = options.argsmissing;
    }
    if (options.wxUserId) {
      wx.setStorageSync('invitationToken', options.invitationToken);
      wx.setStorageSync('VwxUserId', options.wxUserId);
      wx.setStorageSync('VcompanyId', options.companyId);
      wx.setStorageSync('VcompanyName', options.companyName);
      wx.setStorageSync('Vid', options.id);
      wx.setStorageSync('VofficeAddress', options.officeAddress);
      wx.setStorageSync('VvisitStartTime', options.visitStartTime);
      wx.setStorageSync('VvisitStatus', options.visitStatus);
      wx.setStorageSync('VvisitorType', options.visitorType);
    }
    if (options.scene){
      var scenes = decodeURIComponent(options.scene);
      scene = scenes;
    }else{
      scene = "";
    }
    if (options != null && options != undefined && options.personGroupId != null && options.companyName != null) {
      wx.setStorageSync('sharePersonGroupId', options.personGroupId);
      wx.setStorageSync('shareCompanyName', options.companyName);
      wx.setStorageSync('shareInvitationToken', options.invitationToken);
    } else {
      wx.removeStorageSync('sharePersonGroupId')
      wx.removeStorageSync('shareCompanyName')
    }
    let token = wx.getStorageSync('token');
    if (token) {
      that.setData({
        // submit: true,
        btnShow: "立即体验"
      })
      wx.showLoading({
        title: '请等待。。。',
      })
      setTimeout(function() {
        wx.hideLoading();
      }, 10000)
      wx.request({
        url: dataUrl,
        method: "POST",
        data: {
          type: "WX_LOGIN_BY_TOKEN",
          requestId: requestId(),
          appId: appId,
          timestamp: timeStamp,
          token: token,
          WxAppId:wx.getAccountInfoSync().miniProgram.appId,
          body:{
            version:version,
          }
        },
        success: res => {
          console.log(res);
          let body = res.data.body;
          if ("SUCCESS" == res.data.code && "WX_LOGIN_BY_TOKEN" == res.data.type) {
            that.storage(body);
          } else if ("TOKEN_EXPIRED" == res.data.code && "WX_LOGIN_BY_TOKEN" == res.data.type) {
            that.setData({
              submit: false,
              btnShow: "立即体验"
            })
            wx.hideLoading();
            // that.login();
          }
        }
      })
    }
    if (1 == options.name || "1" == options.name) {
      wx.redirectTo({
        url: '../myself/myself'
      })
    } else if (2 == options.name || "2" == options.name) {
      wx.setStorageSync('sharePersonGroupId', options.groupId);
      wx.setStorageSync('shareCompanyName', options.name);
      wx.setStorageSync('shareInvitationToken', options.invitationToken);
      wx.redirectTo({
        url: '../firmShare/firmShare'
      })
    } else if (3 == options.name || "3" == options.name) {
      wx.redirectTo({
        url: '../audit/audit'
      })
    }
  },
  // 数据缓存
  storage: function(value) {
    const that = this;
    let shareCompanyName = wx.getStorageSync('shareCompanyName');
    let sharePersonGroupId = wx.getStorageSync('sharePersonGroupId');
    let shareInvitationToken = wx.getStorageSync('shareInvitationToken');
    let wxUserIdV = wx.getStorageSync('VwxUserId');
    wx.setStorageSync('wxUserId',value.wxUserId);

    // let scene = wx.getStorageSync('scene');
    wx.setStorageSync('token', value.token);
    wx.setStorageSync('roleName', value.roleName); //权限
    wx.setStorageSync('personGroupId', value.personGroupId);
    wx.setStorageSync('facePicPath', value.facePicPath);
    wx.setStorageSync('corporateName', value.companyName); // 绑定公司名
    wx.setStorageSync('faceEnabled', value.config.faceEnabled); //后台控制图片显示
    wx.setStorageSync('faceLabel', value.config.faceLabel); ////后台控制图片名称更换
    wx.setStorageSync('idNoEnabled', value.config.idNoEnabled); //后台控制身份证号码显示
    wx.setStorageSync('idNoLabel', value.config.idNoLabel); ////后台控制身份证号码名称更换
    wx.setStorageSync('sourcePhone', value.phone); ////通过手机号查找被访问人
    wx.setStorageSync('openId',value.openId); ////获取用户的openId
    value.unTotalAuditCount = value.unTotalAuditCount + "";
    if ("user" == app.argsmissing){
      wx.switchTab({ //管理员
        url: '../user/user'
      })
      app.argsmissing = "";
      return;
    }
    if ("myself" == app.argsmissing){
      wx.redirectTo({//普通用户
        url: '../myself/myself'
      })
      app.argsmissing = "";
      return;
    }
    if ("audit" == app.argsmissing){
      wx.switchTab({//审核信息
        url: '../audit/audit'
      })
      app.argsmissing = "";
      return;
    }
    if ("visitor" == app.argsmissing) {
      wx.redirectTo({//我的访客
        url: '../visitor/visitor'
      })
      app.argsmissing = "";
      return;
    }
    if (value.unTotalAuditCount) {
      wx.setStorageSync('unTotalAuditCount', value.unTotalAuditCount);
    }
    if (shareCompanyName || sharePersonGroupId) {
      wx.redirectTo({//员工分享
        url: '../firmShare/firmShare'
      })
    } else if (wxUserIdV) {
      let companyIdV = wx.getStorageSync('VcompanyId');
      let companyNameV = wx.getStorageSync('VcompanyName');
      let idV = wx.getStorageSync('Vid');
      let officeAddressV = wx.getStorageSync('VofficeAddress');
      let visitStartTimeV = wx.getStorageSync('VvisitStartTime');
      let visitStatusV = wx.getStorageSync('VvisitStatus');
      let visitorTypeV = wx.getStorageSync('VvisitorType');
      let invitationToken = wx.getStorageSync('invitationToken');
      wx.redirectTo({//访客邀请
        url: '../interlinkage/interlinkage?companyId=' + companyIdV + "&companyName=" + companyNameV + "&id=" + idV + "&officeAddress=" + officeAddressV + "&visitStartTime=" + visitStartTimeV + "&visitStatus=" + visitStatusV + "&visitorType=" + visitorTypeV + "&wxUserId=" + wxUserIdV + "&invitationToken=" + invitationToken + "&roleName=" + value.roleName,
      })
      wx.removeStorageSync('VwxUserId')
    } else if ("" != scene){
      wx.redirectTo({//访客预约
        url: '../makeVisitor/makeVisitor?appId=' + scene,
      })
    } else {
      if ("admin" == value.roleName) {
        console.log("管理员用户");
        wx.switchTab({
          url: '../home/home'
        })
      } else {
        console.log("普通用户");
        wx.redirectTo({
          url: '../myself/myself'
        })
      }
    }
  },
  // 登录
  login: function() {
    let that = this;
    wx.login({
      success: data => {
        console.log(data);
        // wx.hideTabBar({})
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (data.code) {
          wx.getUserInfo({
            success: function(res) {
              //3.请求自己的服务器，解密用户信息 获取unionId等加密信息
              //发起网络请求
              let userInfo = res.userInfo
              let nickName = userInfo.nickName
              let avatarUrl = userInfo.avatarUrl
              let gender = userInfo.gender //性别 0：未知、1：男、2：女
              let province = userInfo.province
              let city = userInfo.city
              let country = userInfo.country
              wx.setStorageSync('avatarUrl', userInfo.avatarUrl);
              wx.setStorageSync('gender', userInfo.gender);
              console.log("微信授权：",res)
              wx.request({
                url: dataUrl,
                method: "POST",
                data: {
                  type: "WX_LOGIN",
                  requestId: requestId(),
                  appId: appId,
                  timestamp: timeStamp,
                  body: {
                    WxAppId:wx.getAccountInfoSync().miniProgram.appId,
                    code: data.code,
                    version:version,
                    userInfo: {
                      nickName: nickName,
                      avatarUrl: avatarUrl,
                      gender: gender
                    }
                  }
                },
                success: res => {
                  let body = res.data.body;
                  wx.hideLoading();
                  console.log("登录返回值",res.data)
                  if (res.data.code == "SUCCESS" && res.data.type == "WX_LOGIN") {
                    console.log("登录成功")
                    that.storage(body);

                  } else {
                    console.log("登录失败")
                    wx.showToast({
                      title: res.data.msg,
                      icon: 'none',
                      duration: 2000
                    })
                  }
                }
              })
            },
            fail: function() {
              wx.hideLoading();
              wx.showToast({
                title: "获取用户信息失败",
                icon: 'none',
                duration: 2000
              })

            }
          })
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '登录失败！' + res.errMsg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  getUserInfo: function(e) {
    let that = this;
    wx.showLoading({
      title: '请等待。。。',
    })
    setTimeout(function() {
      wx.hideLoading();
    }, 10000)
    wx.setStorageSync("uploadImg", "0");
    wx.setStorageSync("registerImg", "0");
    wx.setStorageSync("invitationImg", "0");
    app.globalData.userInfo = e.detail.userInfo
    if (e.detail.userInfo) {
      console.log(e.detail.userInfo)
      // 登录
      that.login();
    }
  },
})