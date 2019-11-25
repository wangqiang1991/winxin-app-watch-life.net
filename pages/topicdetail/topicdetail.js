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
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')
const WxParse = require('../../vendor/wxParse/wxParse.js');
import config from '../../utils/config.js'

var app = getApp();


Page({
    data: {
        title: '话题内容',
        content: '',
        placeholder:'说点什么...',               
        display: 'none',
        page: 1,
        isLastPage: false,       
        link: '',        
        dialog: {
            title: '',
            content: '',
            hidden: true
        },
        detail:{},
        repliesList: [], 
        copyright:app.globalData.copyright,
        userSession:{},     
        wxLoginInfo:{},
        memberUserInfo:{},
        userInfo:{},    
    },

    onLoad: function (e) {
        var self=this; 
        Auth.setUserMemberInfoData(self);       
        var data={};
        data.forumId = e.id;
        Adapter.loadBBTopic(data,self,WxParse,API);        
        Auth.checkLogin(self); 

    },

    onShareAppMessage: function () {
        return {
            title: this.data.detail.title,
            imageUrl: this.data.detail.firstimg,
            path: 'pages/topicdetail/topicdetail?id=' + this.data.detail.id,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },

    //回复这个话题
    replySubmit: function (e) {        
        var self = this;
        if (!self.data.userSession.sessionId) {

            self.setData({ isLoginPopup: true });
            
        }
        else
        {
            var name = self.data.userInfo.nickName;
            var sessionId =self.data.userSession.sessionId;
            var userId=self.data.userSession.userId;            
            var replycontent = e.detail.value.inputComment;
            var topicID = e.detail.value.inputTopicID;
                if (replycontent.length === 0) {
                    self.setData({
                        'dialog.hidden': false,
                        'dialog.title': '提示',
                        'dialog.content': '回复内容为空'
                    });

                    return;
                } 

             var data= {
                sessionid:sessionId,
                userid:userId,
                content: replycontent,
                name:name
            };
            Adapter.replyBBTopic(topicID,data,self,WxParse,API);

        }
    },

    confirm: function () {
        this.setData({
            'dialog.hidden': true,
            'dialog.title': '',
            'dialog.content': ''
        })
    },

    goHome: function () {
        wx.switchTab({
            url: '../social/social'
        })
    },

    agreeGetUser:function(e)
    {
        let self= this;
        Auth.checkAgreeGetUser(e,app,self,API,'0');        
        
    },

    



})
