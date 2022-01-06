import WxValidate from '../../utils/WxValidate.js'
const localImgUrl = "../../images/photo.png"
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const updataUrl = util.updataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const app = getApp()
Page({
  data: {
    shareSubmit: true,
    btnName: "",
    personInfo: false,
    camera: true,
    faceEnabled: true,
    faceLabel: '',
    idNoLabel:'',
    idNoEnabled:true,
    position: 'back',
    getPhone: false,
    phoneValue: "60",
    uploadInfo:true,
    isIdcard: false,
    code:"",
    form: {
      faceImgUrl: "",
      faceImg: localImgUrl,
      name: '',
      idcard: '',
      phone: '',
      email: '',
      gender: [{
          value: '1',
          name: '男'
        },
        {
          value: '2',
          name: '女'
        },
      ],
    }
  },
  //获取手机号
  getPhoneNumber: function(e) {
    let that = this;
    let token = wx.getStorageSync('token');
    wx.login({
      success: res => {
        console.log("code值", res.code);
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
          success: function(res) {
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
              console.log("获取手机号失败",res);
              wx.showToast({
                title: "获取手机号失败！",
                icon: 'none',
                duration: 2000
              })
            }
          },
          fail: function(err) {
            wx.hideLoading()
            console.log(err);
          }
        })
      }
    })
  },
  onLoad() {
    //this.getuser()
    const that = this;
    let sex = [];
    let personImg = wx.getStorageSync('personImg');
    let personName = wx.getStorageSync('personName');
    let personIdcard = wx.getStorageSync('personIdcard');
    console.log("获取身份证信息---->", personIdcard)
    let personPhone = wx.getStorageSync('personPhone');
    let personGender = wx.getStorageSync('personGender');
    if (!personImg){
      personImg = "../../images/photo.png";
    }
    if ("请完善个人信息" == personName) {
      personName = "";
    }
    if (personPhone) {
      that.setData({
        getPhone: true,
        phoneValue: "100"
      })
    } else {
      that.setData({
        getPhone: false,
        phoneValue: "60"
      })
    }
    if ("男" == personGender) {
      sex = [{
          value: '1',
          name: '男',
          checked: 'true'
        },
        {
          value: '2',
          name: '女'
        },
      ]
    } else if ("女" == personGender) {
      sex = [{
          value: '1',
          name: '男'
        },
        {
          value: '2',
          name: '女',
          checked: 'true'
        },
      ]
    } else {
      sex = [{
          value: '1',
          name: '男',
          checked: 'true'
        },
        {
          value: '2',
          name: '女'
        },
      ]
    }
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let faceLabel = wx.getStorageSync('faceLabel');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let idNoLabel = wx.getStorageSync('idNoLabel');
    let shareCompanyName = wx.getStorageSync('shareCompanyName');
    console.log("获取图片信息:-->", idNoEnabled, idNoLabel);
    console.log("获取身份证信息:-->", faceEnabled, faceLabel);
    if (shareCompanyName) {
      that.setData({
        shareSubmit: false,
        btnName: shareCompanyName,
        ['form.name']: "",
      })
    }
    that.setData({
      faceLabel: faceLabel,
      idNoLabel: idNoLabel
    })
    if (idNoEnabled && faceEnabled) {
      console.log("全部获取");
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
      ['form.faceImgUrl']: personImg,
      ['form.faceImg']: personImg,
      ['form.name']: personName,
      ['form.idcard']: personIdcard,
      ['form.phone']: personPhone,
      ['form.gender']: sex,
    })
    // that.getPersonInfo();

  },
  //去除输入框前后空格
  trim: function(e) {
    var name = e.currentTarget.dataset.name;
    this.setData({
      ["form.name"]: e.detail.value.replace(/\s+/g, '')
    })
  },
  trimIdcard: function (e) {
    let that = this;
    // let value = this.validateNumber(e.detail.value)
    let value = e.detail.value
    value.replace(/\D/g, '')
    that.setData({
      ["form.idcard"]:value
    })
  },
  validateNumber(val) {
    return val.replace(/\D/g, '')
  },
  //获取人员详情信息
  getPersonInfo: function() {
    const that = this;
    let token = wx.getStorageSync('token');
    let gender = wx.getStorageSync('gender');
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
        console.log(res);
        if (res.data.code == "SUCCESS" && res.data.type == "WX_PERSON_MY_COMPANY_INFO") {
          let sex = [];
          console.log("获取人员信息",res);
          if (!res.data.body.companyName) {
            res.data.body.companyName = "未绑定企业"
          }
          if (!res.data.body.faceImg) {
            res.data.body.faceImg = "../../images/photo.png";
          }
          if (res.data.body.mobilePhone) {
            that.setData({
              getPhone: true,
              phoneValue: "100"
            })
          } else {
            that.setData({
              getPhone: false,
              phoneValue: "60"
            })
          }
          // if (!res.data.body.name) {
          //   res.data.body.name = "请输入姓名";
          // }
          if ("男" == res.data.body.sex) {
            sex = [{
                value: '1',
                name: '男',
                checked: 'true'
              },
              {
                value: '2',
                name: '女'
              },
            ]
          } else if ("女" == res.data.body.sex) {
            sex = [{
                value: '1',
                name: '男'
              },
              {
                value: '2',
                name: '女',
                checked: 'true'
              },
            ]
          } else if ("未知" == res.data.body.sex) {
            if (1 == gender) {
              sex = [{
                  value: '1',
                  name: '男',
                  checked: 'true'
                },
                {
                  value: '2',
                  name: '女'
                },
              ]
            } else if (2 == gender) {
              sex = [{
                  value: '1',
                  name: '男',
                },
                {
                  value: '2',
                  name: '女',
                  checked: 'true'
                },
              ]
            } else {
              sex = [{
                  value: '1',
                  name: '男',
                },
                {
                  value: '2',
                  name: '女',
                },
              ]
            }
          } else {
            sex = [{
                value: '1',
                name: '男'
              },
              {
                value: '2',
                name: '女'
              },
            ]
          }
          that.setData({
            ['form.faceImgUrl']: res.data.body.faceImg,
            ['form.faceImg']: res.data.body.faceImg,
            ['form.name']: res.data.body.name,
            ['form.idcard']: res.data.body.idNo,
            ['form.phone']: res.data.body.mobilePhone,
            ['form.gender']: sex,
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
  showInFo: function () {
    let that = this;
    that.setData({
      uploadInfo: true
    })
  },
  onShow(options) {
    const that = this;
    // that.getPic("")
    // that.getPersonInfo()
    let uploadImg = wx.getStorageSync('uploadImg');
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let idNoLabel = wx.getStorageSync('idNoLabel');
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
    if ("0" === uploadImg && faceEnabled) {
      that.setData({
        uploadInfo: false
      })
      wx.setStorageSync("uploadImg", "1");
    } else {
      that.setData({
        uploadInfo: true
      })
    }
    // var pages = getCurrentPages().length;
    // console.log("页面路径", pages)
    // if (2 < pages) {
    //   wx.navigateBack({
    //     delta: 2
    //   })
    // }
  },

  //根据下级返回键获取本地图片
  getPic: function(value) {
    const that = this;
    if ("savedFilePath" == value) {
      let savedFilePath = wx.getStorageSync('savedFilePath');
      if (savedFilePath != "") {
        that.setData({
          ['form.faceImgUrl']: savedFilePath,
          ['form.faceImg']: savedFilePath,
        })
      } else {
        that.getPersonInfo()
      }
    }
  },
  onHide() {

  },
  onUnload() {

  },



  /*身份证验证输入是否正确

  *身份证号合法性验证

  *支持15位和18位身份证号

  *支持地址编码、出生日期、校验位验证*/

  getBirthAndSex: function (e) {

    let ts = this;

    let code = e //identity 为你输入的身份证

    console.log("身份证号码------>", code)

    let city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };

    let tip = "";

    let pass = true;

    let reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
    console.log("身份证id");
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


  //报错 
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    })
  },
  camera: function() {
    const that = this;
    let token = wx.getStorageSync('token');
    console.log()
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
              app.globalData.upData = true;
              wx.setStorageSync('imgUrl', data.imgUrl)
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
                // that.setData({
                //   dialog: {
                //     title: '保存成功',
                //     // content: '下次进入应用时，此文件仍可用！',
                //     hidden: false
                //   }
                // })
                // wx.navigateTo({
                //   url: '../changeInfo/changeInfo',
                // })

                that.goto("savedFilePath");
              } else {
                wx.hideLoading();
                if ("未检测到人脸!" == data.msg) {
                  data.msg = "未检测到人脸,请重新上传头像!"
                } else {
                  data.msg = "上传图片体积过大,请上传小于5M体积的头像!"
                }
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
  goto: function (value) {
    let pages = getCurrentPages();
    console.log("第几级", pages);
    if (pages.length > 1) {
      let prePage = pages[pages.length - 1];
      let presPage = pages[pages.length - 2]
      // console.log(prePage);
      // console.log(presPage.route);
      prePage.getPic(value);
      if ("pages/user/user" == presPage.route) {
        presPage.getPic(value);
      } else if ("pages/myself/myself" == presPage.route) {
        presPage.refresh(value);
      }
    }
  },
  togglePosition() {
    this.setData({
      position: this.data.position === 'front' ?
        'back' : 'front'
    })
  },
  //验证函数
  initValidate(idcard, faceImg) {
    let messages = {};
    let rules = {};

    if ("true" == idcard && "true" == faceImg) {
      rules = {
        faceImgUrl: {
          required: true,
        },
        name: {
          required: true,
          nonumber: true,
        },
        idcard: {
          required: true,
          idcard: true
        },
        phone: {
          required: true,
          tel: true
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
        idcard: {
          required: '请输入身份证号码',
          idcard: '请输入18位的有效身份证'
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        }
      }
    } else if ("false" == idcard && "false" == faceImg) {
      rules = {
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
        name: {
          required: true,
          nonumber: true,
        },
        idcard: {
          required: true,
          idcard: true
        },
        phone: {
          required: true,
          tel: true
        }
      }
      messages = {
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        idcard: {
          required: '请输入身份证号码',
          idcard: '请输入18位的有效身份证'
        },
        phone: {
          required: '请输入11位手机号码',
          tel: '请填写正确的手机号'
        }
      }
    } else if ("false" == idcard && "true" == faceImg) {
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
        }
      }
    }



    this.WxValidate = new WxValidate(rules, messages)
  },
  //调用验证函数
  formSubmit: function(e) {
    const that = this;
    let faceImg = '';
    let groupId = "";
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let personGroupId = wx.getStorageSync('personGroupId');
    let sharePersonGroupId = wx.getStorageSync('sharePersonGroupId');
    console.log("sharePersonGroupId", sharePersonGroupId);
    if (sharePersonGroupId || undefined != sharePersonGroupId || "" != sharePersonGroupId) {
      groupId = sharePersonGroupId;
      // app.globalData.examine = true;
      wx.setStorageSync("examine", "0");
    } else {
      groupId = personGroupId
    }
    let imgUrl = wx.getStorageSync('imgUrl');
    if ("" != imgUrl) {
      faceImg = imgUrl;
    }
    if (e.detail.value.faceImgUrl == "../../images/photo.png") {
      e.detail.value.faceImgUrl = "";
      faceImg = "";
    }
    let token = wx.getStorageSync('token');
    let roleName = wx.getStorageSync('roleName');
    wx.showLoading({
      title: '请等待。。。',
    })
    // console.log("requestId", requestId());
    console.log('form发生了submit事件，携带的数据为：', e.detail.value)
    if (faceEnabled && idNoEnabled){
      if ("" != e.detail.value.faceImgUrl && "" != e.detail.value.name) {
        that.getBirthAndSex(e.detail.value.idcard);
        console.log("that.data.isIdcard---->", that.data.isIdcard);
        if (!that.data.isIdcard) {
          wx.hideLoading();
          return false;
        }
      }
    } else if (!faceEnabled && idNoEnabled){
      if ("" != e.detail.value.name) {
        that.getBirthAndSex(e.detail.value.idcard);
        console.log("that.data.isIdcard---->", that.data.isIdcard);
        if (!that.data.isIdcard) {
          wx.hideLoading();
          return false;
        }
      }
    }
    

    const params = e.detail.value;
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      wx.hideLoading();
      const error = this.WxValidate.errorList[0]
      if ("idcard" != error.param) {
        this.showModal(error.msg)
      }
      return false
    } else {
      if (roleName == "admin") {
        personGroupId = ""
      }
      e.detail.value.companyName = app.firm;
      wx.request({
        url: dataUrl,
        method: "POST",
        data: {
          type: "WX_PERSON_REGISTER",
          requestId: requestId(),
          appId: appId,
          timestamp: timeStamp,
          token: token,
          body: { 
            faceImg: imgUrl,
            name: e.detail.value.name,
            idNo:e.detail.value.idcard,
            mobilePhone: e.detail.value.phone,
            companyName: e.detail.value.companyName,
            sex: e.detail.value.radio,
            personGroupId: groupId
            // personGroupId: '0e18b89319f14cef9c21e1e246efee2f'
          }
        },
        success: res => {
          console.log(res);
          wx.hideLoading();
          if ("SUCCESS" == res.data.code && "WX_PERSON_REGISTER" == res.data.type) {
            wx.removeStorageSync('sharePersonGroupId')
            wx.removeStorageSync('shareCompanyName')
            that.setData({
              shareSubmit: true
            })
            wx.showToast({
              title: '成功',
              icon: 'success',
              duration: 2000
            })
            let roleName = wx.getStorageSync('roleName');
            console.log("roleName---->", roleName);
            console.log("relogin---->", res.data.body.relogin)
            wx.removeStorageSync('imgUrl');
            if (res.data.body.relogin) {
              wx.reLaunch({
                url: '../index/index'
              })
            } else {
              if (roleName == "admin") {
                wx.switchTab({
                  url: '../user/user'
                })
              } else {
                wx.reLaunch({
                  url: '../myself/myself'
                })
              }
            }
          } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_REGISTER" == res.data.type) {
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
    }

  }
})