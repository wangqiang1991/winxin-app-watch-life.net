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
import config from '../../utils/config.js'

const app = getApp()
const pageCount = config.getPageCount;

const options = {
    data: {
        shareTitle: config.getWebsiteName+'我的资料',
        pageTitle: config.getWebsiteName + '-我的',
        userInfo: {},             
        userSession:{}
    },

    onLoad: function (option) {
        let self= this;
        self.setData({userInfo: wx.getStorageSync('userInfo'),userSession:wx.getStorageSync('userSession')});
        Auth.checkGetMemberUserInfo(self.data.userSession,API);
    },      
   
    onShow: function () {       
        
    },

    onUnload: function () {
       // this.removeArticleChange();
    },
    onShareAppMessage: function () {
        return {
            title: this.data.shareTitle,
            path: '/pages/myinfo/myinfo',
            //imageUrl: this.data.detail.content_first_image,
        }
    },


}
//-------------------------------------------------
Page(options)

