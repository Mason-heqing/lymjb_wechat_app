// pages/invitation/invitation.js
import WxValidate from '../../utils/WxValidate.js'
const util = require('../../utils/util.js')
const dataUrl = util.dataUrl
const invalidToken = util.invalidToken
const requestId = util.requestId
const appId = util.appId
const timeStamp = Date.parse(new Date());
const formatTime = util.formatTime;
const currentPage = 0;
const pageSize = 20;
const timeCurrent = util.formatTime
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
let currentYear = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(0,4);

//获取年
for (let i = currentYear; i <= date.getFullYear() + 5; i++) {
  years.push("" + i);
}
//获取月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
//获取分钟
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    select: false,
    time: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0, 9, 16, 10, 17],
    choose_year: '',
    date: "",
    rangeStart:"",
    selectList: [],
    companyArray: [],
    invitationId:"",
    firmList: [],
    subInfo:{},
    sendJson:{},
    realTime:"",
    causeAeeay: ["面试", "商务", "快递", "外卖","送水","送货","装修","其他"],
    form: {
      tihuoWay: "",
      officeAddress: "",
      id:"",//公司id
      asterask: "面试",
      date: ""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this;
    let datetimes = timeCurrent(timeStamp, "Y/M/D hh:mm");
    let timeStr = (datetimes.slice(0, 16)).replace(/\//g, "-");
    let invitationType = wx.getStorageSync('invitationType');
    if (invitationType || undefined != invitationType){
      if ( "0" == invitationType){
         that.setData({
           causeAeeay: ["其他","面试", "商务", "快递", "外卖","送水","送货","装修"],
         })
      } else if ("1" == invitationType){
        that.setData({
          causeAeeay: ["面试", "商务", "快递", "外卖", "送水", "送货", "装修","其他"],
        })
      } else if ("2" == invitationType){
        that.setData({
          causeAeeay: ["商务", "面试", "快递", "外卖",  "送水", "送货", "装修", "其他"],
        })
      } else if ("3" == invitationType){
        that.setData({
          causeAeeay: ["快递", "面试", "商务", "外卖", "送水", "送货", "装修", "其他"],
        })
      } else if ("4" == invitationType) {
        that.setData({
          causeAeeay: ["外卖", "面试", "商务", "快递", "送水", "送货", "装修", "其他"],
        })
      } else if ("5" == invitationType) {
        that.setData({
          causeAeeay: ["送水", "面试", "商务", "快递", "外卖", "送货", "装修", "其他"],
        })
      } else if ("6" == invitationType) {
        that.setData({
          causeAeeay: ["送货", "面试", "商务","快递", "外卖","送水", "装修", "其他"],
        })
      } else if ("7" == invitationType) {
        that.setData({
          causeAeeay: ["装修", "面试", "商务", "外卖","快递", "送水", "送货", "其他"],
        })
      }
    }
    that.setData({
      ["form.tihuoWay"]: options.firm,
      ["form.date"]: timeStr,
      rangeStart: timeStr,
      choose_year: this.data.multiArray[0][0],
    });
    that.currentTime();
    that.initValidate();
    that.getFirmList();
  },
  
  currentTime:function(){
    const that = this;
    let currentMonth = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(5, 7);
    let currentDays = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(8, 10);
    let currentHours = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(11, 13);
    let currentMinutes = timeCurrent(timeStamp, "Y/M/D hh:mm").slice(14, 16);
    const dateIndex = ((arr, item) => {
      for (let i in arr) {
        if (arr[i] == item) {
          return i;
        }
      }
    })
    let monthIndex = dateIndex(months, currentMonth);
    let daysIndex = dateIndex(days, currentDays);
    let hoursIndex = dateIndex(hours, currentHours);
    let minutesIndex = dateIndex(minutes, currentMinutes);
    that.setData({
      multiIndex: [0, monthIndex, daysIndex, hoursIndex, minutesIndex],
    })
  },
  //获取时间日期
  bindMultiPickerChange: function (e) {
    const that = this;
    that.setData({
      multiIndex: e.detail.value
    })
    const index = that.data.multiIndex;
    const year = that.data.multiArray[0][index[0]];
    const month = that.data.multiArray[1][index[1]];
    const day = that.data.multiArray[2][index[2]];
    const hour = that.data.multiArray[3][index[3]];
    const minute = that.data.multiArray[4][index[4]];
    let dateSelect = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    if (new Date(dateSelect).getTime() + 60000 < new Date().getTime()){
      that.currentTime();
      that.showModal("访问日期不能选择小于当前日期");
    }else{
      that.setData({
        time: dateSelect,
        ["form.date"]: year + '-' + month + '-' + day + ' ' + hour + ':' + minute,
      })
    }
  },
  //监听picker的滚动事件
  bindMultiPickerColumnChange: function (e) {
    const that = this;
    clearInterval(that.data.realTime);
    //获取年份
    if (e.detail.column == 0) {
      let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
      this.setData({
        choose_year
      })
    }
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choose_year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        }
      }
    }
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },

  //请求获取公司列表
  getFirmList: function() {
    const that = this;
    let token = wx.getStorageSync('token');
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_PERSON_MY_COMPANY_BIND",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          currentPage: currentPage,
          pageSize: pageSize,
        }
      },
      method: 'POST',
      success: function(res) {
        if ("SUCCESS" == res.data.code && "WX_PERSON_MY_COMPANY_BIND" == res.data.type) {
          if (res.data.body.employees.length > 0) {
            let arrayList = [];
            let firmInfo = [];
            res.data.body.employees.forEach((item, index) => {
              let infoJson = {};
              if (!item.companyName) {
                item.companyName = "";
              }
              if (!item.address) {
                item.address = "";
              }
              if( 1 == item.defBind){
                that.setData({
                  ["form.tihuoWay"]: item.companyName,
                  ["form.officeAddress"]: item.address,
                  ["form.id"]: item.id,
                })
              }
              infoJson.name = item.companyName;
              infoJson.address = item.address;
              infoJson.id = item.id;
              arrayList.push(item.companyName);
              firmInfo.push(infoJson);
            })
            that.setData({
              companyArray: arrayList,
              firmList: firmInfo
            })
          }
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_PERSON_MY_COMPANY_BIND" == res.data.type) {
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
  
  //发送数据
  sumbInvitation: function (value) {
    const that = this;
    let token = wx.getStorageSync('token');
    let visitorType = "";
    if ("面试" == value.asterask){
       visitorType = "1"
    } else if ("商务" == value.asterask){
      visitorType = "2"
    } else if ("快递" == value.asterask){
      visitorType = "3"
    } else if ("外卖" == value.asterask){
      visitorType = "4"
    } else if ("其他" == value.asterask){
      visitorType = "0"
    } else if ("送水" == value.asterask) {
      visitorType = "5"
    } else if ("送货" == value.asterask) {
      visitorType = "6"
    } else if ("装修" == value.asterask) {
      visitorType = "7"
    }
    wx.request({
      url: dataUrl,
      data: {
        type: "WX_INVITE_VISIT_IFNO",
        requestId: requestId(),
        appId: appId,
        timestamp: timeStamp,
        token: token,
        body: {
          conmpayName: value.tihuoWay,
          officeAddress: value.officeAddress,
          id:value.id,
          visitorType: visitorType,
          visitStartTime:value.date,
        }
      },
      method: 'POST',
      success: function (res) {
        if ("SUCCESS" == res.data.code && "WX_INVITE_VISIT_IFNO" == res.data.type) {
          let visitor ={};
          res.data.body.visitStartTime = formatTime(res.data.body.visitStartTime).slice(0,10);
          visitor.companyId = res.data.body.companyId;
          visitor.conmpayName = res.data.body.conmpayName;
          visitor.id = res.data.body.id;
          visitor.officeAddress = res.data.body.officeAddress;
          visitor.visitorType = res.data.body.visitorType;
          visitor.wxUserId = res.data.body.wxUserId;
          visitor.visitStartTime = value.date;
          that.setData({
            invitationId:res.data.body.id,
            sendJson: visitor
            // isDidable:false,
          })
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          wx.navigateTo({
            url: '../invitationDetail/invitationDetail?companyId=' + res.data.body.companyId + "&conmpayName=" + res.data.body.conmpayName + "&id=" + res.data.body.id + "&officeAddress=" + res.data.body.officeAddress + "&visitorType=" + res.data.body.visitorType + "&wxUserId=" + res.data.body.wxUserId + "&visitStartTime=" + visitor.visitStartTime,
          })
        } else if ("TOKEN_EXPIRED" == res.data.code && "WX_INVITE_VISIT_IFNO" == res.data.type) {
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
  realTime:function(){
     const that = this;
     that.setData({
       realTime: setInterval(function () {
         let datetimes = timeCurrent(timeStamp, "Y/M/D hh:mm");
         let timeStr = (datetimes.slice(0, 16)).replace(/\//g, "-");
         that.setData({
           ["form.date"]: timeStr,
           rangeStart: timeStr,
         })

       }, 1000)
     })
  },
  //验证表单
  initValidate() {
    let messages = {};
    let rules = {};
    rules = {
      asterask: {
        required: true,
      }
    }
    messages = {
      asterask: {
        required: '请输入访客事由',
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  //选择绑定公司
  companySelect: function(e) {
    const that = this;
    that.setData({
      ["form.tihuoWay"]: that.data.firmList[e.detail.value].name,
      ["form.officeAddress"]: that.data.firmList[e.detail.value].address,
      ["form.id"]: that.data.firmList[e.detail.value].id,
    })
  },

  //选择访问事由
  causeSelect: function(e) {
    const that = this;
    that.setData({
      ["form.asterask"]: that.data.causeAeeay[e.detail.value],
    })
  },

  //时间选择器
  dateSelect: function(e) {
    const that = this;
    that.setData({
      ["form.date"]: e.detail.value,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const that = this;
    // that.getFirmList();
    that.realTime();
   
  },

  //报错 
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    })
  },

  //发送邀请数据
  formSubmit: function(e) {
    const that =this;
    let params = e.detail.value;
    that.setData({
      subInfo: e.detail.value,
    })
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0];
      if ("idcard" != error.param) {
        this.showModal(error.msg)
      }
      return false
    }else{
      //发送邀请数据
      that.sumbInvitation(params);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    const that = this;
    clearInterval(that.data.realTime);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    const that = this;
    clearInterval(that.data.realTime);
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
  
  onShareAppMessage: function () {
       
  },
})