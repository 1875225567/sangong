cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _chatRoot:null,
        _tabQuick:null,
        _tabEmoji:null,
        _iptChat:null,
        
        _quickChatInfo:null,
        _btnChat:null,
        _tapCloses:null,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        cc.vv.chat = this;
        
        this._btnChat = this.node.getChildByName("btn_chat");
        this._btnChat.active = cc.vv.replayMgr.isReplay() == false;
        
        this._chatRoot = this.node.getChildByName("chat");
        this._chatRoot.active = false;
        
        this._tabQuick = this._chatRoot.getChildByName("quickchatlist");
        this._tabEmoji = this._chatRoot.getChildByName("emojis");
        
        this._iptChat = this._chatRoot.getChildByName("iptChat").getComponent(cc.EditBox);

        var tabquick = this._chatRoot.getChildByName("tabQuick");
        this.setSpriteFrame(tabquick,"selectup1")
        
        this._quickChatInfo = {};
        this._quickChatInfo["item0"] = {index:0,content:"大家好，很高兴见到各位",sound:"fix_msg_1.mp3"};
        this._quickChatInfo["item1"] = {index:1,content:"专心玩游戏把",sound:"fix_msg_2.mp3"};
        this._quickChatInfo["item2"] = {index:2,content:"不要走，决战到天亮！",sound:"fix_msg_3.mp3"};
        this._quickChatInfo["item3"] = {index:3,content:"又断线，网络怎么那么差",sound:"fix_msg_4.mp3"};
        this._quickChatInfo["item4"] = {index:4,content:"我们来交个朋友把",sound:"fix_msg_5.mp3"};
        this._quickChatInfo["item5"] = {index:5,content:"再见了，我会想念大家的",sound:"fix_msg_6.mp3"};

        this.init();
    },

    init:function(){
        var t = cc.sys.localStorage.getItem("bullet");
        if(t != null){
            if(parseInt(t) > 0){
                this._btnChat.getComponent(cc.Button).interactable = true;
                this._btnChat.color = cc.color(255,255,255,255);
            }
            else{
                this._btnChat.getComponent(cc.Button).interactable = false;
                this._btnChat.color = cc.color(127.5,127.5,127.5,255);
            }
        }
        else{
            cc.sys.localStorage.setItem("bullet",1);
        }
    },
    
    getQuickChatInfo(index){
        var key = "item" + index;
        return this._quickChatInfo[key];   
    },
    
    onBtnChatClicked:function(){
        cc.vv.transition.active(this._chatRoot);
    },
    
    onBgClicked:function(){
        this._chatRoot.active = false;
    },
    
    onTabClicked:function(event){
        if(event.target.name == "tabQuick"){
            this._tabQuick.active = true;
            this._tabEmoji.active = false;
            // var tabquick = this._chatRoot.getChildByName("tabQuick");
            // this.setSpriteFrame(tabquick,"selectup1")
            // var tabemoji = this._chatRoot.getChildByName("tabEmoji");
            // this.setSpriteFrame(tabemoji,"selectdown0")
        }
        else if(event.target.name == "tabEmoji"){
            this._tabQuick.active = false;
            this._tabEmoji.active = true;
            // var tabquick = this._chatRoot.getChildByName("tabQuick");
            // this.setSpriteFrame(tabquick,"selectup0")
            // var tabemoji = this._chatRoot.getChildByName("tabEmoji");
            // this.setSpriteFrame(tabemoji,"selectdown1")
        }
    },
    
    onQuickChatItemClicked:function(event){
        this._chatRoot.active = false;
        var info = this._quickChatInfo[event.target.name];
        cc.vv.net.send("quick_chat",info.index); 
    },
    
    onEmojiItemClicked:function(event){
        console.log(event.target.name);
        this._chatRoot.active = false;
        cc.vv.net.send("emoji",event.target.name);
    },
    
    onBtnSendChatClicked:function(){
        this._chatRoot.active = false;
        if(this._iptChat.string == ""){
            return;
        }
        cc.vv.net.send("chat",this._iptChat.string);
        this._iptChat.string = "";
    },

    setSpriteFrame:function(node,str){
        cc.loader.loadRes("textures/wrapper/chat",cc.SpriteAtlas,function(err,atlas){
            var spriteframe = atlas.getSpriteFrame(str);
            node.getComponent(cc.Sprite).spriteFrame = spriteframe;
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
