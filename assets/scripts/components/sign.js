cc.Class({
    extends: cc.Component,

    properties: {
        coins: cc.Label,
        _children_moneys:null,
        _children_shad:null,
        _children_got:null,
        _btn:null,
        _gift:null,
        _alert:null,
    },

    // use this for initialization
    onLoad: function () {
        this._btn = this.node.getChildByName("btn_get");
        var child = this.node.getChildByName("LabelGroup");
        this._gift = child.children;
        this._alert = this.node.getChildByName("alert");
    },

    createSignRoom:function(){
        cc.vv.transition.active(this.node);
        var self = this;
        
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            userId: cc.vv.userMgr.userId,
        };
        cc.vv.http.sendRequest("/daily_sign_in_infos", data, function(obj){
            var gifts = obj.config.gifts;
            var childMoney = self.node.getChildByName("moneyGroup");
            self._children_moneys = childMoney.children;
            for(var i = 0;i < gifts.length;++i){        //根据服务器返回的信息，显示七天签到可以领取的物品
                self.setImage(self._children_moneys[i],gifts[i]);
                var num = self.getNumber(gifts[i]);
                var str = self.getTypeByChinaseName(gifts[i]);
                self._gift[i].getComponent(cc.Label).string = num + str;
            };

            var childShad = self.node.getChildByName("shadowGroup");
            var childGot= self.node.getChildByName("gotGroup");
            self._children_shad = childShad.children;
            self._children_got = childGot.children;
            var days = parseInt(obj.seriesNo);
            var shielding = parseInt(obj.signedNo);
            if(days != -1){
                self.setImage(self._alert.getChildByName("award"),gifts[days])
                var str = self.getTypeByChinaseName(gifts[days]);
                self.coins.string = self.getNumber(gifts[days]) + "个" + str;     //根据服务器返回的信息，显示今天可以领取的钻石或金币数量
                for(var i = 0;i < days;++i){       //根据服务器返回的信息，让已经被签到领取的物品框变灰。
                    self._children_shad[i].active = true;
                    self._children_got[i].active = true;
                }
            }
            else{        //根据服务器返回的信息，判定领取按钮可不可用
                self._btn.active = false;
                for(var i = 0;i <= shielding;++i){       //根据服务器返回的信息，让已经被签到领取的物品框变灰。
                    self._children_shad[i].active = true;
                    self._children_got[i].active = true;
                }
            };
        });
    },

    signRoomClose:function(){
        this.node.active = false;
    },

    pick:function(){
        cc.vv.transition.active(this._alert);
    },

    alertRoomClose:function(){
        this._alert.active = false;
    },

    alertReady:function(){
        var self = this;
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            userId: cc.vv.userMgr.userId,
        };
        cc.vv.http.sendRequest("/daily_sign_in", data, function(obj){
            if(obj.errmsg = "ok"){
                self._btn.active = false;
                self._alert.active = true;
                for(var i =0;i < self._children_shad.length;++i){
                    if(!self._children_shad[i].active && !self._children_got[i].active){
                        self._children_shad[i].active = true;
                        self._children_got[i].active = true;
                        return;
                    }
                }
            }
        });
    },

    getTypeByChinaseName:function(t){
        if(t.gems){
            return "钻石";
        }
        else if(t.yuanbaos){
            return "元宝";
        }
        else if(t.coins){
            return "金币";
        }
    },

    getNumber:function(t){
        if(t.gems){
            return t.gems;
        }
        else if(t.yuanbaos){
            return t.yuanbaos;
        }
        else if(t.coins){
            return t.coins;
        }
    },

    getTypeByImgName:function(t){
        if(t.gems){
            return "diamond";
        }
        else if(t.yuanbaos){
            return "gamegold";
        }
        else if(t.coins){
            return "money";
        }
    },

    setImage:function(node,t){
        var self = this;
        cc.loader.loadRes("textures/wrapper/public",cc.SpriteAtlas,function(err,atlas){
            var str = self.getTypeByImgName(t);
            var spriteframe = atlas.getSpriteFrame(str);
            
            if(!spriteframe){
                console.log("public 载入图片失败 spriteframe 为空");
                return;
            }
            node.getComponent(cc.Sprite).spriteFrame = spriteframe;
        });
    },
});
