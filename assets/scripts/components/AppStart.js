function urlParse(){
    var params = {};
    if(window.location == null){
        return params;
    }
    var name,value; 
    var str=window.location.href; //取得整个地址栏
    var num=str.indexOf("?") 
    str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

    var arr=str.split("&"); //各个参数放到数组里
    for(var i=0;i < arr.length;i++){ 
        num=arr[i].indexOf("="); 
        if(num>0){ 
            name=arr[i].substring(0,num);
            value=arr[i].substr(num+1);
            params[name]=value;
        } 
    }
    return params;
}

function initMgr(){
    cc.vv = {};
    var UserMgr = require("UserMgr");
    cc.vv.userMgr = new UserMgr();
    
    var ReplayMgr = require("ReplayMgr");
    cc.vv.replayMgr = new ReplayMgr();
    
    cc.vv.http = require("HTTP");
    cc.vv.global = require("Global");
    cc.vv.net = require("Net");
    
    var GameNetMgr = require("GameNetMgr");
    cc.vv.gameNetMgr = new GameNetMgr();
    cc.vv.gameNetMgr.initHandlers();
    
    var AnysdkMgr = require("AnysdkMgr");
    cc.vv.anysdkMgr = new AnysdkMgr();
    cc.vv.anysdkMgr.init();
    
    var VoiceMgr = require("VoiceMgr");
    cc.vv.voiceMgr = new VoiceMgr();
    cc.vv.voiceMgr.init();
    
    var AudioMgr = require("AudioMgr");
    cc.vv.audioMgr = new AudioMgr();
    cc.vv.audioMgr.init();
    
    var Utils = require("Utils");
    cc.vv.utils = new Utils();

    var transition = require("Transition");
    cc.vv.transition = new transition();
    
    //var MJUtil = require("MJUtil");
    //cc.vv.mjutil = new MJUtil();
    
    cc.args = urlParse();
}
    

    
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        label: {
            default: null,
            type:cc.Label
        },

        loadingProgess:cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        initMgr();
        this.wechatLogin();
        //console.log('haha'); 
        this._mainScene = 'loading';
        this.showSplash(function(){
            var url = cc.url.raw('resources/ver/cv.txt');
            cc.loader.load(url,function(err,data){
                cc.VERSION = data;
                console.log('current core version:' + cc.VERSION);
                this.getServerInfo();
            }.bind(this));
        }.bind(this));
    },

    wechatLogin:function(){
        if(cc.sys.browserType == cc.sys.BROWSER_TYPE_WECHAT){
            this.wechatInit();
        }
    },

    wechatInit:function(){
        var self = this;
        //微信公众号授权
        var loginInfo = cc.sys.localStorage.getItem('loginInfo');
        if (!loginInfo) {
            var wxCode = cc.args["code"];
            if(wxCode){
                cc.vv.http.sendRequest('/wechat/api/wxUserInfo/'+wxCode,null,function(data){
                    if(data){
                        loginInfo=data;
                        cc.sys.localStorage.setItem('loginInfo',JSON.stringify(loginInfo));
                        self.wxInit();
                    }
                    else{
                        console.error('登录失败');
                    }
                },cc.vv.http.serverUrl);
            }else{
                //获取code
                window.location.href=this.getUrlForWxCode(cc.vv.http.wxAppId,cc.vv.http.appUrl,true);
                return;
            }
        }else{
            this.wxInit();
        }
    },
    //获取code所需要跳转的url
    getUrlForWxCode: function (appid, redirect_url, isSnsapiUserinfo) {
        var scope = isSnsapiUserinfo ? 'snsapi_userinfo' : 'snsapi_base';
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + encodeURIComponent(redirect_url) + '&response_type=code&scope=' + scope + '&state=#wechat_redirect';
    },

    wxInit:function(){
        var self = this;
        cc.vv.http.postRequest('/wechat/api/sign',{url:window.location.href.split('#')[0]},function(err,sign){
            if(err){
                console.error('获取签名出错 : '+JSON.stringify(err));
            }else{
                // 开始配置微信JS-SDK
                wx.config({
                    debug: true,
                    appId: sign.appId,
                    timestamp: sign.timestamp,
                    nonceStr: sign.nonceStr,
                    signature: sign.signature,
                    jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone'
                    ]
                });

                // 调用微信API
                wx.ready(function(){
                    console.log('wx.ready');
                    var headimg = "";
                    if(loginInfo){
                        headimg = loginInfo.headimgurl;
                    }
                    var sdata = {
                        title: '大风车三公',
                        desc: '开心快乐的圣地',
                        link: cc.vv.http.appUrl,
                        imgUrl: headimg,
                        success: function() {
                        },
                        cancel: function() {
                        }
                    };
                    wx.onMenuShareTimeline(sdata);
                    wx.onMenuShareAppMessage(sdata);
                });
            }
        },cc.vv.http.serverUrl);
    },

    onBtnDownloadClicked:function(){
        cc.sys.openURL(cc.vv.SI.appweb);
    },
    
    showSplash:function(callback){
        var self = this;
        var SHOW_TIME = 3000;
        var FADE_TIME = 500;
        this._splash = cc.find("Canvas/splash");
        if(true || cc.sys.os != cc.sys.OS_IOS || !cc.sys.isNative){
            //this._splash.active = true;
            if(this._splash.getComponent(cc.Sprite).spriteFrame == null){
                callback();
                return;
            }
            var t = Date.now();
            var fn = function(){
                var dt = Date.now() - t;
                if(dt < SHOW_TIME){
                    setTimeout(fn,33);
                }
                else {
                    var op = (1 - ((dt - SHOW_TIME) / FADE_TIME)) * 255;
                    if(op < 0){
                        self._splash.opacity = 0;
                        callback();   
                    }
                    else{
                        self._splash.opacity = op;
                        setTimeout(fn,33);   
                    }
                }
            };
            setTimeout(fn,33);
        }
        else{
            //this._splash.active = false;
            callback();
        }
    },
    
    getServerInfo:function(){
        var self = this;
        var onGetVersion = function(ret){
            if(ret.version == null){
                console.log("error.");
            }
            else{
                cc.vv.SI = ret;
                if(ret.version != cc.VERSION){
                    cc.find("Canvas/alert").active = true;
                }
                else{
                    cc.director.loadScene(self._mainScene);
                }
            }
        };
        
        var xhr = null;
        var complete = false;
        var fnRequest = function(){
            self.loadingProgess.string = "正在连接服务器";
            xhr = cc.vv.http.sendRequest("/get_serverinfo",null,function(ret){
                xhr = null;
                complete = true;
                onGetVersion(ret);
            });
            setTimeout(fn,5000);            
        }
        
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    self.loadingProgess.string = "连接失败，即将重试";
                    setTimeout(function(){
                        fnRequest();
                    },5000);
                }
                else{
                    fnRequest();
                }
            }
        };
        fn();
    },
    log:function(content){
        this.label.string += content + '\n';
    },
});
