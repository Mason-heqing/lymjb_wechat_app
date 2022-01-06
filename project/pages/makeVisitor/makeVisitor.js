// pages/makeVisitor/makeVisitor.js
import WxValidate from '../../utils/WxValidate.js'
const localImgUrl = "../../images/photo.png"
const util = require('../../utils/util.js')
const adminUpdataUrl = util.adminUpdataUrl
const updataUrl = util.updataUrl
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const formatTime = util.formatTime;
const timeCurrent = util.formatTime
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
let currentYear = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(0, 4);
//获取年
// for (let i = currentYear; i <= date.getFullYear() + 5; i++) {
//   years.push("" + i);
// }
// //获取月份
// for (let i = 1; i <= 12; i++) {
//   if (i < 10) {
//     i = "0" + i;
//   }
//   months.push("" + i);
// }
// //获取日期
// for (let i = 1; i <= 31; i++) {
//   if (i < 10) {
//     i = "0" + i;
//   }
//   days.push("" + i);
// }
// //获取小时
// for (let i = 0; i < 24; i++) {
//   if (i < 10) {
//     i = "0" + i;
//   }
//   hours.push("" + i);
// }
// //获取分钟
// for (let i = 0; i < 60; i++) {
//   if (i < 10) {
//     i = "0" + i;
//   }
//   minutes.push("" + i);
// }
Page({
  data: {
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0, 9, 16, 10, 17],
    choose_year: '',
    personInfo: false,
    camera: true,
    faceLabel: "",
    faceEnabled: true,
    idNoLabel: "",
    idNoEnabled: true,
    position: 'back',
    uploadInfo: true,
    isIdcard: false,
    rangeStart: "",
    getPhone: false,
    phoneValue: "60",
    targetWxUserId:"",
    targetCompanyId:"",
    surveyedOpenId:"",
    appId:"",
    access_token:"",
    tourchPhoto:false,
    newPhoto:"",
    form: {
      faceImgUrl: "",
      faceImg: localImgUrl,
      surveyedName:"",
      firm:"",
      surveyedPhone:"",
      name: '',
      idNo: '',
      idcard: '',
      phone: '',
      asterask: "商务",
      date: ""
    },
    causeAeeay: ["商务", "快递", "外卖", "送水", "送货", "装修", "面试","其他"],
    
  },
  onLoad(options) {
    //this.getuser()
    const that = this;
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let faceLabel = wx.getStorageSync('faceLabel');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let idNoLabel = wx.getStorageSync('idNoLabel');
    let datetimes = timeCurrent(timeStamp, "Y/M/D");
    let timeStr = (datetimes.slice(0, 10)).replace(/\//g, "-");
    if (options.name || options.phone || options.firm){
      that.setData({
        ['form.surveyedName']: options.name,
        ['form.surveyedPhone']: options.phone,
        ['form.firm']: options.firm,
        targetWxUserId: options.wxUserId,
        targetCompanyId: options.companyId,
        surveyedOpenId: options.openId,
      })
    }
    if (options.appId){
       that.setData({
         appId:options.appId
       })
    }
    that.setData({
      faceLabel: faceLabel,
      idNoLabel: idNoLabel,
    })
    if (idNoEnabled && faceEnabled) {
      that.setData({
        idNoEnabled: false,
        faceEnabled: false
      })
      that.initValidate("true", "true") //验证规则函数
    } else if (idNoEnabled && !faceEnabled) {
      that.setData({
        idNoEnabled: false,
        faceEnabled: true
      })
      that.initValidate("true", "false") //验证规则函数
    } else if (!idNoEnabled && faceEnabled) {
      that.setData({
        idNoEnabled: true,
        faceEnabled: false
      })
      that.initValidate("false", "true") //验证规则函数
    } else if (!idNoEnabled && !faceEnabled) {
      that.setData({
        idNoEnabled: true,
        faceEnabled: true
      })
      that.initValidate("false", "false") //验证规则函数
    }
    that.setData({
      ['form.faceImgUrl']: "../../images/photo.png",
      ['form.faceImg']: "../../images/photo.png",
      ["form.date"]: timeStr,
      rangeStart: timeStr
      // rangeStart: timeStr,
      // choose_year: that.data.multiArray[0][0],
    })
    // that.currentTime();
    // that.accessToken();
    that.getPersonInfo();
    
  },
 

  //选择被访问人
  surveyedName:function(){
    //let appId = 
    const that = this;
    wx.navigateTo({
      url: '../choosePerson/choosePerson?appId=' + that.data.appId,
    })
  },
  //选择访问事由
  causeSelect: function (e) {
    const that = this;
    that.setData({
      ["form.asterask"]: that.data.causeAeeay[e.detail.value],
    })
  },
  
  // currentTime: function () {
  //   const that = this;
  //   let currentMonth = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(5, 7);
  //   let currentDays = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(8, 10);
  //   let currentHours = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(11, 13);
  //   let currentMinutes = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(14, 16);
  //   const dateIndex = ((arr, item) => {
  //     for (let i in arr) {
  //       if (arr[i] == item) {
  //         return i;
  //       }
  //     }
  //   })
  //   let monthIndex = dateIndex(months, currentMonth);
  //   let daysIndex = dateIndex(days, currentDays);
  //   let hoursIndex = dateIndex(hours, currentHours);
  //   let minutesIndex = dateIndex(minutes, currentMinutes);
  //   that.setData({
  //     multiIndex: [0, monthIndex, daysIndex, hoursIndex, minutesIndex],
  //   })
  // },

  //获取时间日期
  bindMultiPickerChange:function(e){
    const that = this;
       that.setData({
         ["form.date"]: e.detail.value
    })
  },

  // bindMultiPickerChange: function (e) {
  //   const that = this;
  //   that.setData({
  //     multiIndex: e.detail.value
  //   })
  //   const index = that.data.multiIndex;
  //   const year = that.data.multiArray[0][index[0]];
  //   const month = that.data.multiArray[1][index[1]];
  //   const day = that.data.multiArray[2][index[2]];
  //   const hour = that.data.multiArray[3][index[3]];
  //   const minute = that.data.multiArray[4][index[4]];
  //   let dateSelect = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
  //   if (new Date(dateSelect).getTime() + 60000 < new Date().getTime()) {
  //     that.currentTime();
  //     that.showModal("访问日期不能选择小于当前日期");
  //   } else {
  //     that.setData({
  //       time: dateSelect,
  //       ["form.date"]: year + '-' + month + '-' + day + ' ' + hour + ':' + minute,
  //     })
  //   }
  // },
  //监听picker的滚动事件
  // bindMultiPickerColumnChange: function (e) {
  //   const that = this;
  //   clearInterval(that.data.realTime);
  //   //获取年份
  //   if (e.detail.column == 0) {
  //     let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
  //     this.setData({
  //       choose_year
  //     })
  //   }
  //   if (e.detail.column == 1) {
  //     let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
  //     let temp = [];
  //     if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
  //       for (let i = 1; i <= 31; i++) {
  //         if (i < 10) {
  //           i = "0" + i;
  //         }
  //         temp.push("" + i);
  //       }
  //       this.setData({
  //         ['multiArray[2]']: temp
  //       });
  //     } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
  //       for (let i = 1; i <= 30; i++) {
  //         if (i < 10) {
  //           i = "0" + i;
  //         }
  //         temp.push("" + i);
  //       }
  //       this.setData({
  //         ['multiArray[2]']: temp
  //       });
  //     } else if (num == 2) { //判断2月份天数
  //       let year = parseInt(this.data.choose_year);
  //       if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
  //         for (let i = 1; i <= 29; i++) {
  //           if (i < 10) {
  //             i = "0" + i;
  //           }
  //           temp.push("" + i);
  //         }
  //         this.setData({
  //           ['multiArray[2]']: temp
  //         });
  //       } else {
  //         for (let i = 1; i <= 28; i++) {
  //           if (i < 10) {
  //             i = "0" + i;
  //           }
  //           temp.push("" + i);
  //         }
  //         this.setData({
  //           ['multiArray[2]']: temp
  //         });
  //       }
  //     }
  //   }
  //   var data = {
  //     multiArray: this.data.multiArray,
  //     multiIndex: this.data.multiIndex
  //   };
  //   data.multiIndex[e.detail.column] = e.detail.value;
  //   this.setData(data);
  // },

  showInFo: function () {
    let that = this;
    that.setData({
      uploadInfo: true
    })
  },

  //获取访客信息
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
          if (!res.data.body.name) {
            res.data.body.name = "";
          }
          if (!res.data.body.mobilePhone) {
            res.data.body.mobilePhone = "";
            that.setData({
              getPhone: false,
              phoneValue: "60"
            })
          }else{
              that.setData({
                getPhone: true,
                phoneValue: "100"
              })
          }
          if (!res.data.body.faceImg) {
            res.data.body.faceImg = "../../images/photo.png";
          }
          if (!res.data.body.idNo){
            res.data.body.idNo = "";
          }

          that.setData({
            ["form.name"]: res.data.body.name,
            ["form.faceImg"]: res.data.body.faceImg,
            ["form.faceImgUrl"]: res.data.body.faceImg,
            ["form.phone"]: res.data.body.mobilePhone,
            ["form.idcard"]: res.data.body.idNo,
            newPhoto: res.data.body.faceImg,
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




  //获取手机号
  getPhoneNumber: function (e) {
    let that = this;
    let token = wx.getStorageSync('token');
    wx.login({
      success: res => {
        wx.showLoading({
          title: '获取手机号中...',
        })
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
            wx.hideLoading()
            if ("SUCCESS" == res.data.code && "WX_PERSON_PHONE_NUMBER_GET" == res.data.type) {
              if (res.data.body.phoneNumber) {
                //存入缓存即可
                // wx.setStorageSync('phone', res.data.body.phoneNumber);
                that.setData({
                  ['form.phone']: res.data.body.phoneNumber,
                  getPhone: true,
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
            wx.hideLoading()
            console.log(err);
          }
        })
      }
    })
  },


onShow() {
    let that = this;
    // let updataUrl = wx.getStorageSync('updataUrl');
    let registerImg = wx.getStorageSync('registerImg');
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let idNoLabel = wx.getStorageSync('idNoLabel');
    // that.getPersonInfo();
    if (idNoEnabled) {
      that.setData({
        idNoEnabled: false
      })
    }
    if (idNoLabel) {
      that.setData({
        idNoLabel: idNoLabel
      })
    } else {
      that.setData({
        idNoLabel: "身份证号码"
      })
    }
    if ("0" === registerImg && faceEnabled) {
      that.setData({
        uploadInfo: false
      })
      wx.setStorageSync("registerImg", "1");
    } else {
      that.setData({
        uploadInfo: true
      })
    }
    that.getPic("");
    var pages = getCurrentPages().length;
    if (2 < pages) {
      wx.navigateBack({
        delta: 2
      })
    }
  },
  getPic: function (value) {
    const that = this;
    if ("facePath" == value) {
      let facePath = wx.getStorageSync('facePath');
      if (facePath != "") {
        that.setData({
          ['form.faceImgUrl']: facePath,
          ['form.faceImg']: facePath,
        })
      } else {
        that.setData({
          ['form.faceImgUrl']: "../../images/photo.png",
          ['form.faceImg']: "../../images/photo.png",
        })
      }
    }

  },
  onUnload() {
    getApp().faceImgUrl = localImgUrl;
  },
  //报错 
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    })
  },
  /*身份证验证输入是否正确

  *身份证号合法性验证

  *支持15位和18位身份证号

  *支持地址编码、出生日期、校验位验证*/

  getBirthAndSex: function (e) {

    let ts = this;

    let code = e //identity 为你输入的身份证

    let city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };

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
  
 //获取小程序唯一凭证
  accessToken: function(){
    const that = this;
    wx.request({
      url: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential" + "&appid=wx960b9c007f135229" + "&secret=e7b528f7c06ba0604b6af5900e857071" ,
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res.data.access_token){
          that.setData({
            access_token: res.data.access_token
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
 },

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
              wx.hideLoading();
              const data = JSON.parse(respon.data)
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
                var title = "";
                if ("" == that.data.newPhoto || "../../images/photo.png" == that.data.newPhoto) {
                  that.setData({
                    ['form.faceImgUrl']: "../../images/photo.png",
                    ['form.faceImg']: "../../images/photo.png",
                  })
                } else {
                  that.setData({
                    ['form.faceImgUrl']: that.data.newPhoto,
                    ['form.faceImg']: that.data.newPhoto,
                  })
                } 
                if ("未检测到人脸!" == data.msg){
                  title = "未检测到人脸,请重新上传访客照片!"
                }else{
                  title = "上传图片体积过大,请上传小于5M体积的访客照片!"
                }
                wx.showToast({
                  title: title,
                  icon: 'none',
                  duration: 2000
                })
              }
              //do something

            }
          })
        }else{
          wx.showToast({
            title: "图片格式只支持JPG格式的图片,请重新上传访客照片!",
            icon: 'none',
            duration: 2000
          })
        }
        
      }
    })
  },
  togglePosition() {
    this.setData({
      position: this.data.position === 'front' ?
        'back' : 'front'
    })
  },
  //去除输入框前后空格
  trim: function (e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      ["form.name"]: e.detail.value.replace(/\s+/g, '')
    })
  },
  trimIdcard: function (e) {
    let that = this;
    let value = e.detail.value;
    that.setData({
      ["form.idcard"]: value
    })
  },
  trimPhone: function (e) {
    let that = this;
    let value = this.validateNumber(e.detail.value)
    that.setData({
      ["form.phone"]: value
    })
  },
  validateNumber(val) {
    return val.replace(/\D/g, '')
  },
  //验证函数
  initValidate(idcard, faceImg) {
    let messages = {};
    let rules = {};

    if ("true" == idcard && "true" == faceImg) {
      rules = {
        surveyedName:{
          required: true,
        },
        firm:{
          required: true,
        },
        surveyedPhone: {
          required: true,
        },
        name: {
          required: true,
          nonumber: true,
        },
        faceImgUrl: {
          required: true,
        },
        phone: {
          required: true,
          tel: true
        },
        idcard: {
          required: true,
          idcard: true
        }
      }
      messages = {
        surveyedName:{
          required: '被访人姓名不能为空!',
        },
        firm:{
          required: '被访企业不能为空!',
        },
        surveyedPhone: {
          required: '被访人手机号不能为空!',
        },
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        faceImgUrl: {
          required: '请上传人脸头像',
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        },
        idcard: {
          required: '请输入身份证号码',
          idcard: '请输入18位的有效身份证'
        }
      }
    } else if ("false" == idcard && "false" == faceImg) {
      rules = {
        surveyedName: {
          required: true,
        },
        firm: {
          required: true,
        },
        surveyedPhone: {
          required: true,
        },
        name: {
          required: true,
          nonumber: true,
        },
        phone: {
          required: true,
          tel: true
        }
      }
      messages = {
        surveyedName: {
          required: '被访人姓名不能为空!',
        },
        firm: {
          required: '被访企业不能为空!',
        },
        surveyedPhone: {
          required: '被访人手机号不能为空!',
        },
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        }
      }
    } else if ("true" == idcard && "false" == faceImg) {
      rules = {
        surveyedName: {
          required: true,
        },
        firm: {
          required: true,
        },
        surveyedPhone:{
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
        idcard: {
          required: true,
          idcard: true
        }
      }
      messages = {
        surveyedName: {
          required: '被访人姓名不能为空!',
        },
        firm: {
          required: '被访企业不能为空!',
        },
        surveyedPhone: {
          required: '被访人手机号不能为空!',
        },
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        },
        idcard: {
          required: '请输入身份证号码',
          idcard: '请输入18位的有效身份证'
        }
      }
    } else if ("false" == idcard && "true" == faceImg) {
      rules = {
        surveyedName: {
          required: true,
        },
        firm: {
          required: true,
        },
        surveyedPhone:{
          required: true,
        },
        name: {
          required: true,
          nonumber: true,
        },
        faceImgUrl: {
          required: true,
        },
        phone: {
          required: true,
          tel: true
        }
      }
      messages = {
        surveyedName: {
          required: '被访人姓名不能为空!',
        },
        firm: {
          required: '被访企业不能为空!',
        },
        surveyedPhone:{
          required: '被访人手机号不能为空!',
        },
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        faceImgUrl: {
          required: '请上传人脸头像',
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        }
      }
    }



    this.WxValidate = new WxValidate(rules, messages)
  },

  //推送消息
  pushInfo:function(){
    const that = this;
    let openId = wx.getStorageSync('openId');
    // let openId = that.data.surveyedOpenId; //被访问人的openId
    wx.request({
      url: "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=" + that.data.access_token, 
      method: "POST",
      data: {
        touser: openId,
        template_id: "J8U_D6PVA7CiWT5bcbwS5oS46wqC8XWyDFyB8vraLO8",
        page: "makeVisitor",
        miniprogram_state: "developer",
        lang: "zh_CN",
        data: {
          "name1": {
            "value": "张三"
          },
          "phrase2": {
            "value": "已通过"
          },
          "thing3": {
            "value": "申请加入深圳市芊熠智能硬件有限公司"
          },
          "time4": {
            "value": "2020年4月21日 14:01"
          }
        }
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
      }
    })
  },


  //调用验证函数
  formSubmit: function (e) {
    const that = this;
    let personGroupId = wx.getStorageSync('personGroupId');
    let token = wx.getStorageSync('token');
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let roleName = wx.getStorageSync('roleName');
    if ("面试" == e.detail.value.asterask) {
      e.detail.value.asterask = "1"
    } else if ("商务" == e.detail.value.asterask) {
      e.detail.value.asterask = "2"
    } else if ("快递" == e.detail.value.asterask) {
      e.detail.value.asterask = "3"
    } else if ("外卖" == e.detail.value.asterask) {
      e.detail.value.asterask = "4"
    } else if ("其他" == e.detail.value.asterask) {
      e.detail.value.asterask = "0"
    } else if ("送水" == e.detail.value.asterask) {
      e.detail.value.asterask = "5"
    } else if ("送货" == e.detail.value.asterask) {
      e.detail.value.asterask = "6"
    } else if ("装修" == e.detail.value.asterask) {
      e.detail.value.asterask = "7"
    }
    if ("../../images/photo.png" == e.detail.value.faceImgUrl) {
      e.detail.value.faceImgUrl = "";
    }
    let facePath = e.detail.value.faceImgUrl;
    if (faceEnabled && idNoEnabled) {
      if ("" != facePath && "" != e.detail.value.name) {
        that.getBirthAndSex(e.detail.value.idcard);
        if (!that.data.isIdcard) {
          return false;
        }
      }
    } else if (!faceEnabled && idNoEnabled) {
      if ("" != e.detail.value.name) {
        that.getBirthAndSex(e.detail.value.idcard);
        if (!that.data.isIdcard) {
          return false;
        }
      }
    }

    if ("../../images/photo.png" == e.detail.value.faceImgUrl) {
      e.detail.value.faceImgUrl = "";
    }
    let params = e.detail.value;
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0];
      if ("idcard" != error.param) {
        this.showModal(error.msg)
      }
      return false
    } else {
      //我的访客信息提交
    
      wx.showLoading({
        title: '请等待。。。',
      })
      if (facePath != "") {
        wx.request({
          url: dataUrl,
          method: "POST",
          data: {
            type: "WX_APPOINTMENT_VISIT_INFO",
            requestId: requestId(),
            appId: appId,
            timestamp: timeStamp,
            token: token,
            body: {
              targetWxUserId: that.data.targetWxUserId,
              targetCompanyId: that.data.targetCompanyId,
              targetName: e.detail.value.surveyedName,
              targetCompanyName: e.detail.value.firm,
              surveyedPhone: e.detail.value.surveyedPhone,
              visitorType: e.detail.value.asterask,
              visitStartTime: e.detail.value.date,
              name: e.detail.value.name,
              phone: e.detail.value.phone,
              idNo: e.detail.value.idcard,
              // imgPath: facePath,
              appId: that.data.appId,
              // personGroupId: personGroupId
            }
          },
          success: res => {
            wx.hideLoading();
            if ("SUCCESS" == res.data.code && "WX_APPOINTMENT_VISIT_INFO" == res.data.type) {
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
            } else if ("TOKEN_EXPIRED" == res.data.code && "WX_APPOINTMENT_VISIT_INFO" == res.data.type) {
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
        
      } else {
        wx.request({
          url: dataUrl,
          method: "POST",
          data: {
            type: "WX_PERSON_EMPLOYEE_REGISTER",
            requestId: requestId(),
            appId: appId,
            timestamp: timeStamp,
            token: token,
            body: {
              surveyedName: e.detail.value.surveyedName,
              firm: e.detail.value.firm,
              surveyedPhone: e.detail.value.surveyedPhone,
              asterask: e.detail.value.asterask,
              date: e.detail.value.date,
              name: e.detail.value.name,
              mobilePhone: e.detail.value.phone,
              idNo: e.detail.value.idcard,
              faceImg: data.faceUrl,
              appId: that.data.appId,
            }
          },
          success: res => {
            wx.hideLoading();
            if ("SUCCESS" == res.data.code && "WX_PERSON_EMPLOYEE_REGISTER" == res.data.type) {
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
            } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEE_REGISTER" == res.data.type) {
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
                title: "res.data.msg",
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    }
  }
})