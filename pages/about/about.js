/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require('../../utils/api.js')
var util = require('../../utils/util.js');
var WxParse = require('../../vendor/wxParse/wxParse.js');
const Adapter = require('../../utils/adapter.js')


var auth = require('../../utils/auth.js');
import config from '../../utils/config.js'
var app = getApp();

Page({
  data: {
    title: '关于',
    pageData: {},
    pagesList: {},
    display: 'none',
    wxParseData: [],
    praiseList: [],
    dialog: {
      title: '',
      content: '',
      hidden: true
    },


  },
  onLoad: function(options) {
    var args = {};
    var self = this;
    args.postType = 'about';
    Adapter.loadPagesDetail(args, self, API, WxParse);
  },

  onPullDownRefresh: function() {
    var self = this;
    self.setData({
      display: 'none',
      pageData: {},
      wxParseData: {},

    });
    //消除下刷新出现空白矩形的问题。
    args = {};
    args.postType = 'about';
    args.pageCount = pageCount;
    Adapter.loadPagesDetail(args, self, API);
    wx.stopPullDownRefresh()

  },
  onShareAppMessage: function() {
    return {
      title: '关于“' + config.getWebsiteName + '”官方小程序',
      path: 'pages/about/about',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
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
  //给a标签添加跳转和复制链接事件
  wxParseTagATap: function(e) {
    var self = this;
    var href = e.currentTarget.dataset.src;
    console.log(href);
    var domain = config.getDomain;
    //我们可以在这里进行一些路由处理
    if (href.indexOf(domain) == -1) {
      wx.setClipboardData({
        data: href,
        success: function(res) {
          wx.getClipboardData({
            success: function(res) {
              wx.showToast({
                title: '链接已复制',
                //icon: 'success',
                image: '../../images/link.png',
                duration: 2000
              })
            }
          })
        }
      })
    } else {

      var slug = util.GetUrlFileName(href, domain);
      if (slug == 'index') {
        wx.switchTab({
          url: '../index/index'
        })
      } else {
        var getPostSlugRequest = wxRequest.getRequest(Api.getPostBySlug(slug));
        getPostSlugRequest
          .then(res => {
            var postID = res.data[0].id;
            var openLinkCount = wx.getStorageSync('openLinkCount') || 0;
            if (openLinkCount > 4) {
              wx.redirectTo({
                url: '../detail/detail?id=' + postID
              })
            } else {
              wx.navigateTo({
                url: '../detail/detail?id=' + postID
              })
              openLinkCount++;
              wx.setStorageSync('openLinkCount', openLinkCount);
            }

          })

      }

    }

  }
})