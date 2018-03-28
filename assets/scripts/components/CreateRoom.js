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
        createRoomTitleNode:cc.Node,
        roomSelectNode:cc.Node,
        joinRoomNode:cc.Node,
        _leixingxuanze: null,
        _gamelist: null,
        _currentGame: null,
        _gametype:"",
        _games:0,
        _seatsNums:0,
        _goldNums:0,
    },

    // use this for initialization
    onLoad: function () {
        this.gametype = "sangong";
        this.roomSelectNode.active = false;
        this._games = 0;
        this._seatsNums = 0;
        this._goldNums = 0;
    },

    onBtnBack: function () {
        this.node.active = false;
    },

    onBtnOK: function () {
        
    },

    getType: function () {
        
    },

    getSelectedOfRadioGroup:function(groupRoot) {
        console.log(groupRoot);
        var t = this._currentGame.getChildByName(groupRoot);

        var arr = [];
        for (var i = 0; i < t.children.length; ++i) {
            var n = t.children[i].getComponent("RadioButton");
            if (n != null) {
                arr.push(n);
            }
        }
        var selected = 0;
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i].checked) {
                selected = i;
                break;
            }
        }
        return selected;
    },

    createRoom: function () {
        var self = this;
        var onCreate = function (ret) {
            if (ret.errcode !== 0) {
                cc.vv.wc.hide();
                //console.log(ret.errmsg);
                if (ret.errcode == 2222) {
                    cc.vv.alert.show("钻石不足，创建房间失败!");
                }
                else {
                    cc.vv.alert.show("创建房间失败,错误码:" + ret.errcode);
                }
            }
            else {
                cc.vv.gameNetMgr.connectGameServer(ret);
            }
        };

        var conf = null;
        conf = this.constructSCMJConf();
        conf.type = this.gametype;
        console.log("gameType : "+this.gametype);

        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            conf: JSON.stringify(conf)
        };
        console.log(data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room", data, onCreate);
    },

    createGoldRoom:function(){
        this.gametype = "goldsangong";
        this.createRoom();
    },

    constructSCMJConf: function () {
        var conf = {
            jushu:this._games,
            zuowei:this._seatsNums,
            yuanbao:this._goldNums,
        };
        return conf;
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // },

    createFriendRoom:function(){
        this.gametype = "sangong";
        this.roomtypeByTypeSelect("friend");
    },
    // createGoldRoom:function(){
    //     this.gametype = "goldsangong";
    //     this.roomtypeByTypeSelect("gold");
    // },

    roomtypeByTypeSelect:function(gametype){
        var self = this;
        // this.node.active = true;
        cc.vv.transition.active(this.node);
        cc.loader.loadRes("textures/wrapper/createroom",cc.SpriteAtlas,function(err,atlas){
            if(gametype != ""){
                var frame = atlas.getSpriteFrame(gametype);
                self.createRoomTitleNode.getComponent(cc.Sprite).spriteFrame = frame;
            }
            else{
                console.log("游戏类型变量gametype为空");
            }
        });
    },
    roomSelectCheck:function(){
        cc.vv.transition.active(this.roomSelectNode);
    },
    roomSelectClose:function(){
        this.roomSelectNode.active = false;
    },
    gamesSelect1:function(){
        this._games = 0;
    },
    gamesSelect2:function(){
        this._games = 1;
    },
    gamesSelect3:function(){
        this._games = 2;
    },
    seatsNumsSelect1:function(){
        this._seatsNums = 0;
    },
    seatsNumsSelect2:function(){
        this._seatsNums = 1;
    },
    goldNumsSelect1:function(){
        this._goldNums = 0;
    },
    goldNumsSelect2:function(){
        this._goldNums = 1;
    },
    goldNumsSelect3:function(){
        this._goldNums = 2;
    },
    goldNumsSelect4:function(){
        this._goldNums = 3;
    },
    goldNumsSelect5:function(){
        this._goldNums = 4;
    },
    goldNumsSelect6:function(){
        this._goldNums = 5;
    },

    joinRoom:function(){
        cc.vv.transition.active(this.joinRoomNode);
    },
    joinRoomClose:function(){
        this.joinRoomNode.active = false;
    },


});