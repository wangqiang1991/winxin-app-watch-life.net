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
        shareTitle: '我的留言',
        firstLoad:false,
        pageTitle: config.getWebsiteName + '-我的留言',
        messages:[],
        userInfo:{},
        userSession:{},
        wxLoginInfo:{},
        memberUserInfo:{}, 
        copyright:app.globalData.copyright, 
    },
    gotoUrl:function () {
      wx.navigateTo({
        url: '../appointment/appointment',
      })
    },
    onLoad: function (option) {
        let self= this;
         Auth.setUserMemberInfoData(self);
        var data={};
          data.userId=self.data.userSession.userId;
          data.sessionId =self.data.userSession.sessionId;              
          API.getMymesage(data).then(res => {
          self.setData({
            firstLoad:true
          })
          self.setData({
              messages:res
              // messages: self.data.messages.concat(res.map(function (item) {
              //         if(item.ordertype=='postpraise')
              //         {
              //           item.extname="鼓励文章:"+item.extname;
              //         }

                      
              //         return item;
              //     }))
              })
          
            });
        

           
    },
    onPullDownRefresh: function () { 
    
    }
    
   

}
//-------------------------------------------------
Page(options)

