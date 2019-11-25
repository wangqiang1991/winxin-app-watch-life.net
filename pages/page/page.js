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
var WxParse = require('../../vendor/wxParse/wxParse.js');

var app = getApp();
Page({
  data: {
    title: '页面内容',
    pageData: {},
    pagesList: {},
    hidden: false,
    wxParseData: [],
    detail: {},
    display: false
  },
  onLoad: function(options) {
    this.fetchData(options.id);
   
  },
  fetchData: function(id) {
    let args = {};
    let self = this;
    args.id = id;
    args.postType = "page";
    Adapter.loadArticleDetail(args, self, WxParse, API, util);

  },

  onShareAppMessage: function() {
    return {
      title: this.data.detail.title.rendered + ' 的个人主页',
      path: `/pages/page/page?id= ${this.data.detail.id}`,
      //imageUrl: this.data.detail.content_first_image,
    }
  },
  phoneCall: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.pageDetail.raw_tel
    })
  },
  openMap: function() {
    var self = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        const latitude = parseFloat(self.data.pageDetail.raw_latitude);
        const longitude = parseFloat(self.data.pageDetail.raw_longitude);
        wx.openLocation({
          latitude,
          longitude,
          scale: 28
        })
      }
    })

  },
})