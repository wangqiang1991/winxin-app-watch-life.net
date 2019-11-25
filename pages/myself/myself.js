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
      shareTitle: config.getWebsiteName + '关于我',
      pageTitle: " ",
      // pageTitle: config.getWebsiteName + '-我的',
      copyright: app.globalData.copyright,
      listStyle: '',
      userInfo: {},
      userSession: {},
      wxLoginInfo: {},
      memberUserInfo: {},
      isLoginPopup: false,
      system: '',
      enterpriseMinapp: '',
      raw_praise_word: '鼓励',
      postMessageId: "",
      scopeSubscribeMessage: '',
      newcontentSubscribeCount: 0
    },

    onLoad: function(option) {
      let self = this;
      wx.getSystemInfo({
        success: function(t) {
          var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
          self.setData({
            system: system
          });

        }
      })
      Auth.setUserMemberInfoData(self);
      Auth.checkLogin(self);
      self.getSettings();
    },
    onShow: function() {
      let self = this;
      Auth.setUserMemberInfoData(self);
      wx.setStorageSync('openLinkCount', 0);

    },
    getSettings: function() {
      var self = this;
      API.getSettings().then(res => {
        var enterpriseMinapp = res.settings.enterpriseMinapp ? res.settings.enterpriseMinapp : "";
        var postMessageId = res.settings.postMessageId ? res.settings.postMessageId : "";
        var raw_praise_word = res.settings.raw_praise_word ? res.settings.raw_praise_word : "";
        this.setData({
          enterpriseMinapp: enterpriseMinapp,
          raw_praise_word: raw_praise_word,
          postMessageId: postMessageId
        });
      })
    },
    onReady: function() {
      var self = this;
      wx.setNavigationBarTitle({
        title: this.data.pageTitle
      });
      Auth.checkSession(app, API, self, 'isLoginNow', util);
    },
    onPullDownRefresh: function() {

      this.setData({
        isPull: true
      });

      if (this.data.userSession.sessionId) {
        Auth.checkGetMemberUserInfo(this.data.userSession, this, API)
      }

    },
    agreeGetUser: function(e) {
      let self = this;
      Auth.checkAgreeGetUser(e, app, self, API, '0');

    },
    redictSetting: function() {
      wx.navigateTo({
        url: '../settings/settings'
      })
    },
    redictPage: function(e) {
      var mytype = e.currentTarget.dataset.mytype;
      if (mytype == "logout") {
        Auth.logout(this);
        wx.reLaunch({
          url: '../myself/myself'
        })
      } else if (mytype == "about") {
        var url = ""; 
          url = '../about/about';
          wx.navigateTo({
            url: url
          })



        } else {
          if (!this.data.userSession.sessionId) {
            this.setData({
              isLoginPopup: true
            });
          } else {
            if (mytype == "myorders") {
              wx.navigateTo({
                url: '../myorder/myorder'
              });
            } else if (mytype == "myposts") {
              wx.navigateTo({
                url: '../author/author?userid=' + this.data.userSession.userId + "&postype=post"
              });

            } else if (mytype == "myMessages") {
              wx.navigateTo({
                url: '../mymessage/mymessage'
              });
            } else if (mytype == "mytopics") {
              wx.navigateTo({
                url: '../author/author?userid=' + this.data.userSession.userId + "&postype=topic"
              });

            } else if (mytype == "myGoods") {
              wx.navigateTo({
                url: '../author/author?userid=' + this.data.userSession.userId + "&postype=product"
              });

            } else if (mytype == "myzanimage") {
              wx.navigateTo({
                url: '../authorcode/authorcode'
              });

            } else if (mytype == "topicspending") {
              wx.navigateTo({
                url: '../postpending/postpending?posttype=topic'
              });

            } else if (mytype == "postspending") {
              wx.navigateTo({
                url: '../postpending/postpending?posttype=post'
              });

            } else if (mytype == "commentspending") {
              wx.navigateTo({
                url: '../commentsPending/commentsPending?posttype=post'
              });

            } else if (mytype == "replyspending") {
              wx.navigateTo({
                url: '../commentsPending/commentsPending?posttype=topic'
              });

            } else if (mytype == "myIntegral") {
              wx.navigateTo({
                url: '../myIntegral/myIntegral'
              });

            } else if (mytype == 'followmeAuthor') {
              wx.navigateTo({
                url: '../userlist/userlist?authorType=followme'
              });
            } else if (mytype == 'myFollowAuthor') {
              wx.navigateTo({
                url: '../userlist/userlist?authorType=myFollow'
              });
            } else if (mytype == "mysignin") {
              wx.navigateTo({
                url: '../earnIntegral/earnIntegral'
              });
            } else {
              wx.navigateTo({
                url: '../readlog/readlog?mytype=' + mytype
              });
            }

          }
        }
      },
      closeLoginPopup() {
          this.setData({
            isLoginPopup: false
          });
        },
        openLoginPopup() {
          this.setData({
            isLoginPopup: true
          });
        },

        onShareAppMessage: function() {
          return {
            title: this.data.shareTitle,
            path: '/pages/myself/myself',
            //imageUrl: this.data.detail.content_first_image,
          }
        },

        openSettting: function() {
          var self = this;
          wx.openSetting({
            success(res) {}
          })
        },
        subscribeMessage: function(e) {
          var self = this;
          var subscribetype = e.currentTarget.dataset.subscribetype;
          var subscribemessagesid = e.currentTarget.dataset.subscribemessagesid;
          Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid);
        }
    }
    //-------------------------------------------------
    Page(options)