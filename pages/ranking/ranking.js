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
    shareTitle: '排行',
    pageTitle: '排行',
    ranking: [],
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    copyright: app.globalData.copyright,
    page: 1,
    pageCount: config.getPageCount,
    isLastPage: false,
    rankingType: ''
  },

  onLoad: function(option) {
    let self = this;
    var rankingType = option.rankingType ? option.rankingType : "integral";
    self.setData({
      rankingType: rankingType
    })
    Auth.setUserMemberInfoData(self);
    if (rankingType == 'integral') {
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: '积分排行'
      })
      API.integralRanking().then(res => {
        self.setData({
          ranking: self.data.ranking.concat(res.map(function(item) {
            return item;
          }))
        })
      });

    }

    if (rankingType == 'follow') {
      wx.setNavigationBarTitle({
        title: '粉丝排行'
      })
      API.followRanking().then(res => {
        self.setData({
          ranking: self.data.ranking.concat(res.map(function(item) {
            return item;
          }))
        })
      });

    }



  },
  onPullDownRefresh: function() {

  },




}
//-------------------------------------------------
Page(options)