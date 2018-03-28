cc.Class({
    extends: cc.Component,

    properties: {
        menuBtn:cc.Node,
        _menubg:null,
        saveType:0,
        _money:null,
        _gamegold:null,
        _coinsNode:null,
        _coinsbankNode:null,
        _editboxNode:null,
        _coinsimgNode:null,
        _gamegoldimgNode:null,
    },

    // use this for initialization
    onLoad: function () {
        this._menubg = cc.find("Canvas/bank/menubg");
        if(this._menubg){
            cc.vv.utils.addClickEvent(this._menubg,this.node,"Bank","checkMenuButton");
        }

        this._gamegold = cc.find("Canvas/bank/juxingbj/gamegold");
        this._money = cc.find("Canvas/bank/juxingbj/money");
        this._gamegold.active = false;
        this._money.active = true;
        
        this._coinsNode = cc.find("Canvas/bank/bankinfo/mymoney");
        this._coinsbankNode = cc.find("Canvas/bank/bankinfo/bankmoney");
        this._editboxNode = cc.find("Canvas/bank/bankinfo/New Node/EditBox")
        this.saveType = 0;

        this._coinsimgNode = cc.find("Canvas/bank/bankinfo/New Node/money");
        this._coinsimgNode.active = true;
        this._gamegoldimgNode = cc.find("Canvas/bank/bankinfo/New Node/gamegold");
        this._gamegoldimgNode.active = false;

        this.setViewByCoins();
        // this.refreshInfo();
        this.initEventHandlers();
    },
    initEventHandlers:function(){
        var self = this;
        cc.vv.net.addHandler('bank_savecoins_notify_push',function(data){
            console.log("bank_savecoins_notify_push:"+ data);
            if(data.err){
                cc.vv.alert.show("错误的数量");
                return;
            }
            cc.vv.userMgr.coins = data.coins;
            cc.vv.userMgr.bankcoins = data.coinsbank;
            self.setViewByCoins();
        });
        cc.vv.net.addHandler('bank_drawcoins_notify_push',function(data){
            console.log("bank_drawcoins_notify_push:"+ data);
            if(data.err){
                cc.vv.alert.show("错误的数量");
                return;
            }
            cc.vv.userMgr.coins = data.coins;
            cc.vv.userMgr.bankcoins = data.coinsbank;
            self.setViewByCoins();
        });
        cc.vv.net.addHandler('bank_saveyuanbaos_notify_push',function(data){
            console.log("bank_saveyuanbaos_notify_push:"+ data);
            if(data.err){
                cc.vv.alert.show("错误的数量");
                return;
            }
            cc.vv.userMgr.gamegold = data.yuanbaos;
            cc.vv.userMgr.bankgamegold = data.yuanbaosbank;
            self.setViewByGamegold();
        });
        cc.vv.net.addHandler('bank_drawyuanbaos_notify_push',function(data){
            console.log("bank_drawyuanbaos_notify_push:"+ data);
            if(data.err){
                cc.vv.alert.show("错误的数量");
                return;
            }
            cc.vv.userMgr.gamegold = data.yuanbaos;
            cc.vv.userMgr.bankgamegold = data.yuanbaosbank;
            self.setViewByGamegold();
        });
    },

    checkMenuButton:function(event){

        if(this.menuBtn.x == 120){
            this.menuBtn.x = -120;
            this.saveType = 0;
            this._gamegold.active = false;
            this._money.active = true;
            this._coinsimgNode.active = true;
            this._gamegoldimgNode.active = false;
        }
        else if(this.menuBtn.x == -120){
            this.menuBtn.x = 120;
            this.saveType = 1;
            this._gamegold.active = true;
            this._money.active = false;
            this._coinsimgNode.active = false;
            this._gamegoldimgNode.active = true;
        }
        this.setViewByMoney();
    },

    bankCheck:function(){
        cc.vv.transition.active(this.node);
        this.menuBtn.x = -120;
        this.saveType = 0;
        this._gamegold.active = false;
        this._money.active = true;
        this._coinsimgNode.active = true;
        this._gamegoldimgNode.active = false;
        this.setViewByCoins();

    },

    closeBank:function(){
        this.node.active = false;
    },

    refreshInfo:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    cc.vv.userMgr.coins = ret.coins;
                    cc.vv.userMgr.bankcoins = ret.coinsbank;
                    cc.vv.userMgr.gamegold = ret.yuanbaos;
                    cc.vv.userMgr.bankgamegold = ret.yuanbaosbank;
                    this.setViewByMoney();
                }
            }
        };
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },

    setViewByMoney:function(){
        if(!this._coinsNode){
            this._coinsNode = cc.find("Canvas/bank/bankinfo/mymoney");
        }
        if(!this._coinsbankNode){
            this._coinsbankNode = cc.find("Canvas/bank/bankinfo/bankmoney");
        }
        
        if(this.saveType == 0){
            this._coinsNode.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.coins);
            this._coinsbankNode.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.bankcoins);
        }
        else{
            this._coinsNode.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.gamegold);
            this._coinsbankNode.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.bankgamegold);
        }
    },

    setViewByCoins:function(){
        if(!this._coinsNode){
            this._coinsNode = cc.find("Canvas/bank/bankinfo/mymoney");
        }
        else if(!this._coinsbankNode){
            this._coinsbankNode = cc.find("Canvas/bank/bankinfo/bankmoney");
        }
        this._coinsNode.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.coins);
        this._coinsbankNode.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.bankcoins);
    },

    setViewByGamegold:function(){
        if(!this._coinsbankNode){
            this._coinsbankNode = cc.find("Canvas/bank/bankinfo/bankmoney");
        }
        else if(!this._coinsbankNode){
            this._coinsbankNode = cc.find("Canvas/bank/bankinfo/bankmoney");
        }
        this._coinsNode.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.gamegold);
        this._coinsbankNode.getComponent(cc.Label).string = cc.vv.gameNetMgr.getNumbersToString(cc.vv.userMgr.bankgamegold);
    },
                    

    saveMoney:function(){
        var str = this._editboxNode.getComponent(cc.EditBox).string;
        if(this.reNumber(str)){
            if(this.saveType == 0){
                this.coinsSave(str);
            }
            else{
                this.gamegoldSave(str);
            }
        }
    },

    drawMoney:function(){
        var str = this._editboxNode.getComponent(cc.EditBox).string;
        if(this.reNumber(str)){
            if(this.saveType == 0){
                this.coinsDraw(str);
            }
            else{
                this.gamegoldDraw(str);
            }
        }
    },

    coinsSave:function(money){
        if(cc.director.getScene().name == "sggame"){
            cc.vv.net.send("bank_save_coins",money);
        }
        else{
            this.sendRequire("bank_save_coins",money);
        }
    },
    coinsDraw:function(money){
        if(cc.director.getScene().name == "sggame"){
            cc.vv.net.send("bank_draw_coins",money);
        }
        else{
            this.sendRequire("bank_draw_coins",money);
        }
    },
    gamegoldSave:function(money){
        if(cc.director.getScene().name == "sggame"){
            cc.vv.net.send("bank_save_yuanbaos",money);
        }
        else{
            this.sendRequire("bank_save_yuanbaos",money);
        }
    },
    gamegoldDraw:function(money){
        if(cc.director.getScene().name == "sggame"){
            cc.vv.net.send("bank_draw_yuanbaos",money);
        }
        else{
            this.sendRequire("bank_draw_yuanbaos",money);
        }
    },

    sendRequire:function(command,_money){
        var onGet = function(ret){
            if(!ret.err){
                console.log("成功");
                this.refreshInfo()
            }
        };
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            userId:cc.vv.userMgr.userId,
            money:_money,
        }
        if(data){
            cc.vv.http.sendRequest("/"+command,data,onGet.bind(this));
            console.log("http:"+command);
        }
    },

    reNumber:function(string){
        var reText =  /^[0-9]+$/;
        if(string){
            if(reText.test(string)){
                console.log("正确的字符串");
                return true;
            }
            else{
                console.log("错误的字符串");
                return false;
            }
        }
    }
});
