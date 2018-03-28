var Net = require("Net")
var Global = require("Global")
cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label,
        lblMoney:cc.Label,
        lblGems:cc.Label,
        lblGamegold:cc.Label,
        lblCoins:cc.Label,
        lblID:cc.Label,
        lblNotice:cc.Label,
        joinGameWin:cc.Node,
        createRoomWin:cc.Node,
        settingsWin:cc.Node,
        helpWin:cc.Node,
        xiaoxiWin:cc.Node,
        sprHeadImg:cc.Sprite,
        //btnJoinGame:cc.Node,
        //btnReturnGame:cc.Node,

        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },
    
    initNetHandlers:function(){
        var self = this;
    },
    
    onShare:function(){
        cc.vv.anysdkMgr.share("三公扑克","三公扑克，包含了百人三公玩法。");
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if(!cc.vv){
            cc.director.loadScene("loading");
            return;
        }
        this.initLabels();
        
        //var params = cc.vv.args;
        var roomId = cc.vv.userMgr.oldRoomId 
        if( roomId != null){
            cc.vv.userMgr.oldRoomId = null;
            cc.vv.userMgr.enterRoom(roomId);
        }
        
        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(cc.vv.userMgr.userId);
        cc.vv.utils.addClickEvent(this.sprHeadImg.node,this.node,"Hall","onBtnClicked");
        
        //this.addComponent("UserInfoShow");
        
        this.initButtonHandler("Canvas/right_bottom/btn_shezhi");
        this.initButtonHandler("Canvas/right_bottom/btn_help");
        this.initButtonHandler("Canvas/right_bottom/btn_xiaoxi");
        //this.helpWin.addComponent("OnBack");
        this.xiaoxiWin.addComponent("OnBack");
        
        if(!cc.vv.userMgr.notice){
            cc.vv.userMgr.notice = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        if(!cc.vv.userMgr.gemstip){
            cc.vv.userMgr.gemstip = {
                version:null,
                msg:"数据请求中...",
            }
        }
        
        this.lblNotice.string = cc.vv.userMgr.notice.msg;
        
        this.refreshInfo();
        this.refreshNotice();
        this.refreshGemsTip();
        
        //cc.vv.audioMgr.playBGM("bgMain.mp3");
        cc.vv.audioMgr.playBGM("hall_bg.mp3");

        cc.vv.utils.addEscEvent(this.node);
    },
    
    refreshInfo:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    cc.vv.userMgr.gems = ret.gems;
                    cc.vv.userMgr.coins = ret.coins;
                    cc.vv.userMgr.bankcoins = ret.coinsbank;
                    cc.vv.userMgr.gamegold = ret.yuanbaos;
                    cc.vv.userMgr.bankgamegold = ret.yuanbaosbank;
                    this.lblGems.string = cc.vv.gameNetMgr.getNumbersToString(ret.gems);
                    this.lblCoins.string = cc.vv.gameNetMgr.getNumbersToString(ret.coins);
                    this.lblGamegold.string = cc.vv.gameNetMgr.getNumbersToString(ret.yuanbaos);
                }
            }
        };
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },

    refreshGemsTip:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                //cc.vv.userMgr.gemstip.version = ret.version;
                // cc.vv.userMgr.gemstip.msg = ret.msg.replace("<newline>","\n");
                cc.vv.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = ret.msg;
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            //type:"fkgm",
            //version:cc.vv.userMgr.gemstip.version
        };
        cc.vv.http.sendRequest("/get_marquee_message",data,onGet.bind(this));
    },
    
    refreshNotice:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.notice.version = ret.version;
                cc.vv.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = ret.msg;
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"notice",
            version:cc.vv.userMgr.notice.version
        };
        //cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    initButtonHandler:function(btnPath){
        var btn = cc.find(btnPath);
        cc.vv.utils.addClickEvent(btn,this.node,"Hall","onBtnClicked");        
    },
    
    initLabels:function(){
        this.lblName.string = cc.vv.userMgr.userName;
        this.lblCoins.string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.coins);
        this.lblGems.string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.gems);
        this.lblGamegold.string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.gamegold);
        this.lblID.string = "ID:" + cc.vv.userMgr.userId;
    },
    
    onBtnClicked:function(event){
        if(event.target.name == "btn_shezhi"){
            cc.vv.transition.active(this.settingsWin);
        }   
        else if(event.target.name == "btn_help"){
            cc.vv.transition.active(this.helpWin);
        }
        else if(event.target.name == "btn_xiaoxi"){
            cc.vv.transition.active(this.xiaoxiWin);
        }
        else if(event.target.name == "head"){
            //cc.vv.userinfoShow.show(cc.vv.userMgr.userName,cc.vv.userMgr.userId,cc.vv.userMgr.gems,cc.vv.userMgr.coins,cc.vv.userMgr.gamegold,this.sprHeadImg,cc.vv.userMgr.sex,cc.vv.userMgr.ip);
        }
    },
    
    onJoinGameClicked:function(){
        cc.vv.transition.active(this.joinGameWin);
    },
    
    onReturnGameClicked:function(){
        cc.vv.wc.show('正在返回游戏房间');
        cc.director.loadScene("sggame");
    },
    
    onBtnAddGemsClicked:function(){
        cc.vv.alert.show(cc.vv.userMgr.gemstip.msg,function(){
            this.onBtnTaobaoClicked();
        }.bind(this));
        this.refreshInfo();
    },
    
    onCreateRoomClicked:function(){
        if(cc.vv.gameNetMgr.roomId != null){
            cc.vv.alert.show("房间已经创建!\n必须解散当前房间才能创建新的房间");
            return;
        }
        console.log("onCreateRoomClicked");
        // cc.vv.transition.active(this.createRoomWin);
        this.createRoomWin.active = true;
    },
    
    onBtnTaobaoClicked:function(){
        cc.sys.openURL('https://www.taobao.com/');
    },

    openjiemian:function(){
        var node = this.node.getChildByName("fakeGame");
        node.active = true;
        //console.log(123);
    },
    
    closejiemian:function(){
        var node = this.node.getChildByName("fakeGame");
        node.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var x = this.lblNotice.node.x;
        x -= dt*100;
        if(x + this.lblNotice.node.width < -1000){
            x = 500;
        }
        this.lblNotice.node.x = x;
        
        if(cc.vv && cc.vv.userMgr.roomData != null){
            cc.vv.userMgr.enterRoom(cc.vv.userMgr.roomData);
            cc.vv.userMgr.roomData = null;
        }
    },
});
