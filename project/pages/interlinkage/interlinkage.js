// pages/interlinkage/interlinkage.js
import WxValidate from '../../utils/WxValidate.js'
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const updataUrl = util.updataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const timeCurrent = util.formatTime
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIdcard: false,
    idNoLabel: '',
    idNoEnabled: true,
    phoneValue: "60",
    getPhone: true,
    isGetPhone:true,
    inputName:false,
    textName:true,
    inputIdNo:false,
    textIdNo:true,
    faceLabel: '',
    faceEnabled: true,
    roleName:null,
    form: {
      companyId: "",
      companyName: "",
      address:"",
      visitorType: "",
      id: "",
      wxUserId: "",
      date: "",
      faceImg:"",
      faceImgUrl:"",
      name: "",
      phone: "",
      idNo: "",
      invitationToken:"",
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this;
    console.log("邀请获取返回值",options)
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let faceLabel = wx.getStorageSync('faceLabel');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let idNoLabel = wx.getStorageSync('idNoLabel');
    if (faceEnabled && idNoEnabled){
      that.setData({
        faceEnabled: false,
        faceLabel: faceLabel,
        idNoEnabled: false,
        idNoLabel: idNoLabel,
      })
      that.initValidate("true","true")
    } else if (faceEnabled && !idNoEnabled){
      that.setData({
        faceEnabled: false,
        faceLabel: "faceLabel",
        idNoEnabled: true,
        idNoLabel: "身份证号码",
      })
      that.initValidate("true", "false")
    } else if (!faceEnabled && idNoEnabled) {
      that.setData({
        faceEnabled: true,
        faceLabel: "头像",
        idNoEnabled: false,
        idNoLabel: idNoLabel,
      })
      that.initValidate("false","true");
    }else{
      that.setData({
        faceEnabled: true,
        faceLabel: "头像",
        idNoEnabled: true,
        idNoLabel: "身份证号码",
      })
      that.initValidate("false","false")
    }
    that.setData({
      ["form.companyId"]: options.companyId,
      ["form.companyName"]: options.companyName,
      ["form.address"]: options.officeAddress,
      ["form.id"]: options.id,
      ["form.visitorType"]: options.visitorType,
      ["form.wxUserId"]: options.wxUserId,
      ["form.date"]: options.visitStartTime,
      ["form.invitationToken"]:options.invitationToken,
      roleName:options.roleName
    })
    that.getPersonInfo();
    that.isInvitationToken();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  

  //获取人员详情信息
  getPersonInfo: function () {
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
          if (res.data.body.mobilePhone) {
            that.setData({
              getPhone: true,
              isGetPhone: false,
              phoneValue: "100"
            })
          } else {
            that.setData({
              getPhone: false,
              isGetPhone: true,
              phoneValue: "60"
            })
          }
          if (!res.data.body.faceImg){
            res.data.body.faceImg = "../../images/photo.png";
          }
          if (!res.data.body.name) {
            res.data.body.name = "";
            that.setData({
              inputName:false,
              textName:true,
            })
          }else{
            that.setData({
              inputName: true,
              textName: false,
            })
          }
          if (!res.data.body.idNo) {
            res.data.body.idNo = "";
            that.setData({
              inputIdNo: false,
              textIdNo: true,
            })
          }else{
            that.setData({
              inputIdNo: true,
              textIdNo: false,
            })
          }
          that.setData({
            ['form.faceImg']: res.data.body.faceImg,
            ['form.faceImgUrl']: res.data.body.faceImg,
            ['form.name']: res.data.body.name,
            ['form.idNo']: res.data.body.idNo,
            ['form.phone']: res.data.body.mobilePhone,
          })
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_MY_COMPANY_INFO" == res.data.type) {
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


  //上传头像
  camera: function () {
    const that = this;
    let token = wx.getStorageSync('token');
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success(res) {
        var photoType = res.tempFilePaths[0].substring(res.tempFilePaths[0].length - 3);
        if ("jpg" == photoType){
          that.setData({
            ['form.faceImgUrl']: "../../images/empty.png",
            ['form.faceImg']: "../../images/empty.png",
          })
          wx.setStorageSync('savedFilePath', res.tempFilePaths[0])
          wx.showLoading({
            title: '请等待。。。',
          })
          wx.uploadFile({
            url: updataUrl,
            filePath: res.tempFilePaths[0],
            name: 'file',
            formData: {
              'user': 'test',
              token: token,
            },
            success(respon) {
              const data = JSON.parse(respon.data)
              wx.hideLoading();
              if (data.code == "SUCCESS") {
                that.setData({
                  ['form.faceImgUrl']: data.faceUrl,
                  ['form.faceImg']: data.faceUrl,
                })
                wx.showToast({
                  title: "上传成功！",
                  icon: 'success',
                  duration: 2000
                })
              } else {
                if ("未检测到人脸!" == data.msg) {
                  data.msg = "未检测到人脸,请重新上传头像!"
                } else {
                  data.msg = "上传图片体积过大,请上传小于5M体积的头像!"
                }
                wx.hideLoading();
                wx.showToast({
                  title: data.msg,
                  icon: 'none',
                  duration: 2000
                })
                that.getPersonInfo()
              }
              //do something

            }
          })
        }else{
          wx.showToast({
            title: "图片格式只支持JPG格式的图片,请重新上传头像!",
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  //获取手机号
  getPhoneNumber: function (e) {
    let that = this;
    let token = wx.getStorageSync('token');
    wx.login({
      success: res => {
        wx.request({
          url: dataUrl,
          method: "POST", //后台地址
          data: {
            type: "WX_PERSON_PHONE_NUMBER_GET",
            requestId: requestId(),
            appId: appId,
            timestamp: timeStamp,
            token: token,
            body: {
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv,
              code: res.code
            }
          },
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            if ("SUCCESS" == res.data.code && "WX_PERSON_PHONE_NUMBER_GET" == res.data.type) {
              if (res.data.body.phoneNumber) {
                //存入缓存即可
                // wx.setStorageSync('phone', res.data.body.phoneNumber);
                that.setData({
                  ['form.phone']: res.data.body.phoneNumber,
                  getPhone: true,
                  isGetPhone: false,
                  phoneValue: "100"
                })
              } else {
                wx.showToast({
                  title: "获取手机号为空！",
                  icon: 'none',
                  duration: 2000
                })
              }
            } else {
              wx.showToast({
                title: "获取手机号失败！",
                icon: 'none',
                duration: 2000
              })
            }
          },
          fail: function (err) {
            console.log(err);
          }
        })
      }
    })
  },
  trim: function(e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      ["form.name"]: e.detail.value.replace(/\s+/g, '')
    })
  },

  trimIdcard: function(e) {
    let that = this;
    let value = e.detail.value
    that.setData({
      ["form.idNo"]: value
    })
  },

  /*身份证验证输入是否正确

  *身份证号合法性验证

  *支持15位和18位身份证号

  *支持地址编码、出生日期、校验位验证*/

  getBirthAndSex: function(e) {

    let ts = this;

    let code = e //identity 为你输入的身份证
    let city = {
      11: "北京",
      12: "天津",
      13: "河北",
      14: "山西",
      15: "内蒙古",
      21: "辽宁",
      22: "吉林",
      23: "黑龙江 ",
      31: "上海",
      32: "江苏",
      33: "浙江",
      34: "安徽",
      35: "福建",
      36: "江西",
      37: "山东",
      41: "河南",
      42: "湖北 ",
      43: "湖南",
      44: "广东",
      45: "广西",
      46: "海南",
      50: "重庆",
      51: "四川",
      52: "贵州",
      53: "云南",
      54: "西藏 ",
      61: "陕西",
      62: "甘肃",
      63: "青海",
      64: "宁夏",
      65: "新疆",
      71: "台湾",
      81: "香港",
      82: "澳门",
      91: "国外 "
    };

    let tip = "";

    let pass = true;

    let reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
    if (!code || !code.match(reg)) {

      tip = "身份证号格式错误";
      if ("" == e) {
        tip = "身份证号码不能为空";
      }
      ts.showModal(tip);

      pass = false;

    } else if (!city[code.substr(0, 2)]) {

      tip = "身份证地址编码错误";
      ts.showModal(tip);

      pass = false;

    } else {

      //18位身份证需要验证最后一位校验位

      if (code.length == 18) {

        code = code.split('');

        //∑(ai×Wi)(mod 11)

        //加权因子

        let factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];

        //校验位

        let parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];

        let sum = 0;

        let ai = 0;

        let wi = 0;

        for (let i = 0; i < 17; i++) {

          ai = code[i];

          wi = factor[i];

          sum += ai * wi;

        }

        let last = parity[sum % 11];

        if (parity[sum % 11] != code[17]) {

          tip = "身份证校验位错误";
          ts.showModal(tip);

          pass = false;

        }

      }

    }
    if (!pass) {
      ts.setData({
        isIdcard: false
      })
    } else {
      ts.setData({
        isIdcard: true
      })
    }

  },

  //表单验证
  initValidate(faceImg,value) {
    let messages = {};
    let rules = {};
    if ("true" === faceImg && "true" === value){
      rules = {
        faceImgUrl: {
          required: true,
        },
        name: {
          required: true,
          nonumber: true,
        },
        phone: {
          required: true,
          tel: true
        },
        idNo: {
          required: true,
          idcard: true
        }
      }
      messages = {
        faceImgUrl: {
          required: '请上传人脸头像',
        },
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        },
        idNo: {
          required: '请输入身份证号码',
          idcard: '请输入18位的有效身份证'
        }
      }
    } else if ("true" === faceImg && "false" === value){
      rules = {
        faceImgUrl: {
          required: '请上传人脸头像',
        },
        name: {
          required: true,
          nonumber: true,
        },
        phone: {
          required: true,
          tel: true
        },
      }
      messages = {
        faceImgUrl: {
          required: '请上传人脸头像',
        },
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        },
      }
    } else if ("false" === faceImg && "true" === value){
      rules = {
        name: {
          required: true,
          nonumber: true,
        },
        phone: {
          required: true,
          tel: true
        },
        idNo: {
          required: true,
          idcard: true
        }
      }
      messages = {
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        },
        idNo: {
          required: '请输入身份证号码',
          idcard: '请输入18位的有效身份证'
        }
      }
    } else if ("false" === faceImg && "false" === value){
      rules = {
        name: {
          required: true,
          nonumber: true,
        },
        phone: {
          required: true,
          tel: true
        },
      }
      messages = {
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        },
      }
    }
    

    this.WxValidate = new WxValidate(rules, messages)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  //报错 
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    })
  },

  //验证invitationToken值是否有效 有效可点击接受邀请，否则自动跳转到首页
  isInvitationToken(){
     const that = this;
     let token = wx.getStorageSync('token');
     wx.request({
      url: dataUrl,
      data: {
        type: "WX_VERIFICATION_TOKEN",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body:{
          invitationToken:that.data.form.invitationToken
        },
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        if ("SUCCESS" == res.data.code && "WX_VERIFICATION_TOKEN" == res.data.type) {
          if('SUCCESS' != res.data.body){
            if('admin' == that.data.roleName){
              wx.switchTab({
                url: '../home/home'
              })
            }else{
              wx.redirectTo({
                url: '../myself/myself'
              })
            }
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_VERIFICATION_TOKEN" == res.data.type) {
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

  //发送邀请链接
  sendInfo: function(value) {
    const that = this;
    let token = wx.getStorageSync('token');
    let roleName = wx.getStorageSync('roleName');
    let visitorType = "";
    if ("面试" == value.visitorType) {
      visitorType = "1"
    } else if ("商务" == value.visitorType) {
      visitorType = "2"
    } else if ("快递" == value.visitorType) {
      visitorType = "3"
    } else if ("外卖" == value.visitorType) {
      visitorType = "4"
    } else if ("其他" == value.visitorType) {
      visitorType = "0"
    }
    wx.showLoading({
      title: '请等待。。。',
    })
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_ACCEPT_INVITE",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          companyId: value.companyId,
          officeAddress: value.officeAddress,
          sourceName: value.conmpanyName,
          visitorType: visitorType,
          visitStartTime: value.date,
          // faceImg: value.faceImgUrl,
          name: value.name,
          mobilePhone: value.phone,
          idNo: value.idNo,
          targetWxUserId: value.wxUserId,
          inviteId: value.id,
          invitationToken:value.invitationToken
        }
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        if ("SUCCESS" == res.data.code && "WX_ACCEPT_INVITE" == res.data.type) {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          if (roleName == "admin") {
            wx.switchTab({
              url: '../user/user'
            })
          } else {
            wx.reLaunch({
              url: '../myself/myself'
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_ACCEPT_INVITE" == res.data.type) {
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
  //发送接受邀请信息
  formSubmit: function(e) {
    const that = this;
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    if (idNoEnabled) {
      if ("" != e.detail.value.phone && "" != e.detail.value.name) {
        that.getBirthAndSex(e.detail.value.idNo);
        if (!that.data.isIdcard) {
          wx.hideLoading();
          return false;
        }
      }
    }
    if ("../../images/photo.png" == e.detail.value.faceImgUrl){
      e.detail.value.faceImgUrl = "";
    }
    const params = e.detail.value;
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      if ("idcard" != error.param) {
        this.showModal(error.msg)
      }
      return false
    } else {
      that.sendInfo(e.detail.value);
    }

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
  onShareAppMessage: function() {

  }
})