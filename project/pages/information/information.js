import WxValidate from '../../utils/WxValidate.js'
const localImgUrl = "../../images/photo.png"
const util = require('../../utils/util.js')
const adminUpdataUrl = util.adminUpdataUrl
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
Page({

  data: {
    personInfo: false,
    camera: true,
    faceLabel:"",
    faceEnabled:true,
    idNoLabel:"",
    idNoEnabled:true,
    position: 'back',
    uploadInfo: true,
    isIdcard:false,
    form: {
      faceImgUrl: "",
      faceImg: localImgUrl,
      name: '',
      idNo: '',
      idcard:'',
      phone: '',
      email: '',
      gender: [
        { value: '1', name: '男', checked: 'true'},
        { value: '2', name: '女' },
      ],
    }
  },
  onLoad() {
    //this.getuser()
    const that = this;
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let faceLabel = wx.getStorageSync('faceLabel');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let idNoLabel = wx.getStorageSync('idNoLabel');
    that.setData({
      faceLabel: faceLabel,
      idNoLabel: idNoLabel,
    })
    if (idNoEnabled && faceEnabled){
       that.setData({
         idNoEnabled:false,
         faceEnabled: false
       })
      that.initValidate("true","true") //验证规则函数
    } else if (idNoEnabled && !faceEnabled){
      that.setData({
        idNoEnabled: false,
        faceEnabled:true
      })
      that.initValidate("true","false") //验证规则函数
    } else if (!idNoEnabled && faceEnabled){
      that.setData({
        idNoEnabled: true,
        faceEnabled: false
      })
      that.initValidate("false", "true") //验证规则函数
    } else if (!idNoEnabled && !faceEnabled){
      that.setData({
        idNoEnabled: true,
        faceEnabled: true
      })
      that.initValidate("false", "false") //验证规则函数
    }
    this.setData({
      ['form.faceImgUrl']: "../../images/photo.png",
      ['form.faceImg']: "../../images/photo.png",
    })
    
  },
  showInFo: function () {
    let that = this;
    that.setData({
      uploadInfo: true
    })
  },
  onShow() {
    let that = this;
    // let updataUrl = wx.getStorageSync('updataUrl');
    let registerImg = wx.getStorageSync('registerImg');
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    let idNoLabel = wx.getStorageSync('idNoLabel');
    if(idNoEnabled){
      that.setData({
        idNoEnabled: false
      })
    }
    if(idNoLabel){
      that.setData({
        idNoLabel: idNoLabel
      })
    }else{
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
    if( 2 < pages){
      wx.navigateBack({
        delta: 2
      })
    }
  },
  getPic: function(value) {
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

  getBirthAndSex:function (e) {
   
    let ts = this;

    let code = e //identity 为你输入的身份证


    let city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };

    let tip = "";

    let pass = true;

    let reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
    console.log("身份证id");
    if (!code || !code.match(reg)) {

      tip = "身份证号格式错误";
      if("" == e){
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
    if(!pass){
      ts.setData({
        isIdcard:false
      })
    }else{
      ts.setData({
        isIdcard: true
      })
    }

  },
  
  camera: function() {
    // wx.navigateTo({
    //   url: '../camera/camera'
    // })
    const that = this;
    let token = wx.getStorageSync('token');
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success(res) {
        var photoType = res.tempFilePaths[0].substring(res.tempFilePaths[0].length - 3);
        if ("jpg" == photoType){
          that.setData({
            ['form.faceImgUrl']: res.tempFilePaths[0],
            ['form.faceImg']: res.tempFilePaths[0],
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
  trimPhone:function(e){
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
  initValidate(idcard,faceImg) {
    let messages = {};
    let rules = {};

    if ("true" == idcard && "true" == faceImg){
      rules = {
        faceImgUrl: {
          required: true,
        },
        name: {
          required: true,
          nonumber: true,
        },
        // idcard:{
        //   required: true,
        //   idcard: true
        // },
        // phone: {
        //   required: true,
        //   tel: true
        // }
      }
      messages = {
        faceImgUrl: {
          required: '请上传人脸头像',
        },
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        // idcard:{
        //   required: '请输入身份证号码',
        //   idcard:'请输入18位的有效身份证'
        // },
        // phone: {
        //   required: '请输入11位手机号码',
        //   tel: '请填写正确的手机号'
        // }
      }
    } else if ("false" == idcard && "false" == faceImg){
      rules = {
        name: {
          required: true,
          nonumber: true,
        },
        // phone: {
        //   required: true,
        //   tel: true
        // }
      }
      messages = {
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        // phone: {
        //   required: '请输入11位手机号码',
        //   tel: '请填写正确的手机号'
        // }
      }
    } else if ("true" == idcard && "false" == faceImg){
      rules = {
        name: {
          required: true,
          nonumber: true,
        },
        // idcard: {
        //   required: true,
        //   idcard: true
        // },
        // phone: {
        //   required: true,
        //   tel: true
        // }
      }
      messages = {
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        // idcard: {
        //   required: '请输入身份证号码',
        //   idcard: '请输入18位的有效身份证'
        // },
        // phone: {
        //   required: '请输入11位手机号码',
        //   tel: '请填写正确的手机号'
        // }
      }
    } else if ("false" == idcard && "true" == faceImg){
      rules = {
        faceImgUrl: {
          required: true,
        },
        name: {
          required: true,
          nonumber: true,
        },
        // phone: {
        //   required: true,
        //   tel: true
        // }
      }
      messages = {
        faceImgUrl: {
          required: '请上传人脸头像',
        },
        name: {
          required: '请填写姓名',
          nonumber: '请输入非数字或特殊字符开头的姓名',
        },
        // phone: {
        //   required: '请输入11位手机号码',
        //   tel: '请填写正确的手机号'
        // }
      }
    }
    
    
    
    this.WxValidate = new WxValidate(rules, messages)
  },
  //调用验证函数
  formSubmit: function(e) {
    const that = this;
    let personGroupId = wx.getStorageSync('personGroupId');
    let token = wx.getStorageSync('token');
    let faceEnabled = wx.getStorageSync('faceEnabled');
    let idNoEnabled = wx.getStorageSync('idNoEnabled');
    if ("../../images/photo.png" == e.detail.value.faceImgUrl) {
      e.detail.value.faceImgUrl = "";
    }
    let facePath = e.detail.value.faceImgUrl;
    if (faceEnabled && idNoEnabled){
      if ("" != facePath && "" != e.detail.value.name && "" != e.detail.value.idcard) {
        that.getBirthAndSex(e.detail.value.idcard);
        if (!that.data.isIdcard) {
          return false;
        }
      }
    } else if (!faceEnabled && idNoEnabled){
      if ("" != e.detail.value.name && "" != e.detail.value.idcard) {
        that.getBirthAndSex(e.detail.value.idcard);
        if (!that.data.isIdcard) {
          return false;
        }
      }
    }

    if ("" != e.detail.value.phone){
      if (!(/^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/.test(e.detail.value.phone))) {
        this.showModal("请输入正确的手机号")
        return false;
      } 
    }
    
    
   let params = e.detail.value;
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0];
      if( "idcard" != error.param){
        this.showModal(error.msg)
      }
      return false
    } else {
      //员工登记信息提交
      wx.showLoading({
        title: '请等待。。。',
      })
      if (facePath != ""){
        wx.uploadFile({
          url: adminUpdataUrl,
          filePath: facePath ,
          name: 'file',
          formData: {
            'name': e.detail.value.name,
            'idcade':e.detail.value.idcade,
            "phone": e.detail.value.phone,
            "personGroupId": personGroupId,
            "idNo": e.detail.value.idcard
          },
          success(respon) {
            wx.hideLoading();
            const data = JSON.parse(respon.data)
            console.log("返回图片", data);
            if (data.code == "SUCCESS") {
              that.setData({
                tempFilePath: data.faceUrl
              })
              that.setData({
                dialog: {
                  title: '保存成功',
                  content: '下次进入应用时，此文件仍可用！',
                  hidden: false
                }
              })
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
                    faceImg: data.faceUrl,
                    name: e.detail.value.name,
                    mobilePhone: e.detail.value.phone,
                    idNo:e.detail.value.idcard,
                    sex: e.detail.value.radio,
                    personGroupId: personGroupId
                    
                  }
                },
                success: res => {
                  console.log(res);
                  wx.hideLoading();
                  if ("SUCCESS" == res.data.code  && "WX_PERSON_EMPLOYEE_REGISTER" == res.data.type ) {
                    wx.showToast({
                      title: '成功',
                      icon: 'success',
                      duration: 2000
                    })
                    that.setData({
                      ['form.faceImgUrl']: "../../images/photo.png",
                      ['form.faceImg']: "../../images/photo.png",
                      ['form.name']: "",
                      ['form.idcard']: "",
                      ['form.phone']: "",
                      ['form.sex']: "",
                      sex: [{
                        value: '1',
                        name: '男',
                        checked: 'true'
                      },
                      {
                        value: '2',
                        name: '女'
                      },
                      ],
                    })
                  } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEE_REGISTER" == res.data.type){
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
                    that.setData({
                      ['form.phone']: "",
                    })
                  }
                }
              })
            } else {
              that.setData({
                ['form.faceImgUrl']: "../../images/photo.png",
                ['form.faceImg']: "../../images/photo.png",
                // ['form.name']: "",
                // ['form.idcard']: "",
                // ['form.phone']: "",
                // ['form.sex']: "",
                // sex: [{
                //   value: '1',
                //   name: '男',
                //   checked: 'true'
                // },
                // {
                //   value: '2',
                //   name: '女'
                // },
                // ],
              })
              if ("未检测到人脸!" == data.msg){
                data.msg = "未检测到人脸,请重新上传头像!";
              }else{
                data.msg = "上传图片体积过大,请上传小于5M体积的头像!";
              }
              wx.showToast({
                title: data.msg,
                icon: 'none',
                duration: 2000
              })
            }
            //do something

          }
        })
      }else{
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
              faceImg: e.detail.value.faceImg,
              name: e.detail.value.name,
              idNo:e.detail.value.idcard,
              mobilePhone: e.detail.value.phone,
              sex: e.detail.value.radio,
              personGroupId: personGroupId,

            }
          },
          success: res => {
            wx.hideLoading();
            if ("SUCCESS"== res.data.code && "WX_PERSON_EMPLOYEE_REGISTER" == res.data.type ) {
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000
              })
              that.setData({
                ['form.faceImgUrl']: "../../images/photo.png",
                ['form.faceImg']: "../../images/photo.png",
                ['form.name']: "",
                ['form.idcard']: "",
                ['form.phone']: "",
                ['form.sex']: "",
                sex: [{
                  value: '1',
                  name: '男',
                  checked: 'true'
                },
                {
                  value: '2',
                  name: '女'
                },
                ],
              })
            } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_EMPLOYEE_REGISTER" == res.data.type){
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
              that.setData({
                ['form.phone']: "",
              })
            }
          }
        })
      }
      

    }

  }
})