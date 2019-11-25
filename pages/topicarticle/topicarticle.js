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
import { ModalView } from '../../templates/modal-view/modal-view.js'
import Poster from '../../templates/components/wxa-plugin-canvas-poster/poster/poster';



const app = getApp()
const pageCount = config.getPageCount;
let isFocusing = false;
const backgroundAudioManager = wx.getBackgroundAudioManager();

const options = {
  data: {
    parentId: "0",
    shareTitle: "",
    pageTitle: "",
    postId: "",
    topicId: "",

    detail: {},
    commentCounts: 0,

    relatedPostList: [],
    commentsList: [],
    repliesList: [],
    display: false,
    total_replies: 0,

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
    vid: '',
    isPlaying: 0,
    // 当前用户的手机系统和是否是iPhone X
    system: '',
    isIpx: ''

  },

  onLoad: function (option) {
    var self = this;
    Auth.setUserMemberInfoData(self);
    var data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    data.topicId = option.id;
    self.setData({ topicId: option.id })
    Adapter.loadBBTopic(data, self, WxParse, API, util);
    data.page = 1;
    data.per_page = 20;
    //Adapter.loadReplayTopic(data,self,API) ;       
    Auth.checkLogin(self);
    new ModalView;

    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        var isIpx = t.model.indexOf('iPhone X') != -1 ? true : false;
        self.setData({ system: system, isIpx: isIpx });

      }
    })

    backgroundAudioManager.onEnded(() => {
      //console.log(res);
      self.setData({
        isPlaying: 0
      })
    });


  },
  onPullDownRefresh: function () {
    var self = this;
    var data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    data.topicId = self.data.topicId;
    self.setData({ topicId: self.data.topicId })
    Adapter.loadBBTopic(data, self, WxParse, API, util);

  },
  open_link_doc: function () {
    var self = this;
    var url = self.data.detail.fileLink;
    var fileType = self.data.detail.fileType;

    wx.downloadFile({
      url: url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          fieldType: fileType,
          success: function (res) {
            console.log('打开文档成功')

          }
        })
      },
      fail: function (error) {
        console.log('下载文档失败')


      }
    })

  }, openmap: function (e) {
    var self = this;
    var lat = Number(e.currentTarget.dataset.lat);
    var lng = Number(e.currentTarget.dataset.lng);
    var address = e.currentTarget.dataset.address;
    console.log(self.data.latitude);
    var lati = Number(self.data.thislatitude);
    var long = Number(self.data.thislongitude);
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      scale: 28,
      name: address,
    })


  },
  // listenerBtnGetLocation: function () {
  //   wx.getLocation({
  //     //定位类型 wgs84, gcj02
  //     type: 'gcj02',
  //     success: function (res) {
  //       console.log(res)
  //       wx.openLocation({
  //         //当前经纬度
  //         latitude: res.latitude,
  //         longitude: res.longitude,
  //         //缩放级别默认28
  //         scale: 28,
  //         //位置名
  //         name: '测试地址',
  //         //详细地址
  //         address: '火星路24号',
  //         //成功打印信息
  //         success: function (res) {
  //           console.log(res)
  //         },
  //         //失败打印信息
  //         fail: function (err) {
  //           console.log(err)
  //         },
  //         //完成打印信息
  //         complete: function (info) {
  //           console.log(info)
  //         },
  //       })

  //     },
  //     fail: function (err) {
  //       console.log(err)
  //     },
  //     complete: function (info) {
  //       console.log(info)
  //     },
  //   })
  // },
  onShow: function () {

  },
  onReady: function () {

    Auth.checkSession(app, API, this, 'isLoginLater', util);
  },

  onReachBottom: function () {
    let args = {};
    args.topicId = this.data.topicId;
    args.per_page = pageCount;
    args.page = this.data.page;
    if (!this.data.isLastPage) {
      this.setData({ isLoading: true });
      console.log('当前页' + this.data.page);
      Adapter.loadReplayTopic(args, this, API);
    }
    else {
      this.setData({ isLoading: false });
      console.log('评论已经是最后一页了');
    }
  },

  fristOpenComment: function () {
    let args = {};
    args.topicId = this.data.topicId;
    args.per_page = pageCount;
    args.page = 1;
    this.setData({ isLoading: true, repliesList: [] });
    console.log('当前页' + this.data.page);
    Adapter.loadReplayTopic(args, this, API);


  },
  onShareAppMessage: function () {
    return {
      title: this.data.detail.title,
      path: '/pages/topicarticle/topicarticle?id=' + this.data.topicId,
      imageUrl: this.data.detail.post_full_image,
    }
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


  //回复这个话题
  replySubmit: function (e) {
    var self = this;
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      var name = self.data.userInfo.nickName;
      var sessionId = self.data.userSession.sessionId;
      var userId = self.data.userSession.userId;
      var replycontent = e.detail.value.inputComment;
      var topicID = e.detail.value.inputTopicID;
      var formId = e.detail.formId;

      var parentId = self.data.parentId;
      var toFormId = self.data.toFormId; //回复的formid
      var toUserId = self.data.toUserId; //回复的userid


      if (replycontent.length === 0) {
        self.setData({
          'dialog.hidden': false,
          'dialog.title': '提示',
          'dialog.content': '回复内容为空'
        });

        return;
      }

      var data = {
        sessionid: sessionId,
        userid: userId,
        content: replycontent,
        parentid: parentId,
        formid: formId,
        name:name

      };
      Adapter.replyBBTopic(topicID, data, self, WxParse, API);
      // 隐藏评论框
      this.hiddenBar();
    }
  },

  replay: function (e) {
    var self = this;
    if(self.data.detail.enableComment=="0")
    {
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

  postLike: function () {
    var self = this;
    var id = self.data.detail.id
    if (!self.data.userSession.sessionId) {

      self.setData({ isLoginPopup: true });

    }
    else {
      Adapter.postLike(id, self, app, API, "topicDetail");

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
    var url = this.data.detail.permalink;
    this.hiddenBar();
    Adapter.copyLink(url, "复制成功");
  },
  gotoWebpage: function () {
    var url = this.data.detail.permalink;
    var enterpriseMinapp = this.data.detail.enterpriseMinapp;
    this.hiddenBar();
    Adapter.gotoWebpage(enterpriseMinapp, url);
  },
  creatPoster: function () {
    var self = this;
    self.hiddenBar();
    Adapter.creatPoster(self, app, API, util, self.modalView, 'topic');


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
      Adapter.creatArticlePoster(self, app, API, util, self.modalView, 'topic', Poster);
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
        wx.navigateTo({
          url: '../payment/payment?postid=' + self.data.postId + "&categoryid=" + self.data.detail.categories[0] + "&posttitle=" + self.data.detail.title.rendered
        })

      }

    }
    else {

      Adapter.toast("个人主体小程序无法使用此功能", 2000);

    }
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
  playRemoteAudio: function (e) {
    var self = this;
    var audioUrl = self.data.detail.audioUrl;
    backgroundAudioManager.src = audioUrl;
    backgroundAudioManager.title = "录音";
    self.setData(
      {
        isPlaying: 1

      }
    )

  },
  stopRemoteAudio: function () {

    backgroundAudioManager.stop();
    this.setData(
      {
        isPlaying: 0

      }
    )

  },
  deleteComment: function (e) {

    var self = this;
    var id = e.currentTarget.dataset.id;
    var topicId = self.data.detail.id
    var data = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var repliesList = self.data.repliesList;

    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    data.id = id;
    data.userid = userId;
    data.sessionid = sessionId;
    data.topicId = topicId;
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
          API.deleteReplyById(data).then(res => {
            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }
            else {
              // wx.pageScrollTo({
              //     selector : '.entry-title1'

              //   })
              //self.setData({page:1,isLastPage:false,commentsList:[]})
              //self.onReachBottom();

              var hasChild = false;
              repliesList.forEach(element => {
                if (element.id == id && element.child.length > 0) {
                  hasChild = true;

                }

              })
              if (hasChild) {
                self.onPullDownRefresh();
              }
              else {

                repliesList = repliesList.filter(function (item) {
                  return item["id"] !== id;
                });
                self.setData({ repliesList: repliesList })

              }

              var total_replies = parseInt(self.data.total_replies) - 1;
              self.setData({
                total_replies: total_replies

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
              Adapter.copyLink(url, "链接已复制");
            }


          }
        })
      }

    }
  }

}
//-------------------------------------------------
Page(options)

