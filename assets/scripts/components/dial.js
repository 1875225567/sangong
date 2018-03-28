cc.Class({
    extends: cc.Component,

    properties: {
        dialsNode:cc.Node,
        _gift:[],
        alert: cc.Node,
        _prizeMgr: null,
        _prizeGift: null,
        _medium: null,
        _shadow: null,
        _unclaimed: null,
        _indialbg: null,
        _requestData: null,
        _raffle:[],
    },

    // use this for initialization
    onLoad: function () {
        this._gift = [{t:0,n:50},{t:2,n:1000},{t:1,n:10},{t:0,n:10},{t:1,n:30},{t:2,n:500},
            {t:0,n:100},{t:1,n:15},{t:2,n:5},{t:0,n:5},{t:1,n:500},{t:2,n:5}];
        this._prizeMgr = this.alert.getComponent("prize");
        this._shadow = this.node.getChildByName("shadow1");
        var temp = this.node.getChildByName("unclaimed");
        this._unclaimed = temp.children;
        this._indialbg = this.node.getChildByName("indialbg");

        this._requestData = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
        };

        this.initDialGift();
    },

    initDialGift:function(){
        var self = this;
        cc.vv.http.sendRequest("/chouJiangInfo", this._requestData, function(data){
            if(data.errmsg == "ok"){
                self._raffle = data.gifts;
                for (var i = 0; i < self.dialsNode.childrenCount; i++) {
                    var element = self.dialsNode.children[i];
                    var award = element.getChildByName("award");
                    self.setImage(award,self._raffle[i]);
                    var str = self.getTypeByChinaseName(self._raffle[i]);
                    var num = self.getTypeByNumber(self._raffle[i]);
                    element.getChildByName("New Label").getComponent(cc.Label).string = num + "个" + str;
                }
            }
        });
    },
    dialCheck:function(){
        cc.vv.transition.active(this.node);
    },
    dialClose:function(){
        this.node.active = false;
    },
    lottoOneTimes:function(){
        var basicCircle = 2;
        var self = this;
        cc.vv.http.sendRequest("/chouJiang", this._requestData, function(obj){
            if(obj.errmsg == "ok"){
                self._indialbg.active = false;
                self._shadow.active = true;
                var giftIndex = parseInt(obj.giftIndex) + 1;
                var circleNums = basicCircle * self.dialsNode.childrenCount + giftIndex;
                self.circleAction(circleNums);
                self._prizeGift = obj.gift;
                self._prizeMgr.getAPrize(self._prizeGift);
            }
            else{
                cc.vv.alert.show("无法抽奖");
            }
        });
    },
    lottoTenTimes:function(){
        this._gift = [];
        this.sendTenCircle();
    },
    circleAction:function(circleNums){
        var self = this;
        this._medium = circleNums - 1;
        for (var i = 0; i < circleNums ; i++) {
            setTimeout(function(i) {
                self.setWinningLight(i);
            }, i*50,i);
        }
    },

    sendTenCircle:function(){
        var self = this;
        cc.vv.http.sendRequest("/chouJiang", this._requestData, function(obj){
            if(obj.errmsg == "ok"){
                var _data = {
                    gift:obj.gift,
                    giftindex:parseInt(obj.giftIndex)+1
                }
                self._gift.push(_data);
                if(self._gift.length >= 10){
                    self.tenCircleAction(0,9);
                }
                else{
                    self.sendTenCircle();
                }
            }
            else{
                cc.vv.alert.show("无法抽奖");
            }
        });

    },
    tenCircleAction:function(nowc,maxc){
        var self = this;
        this._indialbg.active = false;
        this._shadow.active = true;
        this._prizeGift = this._gift[nowc].gift;
        this._prizeMgr.arrNumber(this._prizeGift);
        var giftIndex = this._gift[nowc].giftindex;
        var circleNums = /*3 * this.dialsNode.childrenCount + */giftIndex;
        for (var i = 0; i <= circleNums ; i++) {
            //var element = this.dialsNode.children[i%this.dialsNode.childrenCount];
            setTimeout(function(i) {
                if(i>=circleNums){
                    if(nowc < maxc){
                        nowc++;
                        setTimeout(function() {
                            self.tenCircleAction(nowc,maxc);
                        }, 1000);
                        self.tenSmallGifts();
                    }
                    else{
                        console.log("十连抽完毕");
                        self.tenSmallGifts();
                        setTimeout(function() {
                            self._prizeMgr.getTenPrizes(self._shadow);
                            self._indialbg.active = true;
                            for(var i = 0;i < self._unclaimed.length;++i){
                                self._unclaimed[i].active = false;
                            }
                        },500);
                    }
                }else{
                    self.setWinningLight(i);
                }
            }, i*50,i);
        }
    },

    tenSmallGifts:function(obj){
        for(var i = 0;i < this._unclaimed.length;++i){
            if(!this._unclaimed[i].active){
                this._unclaimed[i].active = true;
                var award = this._unclaimed[i].getChildByName("award");
                var element = this._unclaimed[i].getChildByName("New Label").getComponent(cc.Label);
                this._prizeMgr.showTenPresents(award,element,this._prizeGift);
                break;
            }
        }
    },

    setWinningLight:function(circleinindex){
        for (var i = 0; i < this.dialsNode.childrenCount; i++) {
            var element = this.dialsNode.children[i];
            this.setWinningLightSpriteFrame(element,circleinindex,i);
        }
    },
    setWinningLightSpriteFrame:function(element,circleinindex,i){
        var self = this;
        cc.loader.loadRes("textures/wrapper/dial",cc.SpriteAtlas,function(err,atlas){
            var sprite = null;
            if (circleinindex%self.dialsNode.childrenCount == i) {
                sprite = atlas.getSpriteFrame("gamepropsbg2");
                if(self.alert.getChildByName('one').active){
                    if(circleinindex == self._medium){
                        setTimeout(function() {
                            self._prizeMgr.createAlertClick(self._shadow);
                            self._indialbg.active = true;
                        },500);
                    }
                }
            }
            else{
                sprite = atlas.getSpriteFrame("gamepropsbg1");
            }
            element.getChildByName("img").getComponent(cc.Sprite).spriteFrame = sprite;
        });
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
    getTypeByNumber:function(t){
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
    setImage:function(node,t){
        var self = this;
        cc.loader.loadRes("textures/wrapper/public",cc.SpriteAtlas,function(err,atlas){
            var str = self.getTypeByImgName(t);
            var spriteframe = atlas.getSpriteFrame(str);
            
            if(!spriteframe){
                console.log("dial 载入图片失败 spriteframe 为空");
                return;
            }
            node.getComponent(cc.Sprite).spriteFrame = spriteframe;
        });
    },

});
