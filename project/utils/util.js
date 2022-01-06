//时间转化器
const formatTime = date => {
  var date = new Date();
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//时间转化器
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//随机值
const requestId =  function requestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);

  });
}
//token失效后重新登录
const invalidToken = () =>{
  wx.reLaunch({
    url: '../index/index'
  })
}
//获取当前时间
const data = Date.parse(new Date());



const version = '2'



//预发布
// const dataUrl = "http://pre.qy-rgs.com:9011/wx/api/";
// const updataUrl = "http://pre.qy-rgs.com:9011/wx/picture/upload/user/face"
// const adminUpdataUrl = "http://pre.qy-rgs.com:9011/wx/picture/upload/user/phoneFace"
// const qrcodeUrl = "http://pre.qy-rgs.com:9011/wx/building/qrcode/generate"



//线上环境测试
// const dataUrl = "https://web.qy-rgs.com/wx/api/";
// const updataUrl = "https://web.qy-rgs.com/wx/picture/upload/user/face"
// const adminUpdataUrl = "https://web.qy-rgs.com/wx/picture/upload/user/phoneFace"
// const qrcodeUrl = "https://web.qy-rgs.com/wx/building/qrcode/generate"

//正式环境
 const dataUrl = "https://building.qy-rgs.com/wx/api/";
const updataUrl = "https://building.qy-rgs.com/wx/picture/upload/user/face"
const adminUpdataUrl = "https://building.qy-rgs.com/wx/picture/upload/user/phoneFace"
const qrcodeUrl = "https://building.qy-rgs.com/wx/building/qrcode/generate"



// const qrcodeUrl = "http://192.168.1.41:8082/test"

// const dataUrl = "https://building.zb.com/wx/api/";
// const updataUrl = "https://building.zb.com/wx/picture/upload/user/face"
// const adminUpdataUrl = "https://building.zb.com/wx/picture/upload/user/phoneFace"
// const qrcodeUrl = "https://building.zb.com/wx/building/qrcode/generate"


//本地环境测试
// const dataUrl = "http://192.168.1.41:9011/wx/api/"
// const updataUrl = "http://192.168.1.41:9011/wx/picture/upload/user/face"
// const adminUpdataUrl = "http://192.168.1.41:9011/wx/picture/upload/user/phoneFace"
// const qrcodeUrl = "http://192.168.1.41:9011/wx/building/qrcode/generate"


// const appId = "6bbfec76d81e4a8d8c2b4291dcf31e8a"
const appId = wx.getAccountInfoSync().miniProgram.appId;
// const appId = "7b67f7057a884f6fa4f5dd85b19e0b28"
module.exports = {
  formatTime: formatTime,
  requestId: requestId,
  data:data,
  dataUrl: dataUrl,
  appId:appId,
  updataUrl: updataUrl,
  adminUpdataUrl: adminUpdataUrl,
  invalidToken: invalidToken,
  qrcodeUrl: qrcodeUrl,
  version:version
}
