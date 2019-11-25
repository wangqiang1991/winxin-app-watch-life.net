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
const util = require('../../utils/util.js');
const Adapter = require('../../utils/adapter.js')
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const pageCount = config.getPageCount;

const options = {
    data: {        
        columns:[],       
        isPull: false,            
        shareTitle: config.getWebsiteName+'-分类',
        pageTitle: '分类',
        activeId:'67'

    },
    onLoad: function () {
        var args={};
        args.pageCount =pageCount; 
        args.isTree=true;       
        Adapter.loadTabCategories(args,this,API,false);
    },

    onShow: function () {
       
    },

    onReady:function(){
        wx.setNavigationBarTitle({ title: this.data.pageTitle })
    },
    onUnload: function () {
        // this.removeArticleChange();
    },

    onPullDownRefresh: function () {
        this.setData({            
            categoriesList: []
        })        
        this.loadAticles(args, this, API);
    },
    onReachBottom: function () {        
    },    

    onShareAppMessage: function () {
        return {
            title: this.data.shareTitle,
            path: '/pages/index/index'
        }
    },
    onClickNav:function(e) {
    this.setData({
      mainActiveIndex: e.detail.index || 0
    });
    if(e.detail.haschildren=="0")
    {

        var url = '../list/list?categoryIds=' + e.detail.id;
        wx.navigateTo({
            url: url
        });

    }

  },
  onClickItem:function(e) {
    var type = e.detail.type == "procate" ? 1 : 2;
    var titleName = e.detail.name;
    var slug = e.detail.slug;
    this.setData({
      activeId: e.detail.id
    });
    var url = '../list/list?categoryIds=' + e.detail.id + "&type=" + type + "&title=" + titleName + "&slug=" + slug;
        wx.navigateTo({
            url: url
        });

},

    //跳转至某分类下的文章列表
    redictList: function (e) {
        //console.log('查看某类别下的文章');  
        var id = e.currentTarget.dataset.id;
        var name = e.currentTarget.dataset.item;
        var url = '../list/list?categoryIds=' + id;
        wx.navigateTo({
            url: url
        });
    },
    //--------------------------------------
    removeArticleChange: function () {
       // NC.removeNotification("articleChange", this)
    }
}
//-------------------------------------------------
Page(options)

