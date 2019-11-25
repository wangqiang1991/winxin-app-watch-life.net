/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js')
const NC = require('../../utils/notificationcenter.js')

import config from '../../utils/config.js'

const app = getApp()
const pageCount = config.getPageCount;

const options = {
    data: {
        shareTitle: '我的积分',
        pageTitle: config.getWebsiteName + '-我的积分',
        integral:[],
        userInfo:{},
        userSession:{},
        wxLoginInfo:{},
        memberUserInfo:{}, 
        copyright:app.globalData.copyright,
        page:1,
        pageCount:config.getPageCount,
        isLastPage:false 
    },

    onLoad: function (option) {
        let self= this;
         Auth.setUserMemberInfoData(self);
        var data={};
          data.userId=self.data.userSession.userId;
          data.sessionId =self.data.userSession.sessionId;  
          data.page=self.data.page;
          data.per_page= self.data.pageCount; 
          var pageCount =self.data.pageCount;          
          API.myIntegral(data).then(res => {
          if(!res.code)
          {
            if (res.length < pageCount) {

              self.setData({isLastPage:true})
            }
            self.setData({
              integral: self.data.integral.concat(res.map(function (item) {
                                          
                      return item;
                  }))
              })  

          }
          else
          {
            wx.showToast({
              title: res.message,
              mask: false,
              icon: "none",
              duration: 2000
            });
          }

          
        });

           
    },
    onPullDownRefresh: function () { 
    
    },

    onReachBottom: function () {
      let args = {};
      var self=this;
      if (!self.data.isLastPage) {
        args.page = this.data.page + 1;
        args.userId=self.data.userSession.userId;
        args.sessionId =self.data.userSession.sessionId;  
        args.per_page= self.data.pageCount;
        wx.showLoading({
          title: '加载中',
      });
        API.myIntegral(args).then(res => {
          if(!res.code)
          {
            if (res.length < pageCount) {

              self.setData({isLastPage:true})
            }
            self.setData({
              integral: self.data.integral.concat(res.map(function (item) {                                          
                      return item;
                  })),
                  page: args.page 
              })            

          }
          else
          {
            wx.showToast({
              title: res.message,
              mask: false,
              icon: "none",
              duration: 2000
            });
          }

          wx.hideLoading();                    

          
        });
       
     
        
      } else {
        console.log("最后一页了");
  
      }
    }
    
   

}
//-------------------------------------------------
Page(options)

