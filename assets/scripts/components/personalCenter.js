cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab:cc.Prefab,
        scrollx: cc.ScrollView,
        _roomCard: null,
        _goldCoin: null,
        _number: null,
    },

    // use this for initialization
    onLoad: function () {
        this._roomCard = cc.find("Canvas/personalCenter/menubg/roomCard/btn");
        this._goldCoin = cc.find("Canvas/personalCenter/menubg/goldCoin/btn");
        this._number = cc.find("bj2/number",this.node);
        var head = cc.find("Canvas/personalCenter/headimg/head").getComponent("ImageLoader");
        head.setUserID(cc.vv.userMgr.userId);

        var username = cc.find("Canvas/personalCenter/textChunking/nickName").getComponent(cc.Label);
        username.string = cc.vv.userMgr.userName;
        var userid = cc.find("Canvas/personalCenter/textChunking/id").getComponent(cc.Label);
        userid.string = "ID:" + cc.vv.userMgr.userId;
    },

    personalCheck:function(){
        cc.vv.transition.active(this.node);
        var self = this;
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status", data, function(obj){
            if(obj.errmsg == "ok"){
                var textChunking = self.node.getChildByName("textChunking");
                var textGroup = textChunking.getChildByName("textGroup");
                textGroup.getChildByName("diamond").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString((parseInt(obj.gems)));
                textGroup.getChildByName("gamegold").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString((parseInt(obj.yuanbaos)));
                textGroup.getChildByName("money").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString((parseInt(obj.coins)));
                textGroup.getChildByName("gamegoldBank").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString((parseInt(obj.yuanbaosbank)));
                textGroup.getChildByName("moneyBank").getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString((parseInt(obj.coinsbank)));
            }
        });

        var record = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            userId: cc.vv.userMgr.userId,
            moneyType: "yuanbao",
            skip: 0,
            limit: 10,
        };
        cc.vv.http.sendRequest("/get_user_game_results", record, function(obj){
            if(obj.errmsg == "ok"){
                for(var i = 0;i < obj.results.length;++i){
                    self._number.getComponent(cc.Label).string = "元宝";
                    var recordList = cc.instantiate(self.itemPrefab);
                    recordList.getComponent('item').init(obj.results[i]);
                    self.scrollx.content.addChild(recordList);
                    self.scrollx.content.height = (i + 1) * 84.5;
                    recordList.setPosition(0, -(42 + i * 84));
                }
            }
            else{
                console.log("出错啦。");
            }
        });
    },

    personalClose:function(){
        this.node.active = false;
        this.scrollx.content.removeAllChildren();
        var menubg = this.node.getChildByName("menubg");
        var roomCard = menubg.getChildByName("roomCard");
        var goldCoin = menubg.getChildByName("goldCoin");
        if(!roomCard.active){
            roomCard.active = true;
            goldCoin.active = false;
        }
    },

    roomCard:function(){
        var self = this;
        this.alternateDisplay();
        var record = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            userId: cc.vv.userMgr.userId,
            moneyType: "coin",
            skip: 0,
            limit: 10,
        };
        cc.vv.http.sendRequest("/get_user_game_results", record, function(obj){
            if(obj.errmsg == "ok"){
                for(var i = 0;i < obj.results.length;++i){
                    var recordList = cc.instantiate(self.itemPrefab);
                    recordList.getComponent('item').init(obj.results[i]);
                    self.scrollx.content.addChild(recordList);
                    self.scrollx.content.height = (i + 1) * 84.5;
                    recordList.setPosition(0, -(42 + i * 84));
                }
            }
            else{
                console.log("出错啦。");
            }
        });
    },

    goldCoin:function(){
        var self = this;
        this.alternateDisplay();
        var record = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            userId: cc.vv.userMgr.userId,
            moneyType: "yuanbao",
            skip: 0,
            limit: 10,
        };
        cc.vv.http.sendRequest("/get_user_game_results", record, function(obj){
            if(obj.errmsg == "ok"){
                for(var i = 0;i < obj.results.length;++i){
                    var recordList = cc.instantiate(self.itemPrefab);
                    recordList.getComponent('item').init(obj.results[i]);
                    self.scrollx.content.addChild(recordList);
                    self.scrollx.content.height = (i + 1) * 84.5;
                    recordList.setPosition(0, -(42 + i * 84));
                }
            }
            else{
                console.log("出错啦。");
            }
        });
    },

    alternateDisplay:function(){
        this.scrollx.content.removeAllChildren();
        var menubg = this.node.getChildByName("menubg");
        var roomCard = menubg.getChildByName("roomCard");
        var goldCoin = menubg.getChildByName("goldCoin");
        if(roomCard.active){
            roomCard.active = false;
            goldCoin.active = true;
            this._number.getComponent(cc.Label).string = "金币";
        }
        else{
            roomCard.active = true;
            goldCoin.active = false;
            this._number.getComponent(cc.Label).string = "元宝";
        }
    },
});
