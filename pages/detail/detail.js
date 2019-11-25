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
import { ModalView } from '../../templates/modal-view/modal-view.js';

import Poster from '../../templates/components/wxa-plugin-canvas-poster/poster/poster';

const app = getApp();
const innerAudioContext = wx.createInnerAudioContext();
let ctx = wx.createCanvasContext('mycanvas');  
const pageCount = config.getPageCount;
let isFocusing = false;
let rewardedVideoAd = null

const options = {
  data: {
    isPhoneNumber:true,
    isGoods:null,
    parentId: "0",
    shareTitle: "",
    pageTitle: "",
    postId: "",
    detail: {},
    commentCounts: 0,
    relatedPostList: [],
    commentsList: [],
    display: false,
    displaygoods: false,
    displaytags: false,
    displaymp:false,
    page: 1,
    isLastPage: false,
    isLoading: false,
    isPull: false,
    toolbarShow: true,
    commentInputDialogShow: false,
    iconBarShow: false,
    menuBackgroup: false,

    focus: false,
    placeholder: "说点什么...",
    toUserId: "",
    toFormId: "",
    commentdate: "",
    content: "",

    dialog: {
      title: "",
      content: "",
      hidden: true
    },
    copyright: app.globalData.copyright,
    listStyle: '',
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    userInfo: {},

    likeIcon: "../../images/entry-like.png",
    downloadFileDomain: config.getDownloadFileDomain,
    logo: config.getLogo,
    postImageUrl: config.getPostImageUrl,
    domain: config.getDomain,
    platform: '',
    posterConfig: {},
    // 当前用户的手机系统和是否是iPhone X
    system: '',
    isIpx: '',

    isPlayAudio: false,
    audioSeek: 0,
    audioDuration: 0,
    showTime1: '00:00',
    showTime2: '00:00',
    audioTime: 0,
    displayAudio: 'none',
    shareImagePath: '',
    detailSummaryHeight: '',
    detailAdsuccess: true,
    fristOpen: false
  },
  phoneCall: function () {
    var number = this.data.detail.link_url;
    wx.makePhoneCall({
      phoneNumber: number
    })
  },
  copyUrlLinkBtn:function() {
    var linkUrl = this.data.detail.link_url;
    Adapter.copyLink(linkUrl, "已复制直达链接");
  },
  onLoad: function (option) {
    console.log(option)
    let args = {};
    let self = this;
    args.id = option.id;
    args.postType = "post";

    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        var isIpx = t.model.indexOf('iPhone X') != -1 ? true : false;
        self.setData({ system: system, platform: t.platform, isIpx: isIpx });
      }
    })
    Auth.setUserMemberInfoData(self);
    args.userId = self.data.userSession.userId;
    args.sessionId = self.data.userSession.sessionId;
    // ‘canvas’为前面创建的canvas标签的canvas-id属性值

    if (option.type == '1'){
      this.setData({
        isGoods:true
      })
      Adapter.loadGoodsDetail(args, self, WxParse, API, util, innerAudioContext, ctx);
    } else {
      this.setData({
        isGoods: false
      })
      Adapter.loadArticleDetail(args, self, WxParse, API, util, innerAudioContext, ctx);
    }
    

    self.setData({
      postId: option.id
    });
    Auth.checkLogin(self);
    new ModalView;


  },

  onPullDownRefresh: function () {
    var self = this;
    let args = {};
    args.id = this.data.postId;
    args.postType = "post";
    Auth.setUserMemberInfoData(this);
    args.userId = this.data.userSession.userId;
    args.sessionId = this.data.userSession.sessionId;
    this.setData({ relatedPostList: [], isPull: true, detailAdsuccess: true });
    if(this.data.isGoods){
      Adapter.loadGoodsDetail(args, self, WxParse, API, util, innerAudioContext, ctx);
    } else {
      Adapter.loadArticleDetail(args, self, WxParse, API, util, innerAudioContext, ctx);
    }
  },

  loadInterstitialAd: function (excitationAdId) {
    var self = this;
    if (wx.createRewardedVideoAd) {
      rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: excitationAdId })
      rewardedVideoAd.onLoad(() => {
        console.log('onLoad event emit')
      })
      rewardedVideoAd.onError((err) => {
        console.log(err);
        this.setData({
          detailSummaryHeight: ''
        })
      })
      rewardedVideoAd.onClose((res) => {

        var id = self.data.detail.id;
        if (res && res.isEnded) {

          var nowDate = new Date();
          nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();

          var openAdLogs = wx.getStorageSync('openAdLogs') || [];
          // 过滤重复值
          if (openAdLogs.length > 0) {
            openAdLogs = openAdLogs.filter(function (log) {
              return log["id"] !== id;
            });
          }
          // 如果超过指定数量不再记录
          if (openAdLogs.length < 21) {
            var log = {
              "id": id,
              "date": nowDate
            }
            openAdLogs.unshift(log);
            wx.setStorageSync('openAdLogs', openAdLogs);
            console.log(openAdLogs);

          }
          this.setData({
            detailSummaryHeight: ''
          })
        } else {

          Adapter.toast("你中途关闭了视频", 3000);

        }
      })
    }

  },

  // 阅读更多
  readMore: function () {
    var self = this;

    var platform = self.data.platform
    if (platform == 'devtools') {

      Adapter.toast("开发工具无法显示激励视频", 2000);
      self.setData({
        detailSummaryHeight: ''
      })
    }
    else {

      rewardedVideoAd.show()
        .catch(() => {
          rewardedVideoAd.load()
            .then(() => rewardedVideoAd.show())
            .catch(err => {
              console.log('激励视频 广告显示失败');
              self.setData({
                detailSummaryHeight: ''
              })
            })
        })

    }

  },

  //拖动进度条事件
  sliderChange(e) {
    var that = this;
    innerAudioContext.src = this.data.detail.audios[0].src;
    //获取进度条百分比
    var value = e.detail.value;
    this.setData({ audioTime: value });
    var duration = this.data.audioDuration;
    //根据进度条百分比及歌曲总时间，计算拖动位置的时间
    value = parseInt(value * duration / 100);
    //更改状态
    this.setData({ audioSeek: value, isPlayAudio: true });
    //调用seek方法跳转歌曲时间
    innerAudioContext.seek(value);
    //播放歌曲
    innerAudioContext.play();
  },
  //播放、暂停按钮
  playAudio() {
    var self = this;
    Adapter.playAudio(innerAudioContext, self)
  },

  onUnload: function () {
    //卸载页面，清除计步器
    clearInterval(this.data.durationIntval);
    if (rewardedVideoAd && rewardedVideoAd.destroy) {
       rewardedVideoAd.destroy() 
      }
    innerAudioContext.destroy()
    ctx=null;


  },
  onShow: function () {

  },
  onReady: function () {

    Auth.checkSession(app, API, this, 'isLoginLater', util);
  },
  onUnload: function () {
    //this.removeArticleChange();
  },

  detailRefresh: function () {
    var self = this;
    let args = {};
    args.id = this.data.postId;
    args.postType = "post";
    Auth.setUserMemberInfoData(this);
    args.userId = this.data.userSession.userId;
    args.sessionId = this.data.userSession.sessionId;
    this.setData({ detail: {}, relatedPostList: [], isPull: true, detailAdsuccess: true });
    Adapter.loadArticleDetail(args, self, WxParse, API, util, innerAudioContext);


  },



  onReachBottom: function () {
    let args = {};
    args.postId = this.data.postId;
    args.limit = pageCount;
    args.page = this.data.page;
    args.flag = "postcomment";
    if (!this.data.isLastPage) {
      this.setData({ isLoading: true });
      console.log('当前页' + this.data.page);
      Adapter.loadComments(args, this, API);
    }
    else {
      this.setData({ isLoading: false });
      console.log('评论已经是最后一页了');
    }
  },

  fristOpenComment: function () {
    let args = {};
    args.postId = this.data.postId;
    args.limit = pageCount;
    args.page = 1;
    args.flag = "postcomment";
    this.setData({ isLoading: true, commentsList: [] });
    Adapter.loadComments(args, this, API);
    console.log('当前页' + this.data.page);

  },

  onShareAppMessage: function () {
    var self = this;
    var imageUrl = self.data.detail.post_full_image;
    var shareImagePath = self.data.shareImagePath;

    // if (shareImagePath) {
    //   imageUrl = shareImagePath;

    // }
    var path = '/pages/detail/detail?id=' + self.data.postId;
    if(this.data.isGoods) {
      path += '&type=1';
    }

    return {
      title:   self.data.detail.title.rendered,
      path: path,
      imageUrl: imageUrl
    }


    // ,
    // fail:(res)=>{
    //     return {
    //         title: '分享文章：'+self.data.detail.title.rendered,
    //         path: '/pages/detail/detail?id='+self.data.postId,
    //         imageUrl:imageUrl
    //     }
    // }


  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    Adapter.redictDetail(e, "post");
  },
  //--------------------------------------
  removeArticleChange: function () {
    //NC.removeNotification("articleChange", this)
  },
  goHome: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },

  replay: function (e) {
    var self = this;
    if (self.data.detail.enableComment == "0") {
      return;
    }
    var parentId = e.currentTarget.dataset.id;
    var toUserName = e.currentTarget.dataset.name;
    var toUserId = e.currentTarget.dataset.userid;
    var toFormId = e.currentTarget.dataset.formid;
    var commentdate = e.currentTarget.dataset.commentdate;
    isFocusing = true;
    self.showToolBar();
    self.setData({
      parentId: parentId,
      placeholder: "回复" + toUserName + ":",
      focus: true,
      toUserId: toUserId,
      toFormId: toFormId,
      commentdate: commentdate
    });


    //console.log('toFormId', toFormId);
    //console.log('replay', isFocusing);
  },

  formSubmitComment: function (e) {

    var self = this;
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      Adapter.submitComment(e, self, app, API, util);

    }


  },
  postLike: function () {
    var self = this;
    var id = self.data.detail.id
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      Adapter.postLike(id, self, app, API, "postDetail");

    }

  },
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');

  },
  onBindBlur: function (e) {
    var self = this;
    //console.log('onBindBlur', isFocusing);
    if (!isFocusing) {
      {
        const text = e.detail.value.trim();
        if (text === '') {
          self.setData({
            parentID: "0",
            placeholder: "说点什么...",
            userid: "",
            toFromId: "",
            commentdate: ""
          });
        }

      }
    }

  },
  onBindFocus: function (e) {
    var self = this;
    isFocusing = false;
    //console.log('onBindFocus', isFocusing);
    if (!self.data.focus) {
      self.setData({ focus: true })
    }
  },
  //显示或隐藏评论输入框
  showToolBar: function () {
    this.setData({
      toolbarShow: false,
      commentInputDialogShow: true,
      iconBarShow: false,
      menuBackgroup: !this.data.menuBackgroup,
      focus: true
    })
  },

  //显示或隐藏评论图标工具栏
  showIconBar: function () {
    this.setData({
      toolbarShow: false,
      iconBarShow: true,
      commentInputDialogShow: false,
      menuBackgroup: !this.data.menuBackgroup,
      focus: false

    })
  },
  //点击非评论区隐藏评论输入框或图标栏
  hiddenBar: function () {
    this.setData({
      iconBarShow: false,
      toolbarShow: true,
      menuBackgroup: false,
      commentInputDialogShow: false,
      focus: false
    })
  },

  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },
  closeLoginPopup() {
    this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
    this.setData({ isLoginPopup: true });
  },
  postRefresh: function () {
    this.onPullDownRefresh();
    this.hiddenBar();
    Adapter.toast("已刷新", 1500);
  },

  copyLink: function () {
    var url = this.data.detail.link;
    this.hiddenBar();
    Adapter.copyLink(url, "复制成功");
  },
  gotoWebpage: function () {
    var url = this.data.detail.link;
    var enterpriseMinapp = this.data.detail.enterpriseMinapp;
    this.hiddenBar();
    Adapter.gotoWebpage(enterpriseMinapp, url);
  },
  creatPoster: function () {
    var self = this;
    self.hiddenBar();
    Adapter.creatPoster(self, app, API, util, self.modalView, 'post');


  },

  onPosterSuccess(e) {
    const { detail } = e;
    // wx.previewImage({
    //   current: detail,
    //   urls: [detail]
    // })
    this.showModal(detail);
  },
  onPosterFail(err) {
    //console.error(err);
    Adapter.toast(err, 2000);
  },


  onCreatePoster() {
    var self = this;
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true });
    }
    else {
      Adapter.creatArticlePoster(self, app, API, util, self.modalView, 'post', Poster);
    }

  },
  showModal: function (posterPath) {
    this.modalView.showModal({
      title: '保存至相册可以分享给好友',
      confirmation: false,
      confirmationText: '',
      inputFields: [{
        fieldName: 'posterImage',
        fieldType: 'Image',
        fieldPlaceHolder: '',
        fieldDatasource: posterPath,
        isRequired: false,
      }],
      confirm: function (res) {
        console.log(res)
      }
    })
  },
  payment: function () {

    var self = this;
    var enterpriseMinapp = this.data.detail.enterpriseMinapp;


    if (enterpriseMinapp == "1") {

      if (!self.data.userSession.sessionId) {

        self.setData({ isLoginPopup: true });

      }
      else {

        var originalprice = self.data.detail.originalprice;
        var postprice=self.data.detail.postprice;
        var catYearPrice=self.data.detail.catyearprice;
        var catYearIntegral=self.data.detail.catYearIntegral;
        
        if(postprice !='' || catYearPrice !='' || catYearIntegral !='')
        {
          wx.navigateTo({
            url: '../payment/payment?postid=' + self.data.postId + "&categoryid=" + self.data.detail.categories[0] + "&posttitle=" + self.data.detail.title.rendered
          })

        }
        else if(originalprice !="" && catYearIntegral =='')
        {
          self.postIntegral();
        }

        


      }

    }
    else {

      Adapter.toast("个人主体小程序无法使用此功能", 2000);

    }
  },
  postIntegral: function () {
    var self = this;
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var postId = self.data.detail.id;

    if (!sessionId) {

      self.setData({ isLoginPopup: true });

      return;

    }
    var originalprice = self.data.detail.originalprice;

    var args = {}
    args.sessionid = sessionId;
    args.extid = postId;
    args.userid = userId;
    args.integral = originalprice;
    args.extype="postIntegral";

    wx.lin.showDialog({
      type: "confirm",
      title: "标题",
      showTitle: false,
      confirmText: "确认",
      confirmColor: "#f60",
      content: "将使用积分" + originalprice + ",确认使用？",
      success: (res) => {
        if (res.confirm) {
          API.postIntegral(args).then(res => {

            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }
            else {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
              self.onPullDownRefresh();
            }

          })


        } else if (res.cancel) {

        }
      }
    })

  },
  postPraise: function () {
    var self = this;
    var system = self.data.system;
    var enterpriseMinapp = this.data.detail.enterpriseMinapp;
    var authorZanImage = self.data.detail.author_zan_image;
    var praiseimgurl = self.data.detail.praiseimgurl;
    if (authorZanImage != "") {
      wx.previewImage({
        urls: [authorZanImage],
      });

    }
    else {

      if (system == 'iOS') {
        if (praiseimgurl != '') {
          wx.previewImage({
            urls: [praiseimgurl],
          });


        }
        else if (praiseimgurl == '' && enterpriseMinapp == "1") {
          Adapter.toast("根据相关规定，该功能暂时只支持在安卓手机上使用", 1500);

        }
        else{
          Adapter.toast("设置错误，无法赞赏", 1500);
        }

      }
      else {
        if(enterpriseMinapp == "1")
        {
          if (!self.data.userSession.sessionId) {
            self.setData({ isLoginPopup: true });
          }
          else {
            wx.navigateTo({
              url: '../postpraise/postpraise?postid=' + self.data.postId + "&touserid=" + self.data.userSession.userId+"&posttype=post"
            })
          }

        }
        else if (enterpriseMinapp != "1" && praiseimgurl != "") {
            wx.previewImage({
              urls: [praiseimgurl],
            });
        }
        else{
          Adapter.toast("设置错误，无法赞赏", 1500);

        }
        
      }

    }

    self.hiddenBar();
  },
  //给a标签添加跳转和复制链接事件
  wxParseTagATap: function (e) {
    var self = this;
    var href = e.currentTarget.dataset.src;
    console.log(href);
    var domain = config.getDomain;
    //可以在这里进行一些路由处理
    if (href.indexOf(domain) == -1) {
      wx.setClipboardData({
        data: href,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
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
    }
    else {
      var slug = util.GetUrlFileName(href, domain);
      if (slug == 'index') {
        wx.switchTab({
          url: '../index/index'
        })
      }
      else {
        API.getPostBySlug(slug).then(res => {
          if (res.length && res.length > 0) {
            var postId = res[0].id;
            var openLinkCount = wx.getStorageSync('openLinkCount') || 0;
            if (openLinkCount > 4) {
              wx.redirectTo({
                url: '../detail/detail?id=' + postId
              })
            }
            else {
              wx.navigateTo({
                url: '../detail/detail?id=' + postId
              })
              openLinkCount++;
              wx.setStorageSync('openLinkCount', openLinkCount);
            }

          }
          else {
            var minAppType = config.getMinAppType;
            var url = '../webpage/webpage'
            if (minAppType == "0") {
              url = '../webpage/webpage';
              wx.navigateTo({
                url: url + '?url=' + href
              })
            }
            else {
              Adapter.copyLink(href, "链接已复制");
            }


          }
        })
      }

    }
  },

  detailAdbinderror: function (e) {
    var self = this;
    if (e.errCode) {
      self.setData({ detailAdsuccess: false })

    }
  },
  deleteComment: function (e) {
    var self = this;
    var id = e.currentTarget.dataset.id;
    var data = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var commentsList = self.data.commentsList;

    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    data.id = id;
    data.userid = userId;
    data.sessionid = sessionId;
    data.deletetype = 'publishStatus';
    wx.lin.showDialog({
      type: "confirm",
      title: "标题",
      showTitle: false,
      confirmText: "确认",
      confirmColor: "#f60",
      content: "确认删除？",
      success: (res) => {
        if (res.confirm) {
          API.deleteCommentById(data).then(res => {
            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }
            else {

              var hasChild = false;
              commentsList.forEach(element => {
                if (element.id == id && element.child.length > 0) {
                  hasChild = true;

                }

              })

              if (hasChild) {
                self.onPullDownRefresh();

              } else {
                commentsList = commentsList.filter(function (item) {
                  return item["id"] !== id;
                });
                self.setData({ commentsList: commentsList })

              }

              var commentCounts = parseInt(self.data.commentCounts) - 1;
              self.setData({
                commentCounts: commentCounts

              });

              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }

          })

        } else if (res.cancel) {

        }
      }
    })

  }


}
//-------------------------------------------------
Page(options)

