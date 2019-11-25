/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */


//配置域名,域名只修改此处。
//如果wordpress没有安装在网站根目录请加上目录路径,例如："www.minapper.com/blog"
var DOMAIN = "www.juhecat.com";
var PAGECOUNT = '10'; //列表每页数量
var WEBSITENAME = "打造全网优质化工信息"; //网站名称
var LOGO = "../../images/uploads/website_logo.png"; // 网站的logo图片
var LISTSTYLE = "leftThumbnailArticle";
var DOWNLOADFILEDOMAIN = [{
    id: 1,
    domain: 'www.juhecat.com'
  },
  {
    id: 2,
    domain: 'www.juhecat.com'
  },
  {
    id: 3,
    domain: 'www.juhecat.com'
  }
];
//首页图标导航
//参数说明：'name'为名称，'image'为图标路径，
//'redirectlink'为跳转的页面
//'redirecttype'为跳转的类型："apppage"为本小程序的页面，"webpage"为跳转业务域名的网页，"miniapp"为其他微信小程序
//'appid' 当redirecttype为miniapp时，这个值为其他微信小程序的appid，如果redirecttype为page时，这个值设置为空。
var INDEXNAV = [
  {
    id: '2',
    name: '随机推荐',
    image: '../../images/uploads/index_nav1.png',
    url: '../rand/rand',
    redirecttype: 'apppage',
    appid: '',
    extraData: ''
  },
  {
    id: '3',
    name: '文章排行',
    image: '../../images/uploads/index_nav3.png',
    url: '../hot/hot',
    redirecttype: 'apppage',
    appid: '',
    extraData: ''
  },
  {
    id: '4',
    name: '积分排行',
    image: '../../images/uploads/index_nav2.png',
    url: '../ranking/ranking?rankingType=integral',
    redirecttype: 'apppage',
    appid: '',
    extraData: ''
  },
  {
    id: '9',
    name: '商务合作',
    image: '../../images/uploads/index_nav6.png',
    url: '../appointment/appointment',
    redirecttype: 'apppage',
    appid: '',
    extraData: ''
  },  
  {
    id: '6',
    name: '最新评论',
    image: '../../images/uploads/index_nav5.png',
    url: '../comments/comments',
    redirecttype: 'apppage',
    appid: '',
    extraData: ''
  },
  {
    id: '5',
    name: '粉丝排行',
    image: '../../images/uploads/index_nav4.png',
    url: '../ranking/ranking?rankingType=follow',
    redirecttype: 'apppage',
    appid: '',
    extraData: ''
  }
];



export default {
  getDomain: DOMAIN,
  getWebsiteName: WEBSITENAME,
  getPageCount: PAGECOUNT,
  getLogo: LOGO,
  // getPostImageUrl: POSTERIMGURL,  
  getDownloadFileDomain: DOWNLOADFILEDOMAIN,
  getListStyle: LISTSTYLE,
  getIndexNav: INDEXNAV
}