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
 
    orders: [],
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    copyright: app.globalData.copyright,
    zanImageUrl: '',
    tempZanImageSrc: '',
    zanImage:'',
  },

  onLoad: function (option) {
    let self = this;
    Auth.setUserMemberInfoData(self);
    var data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    var raw_praise_word="鼓励";
    API.getMyzanImage(data).then(res => {
      if (res.code) {
        raw_praise_word=res.data.raw_praise_word;
        self.setData({raw_praise_word:res.data.raw_praise_word})
        //Adapter.toast(res.message, 3000);
      }
      else {
        raw_praise_word=res.raw_praise_word ;
        self.setData({ zanImageUrl: res.zanImageUrl,zanImage:res.zanImageUrl,raw_praise_word:res.raw_praise_word });
      }

      wx.setNavigationBarTitle({
        title: '我的'+raw_praise_word +'二维码'
      })
    })
    
  },
  onPullDownRefresh: function () {

  },
  selectImage: function () {
    let self = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', , 'camera'],
      success: (res) => {
        var tempFiles = res.tempFiles;
        var tempFileSize = Math.ceil((tempFiles[0].size) / 1024);
        var tempFilePath = tempFiles[0].path;
        if (tempFileSize > 2048) {
          Adapter.toast('图片大于2M', 3000);

        }
        else {
          self.setData({ tempZanImageSrc: tempFilePath, zanImageUrl: '',zanImage:tempFilePath })

        }
      },
      fail(err) {
        console.log(err)

      }
    })

  },
  upLoadZanIamge: function () {
    var self = this
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var tempZanImageSrc = self.data.tempZanImageSrc;

    var data = {};
    var formData = {
      'sessionid': sessionId,
      'userid': userId,
      'fileName': "",
      "imagestype": "zanimage"
    };

    data.imgfile = tempZanImageSrc;
    data.formData = formData;
    wx.showLoading({
      title: "正在上传图片...",
      mask: true
    });
    API.uploadFile(data).then(res => {
      var res = JSON.parse(res.trim());
      console.log(res);
      if (res.code == 'error') {
        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 3000
        });
      }
      else {
        self.setData({
          tempZanImageSrc: '',
          zanImageUrl: res.imageurl,
          zanImage:res.imageurl
        })

      }
      wx.hideLoading();

    }).catch(err => {
      wx.showToast({ icon: 'none', title: err.errMsg || '上传失败...' });
      wx.hideLoading();
      console.log(err)
    })

  }

}
//-------------------------------------------------
Page(options)

