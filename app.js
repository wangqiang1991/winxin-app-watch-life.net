/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */
import config from 'utils/config.js';



App({
    
    onLaunch: function (options) {
 

    //调用API从本地缓存中获取数据
    var that = this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs); 
    var copyright='©  ' + config.getWebsiteName + ' ' + config.getDomain;
    that.globalData.copyright= copyright;
    var listStyle =wx.getStorageSync('listStyle');
    if(!listStyle)
    {
      listStyle=config.getListStyle;      
    }
    wx.setStorageSync('listStyle', listStyle); 

  },
  onShow:function()
  {
    
    

  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:{},   
    copyright: '',
    userSession:{},
    memberUserInfo:{},
    wxLoginInfo:{},
    listStyle:'',
    appSetting:{}
  }
})