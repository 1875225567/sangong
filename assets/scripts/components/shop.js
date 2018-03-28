cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab:cc.Prefab,
        scrollx: cc.ScrollView,

        _url: null,
        _commodityArr: null,

        _category: null,
        _checked: null,
        _CommodityBar: null,
    },

    onLoad: function () {
        this._category = this.node.getChildByName("category");
        this._checked = this.node.getChildByName("checked");
        this._CommodityBar = this.node.getChildByName("CommodityBar");
        for(var i = 0, max = this._category.childrenCount;i < max;i += 1){
            cc.vv.utils.addClickEvent(this._category.children[i],this.node,"shop","doevent");
        }
        this.yourOwnMoney();
    },

    shopCheck:function(){
        //cc.vv.transition.active(this.node);
        this.requestSend();
    },

    requestSend:function(){
        var self = this;
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            userId: cc.vv.userMgr.userId,
        };
        cc.vv.http.sendRequest("/shop",data, function(obj){
            if(obj.errmsg = "ok"){
                if(self._commodityArr !== obj.goodTypes){
                    self._commodityArr = obj.goodTypes;
                    for(var i = 0, max = self._commodityArr.length;i < max;i += 1){
                        var _height = -100;
                        var _width = -200;
                        if(self._commodityArr[i].type == self._CommodityBar.children[i].name){
                            var scroll = self._CommodityBar.children[i].getComponent(cc.ScrollView);
                            scroll.content.removeAllChildren();
                            for(var j = 0, _max = self._commodityArr[i].items.length;j < _max;j += 1){
                                var recordList = cc.instantiate(self.itemPrefab);
                                self._url = obj.url;
                                var _type = self._commodityArr[i].type;
                                var _items = self._commodityArr[i].items[j];
                                recordList.getComponent('shopItem').init(_items,_type,_items.index);
                                recordList.name = String(_items.index);
                                scroll.content.addChild(recordList);
                                var _pay = recordList.getChildByName("button_pay");
                                cc.vv.utils.addClickEvent(_pay,self.node,"shop","afterClicking");
                                if(j != 0 && j % 3 == 0){
                                    _height += -200;
                                    _width = -200;
                                    scroll.content.height = (j / 3 + 1) * 200;
                                }
                                recordList.setPosition(_width, _height);
                                _width += 200;
                            }
                        }
                    }
                }
            }
        });
        this.node.active = true;
    },

    doevent:function(event){
        this.changeMaskStatus(event.target.name);
    },

    changeMaskStatus:function(obj){
        for(var i = 0, max = this._checked.childrenCount;i < max;i += 1){
            var _name = this._checked.children[i].name;
            if(_name == obj){
                this._checked.children[i].active = true;
                this._CommodityBar.children[i].active = true;
            }
            else{
                this._checked.children[i].active = false;
                this._CommodityBar.children[i].active = false;
            }
        }
    },

    afterClicking:function(event){
        var self = this;
        var _index = parseInt((event.target.parent.name));
        if(this._CommodityBar.children[2].active){
            var data = {
                account: cc.vv.userMgr.account,
                sign: cc.vv.userMgr.sign,
                index: _index,
            };
            cc.vv.http.sendRequest("/gems2coins",data, function(obj){
                if(obj.errmsg == "ok"){
                    self.yourOwnMoney();
                }
            });
        }
        else if(this._CommodityBar.children[0].active){
            var str = this._CommodityBar.children[0].name;
            cc.vv.anysdkMgr.openUrl(this._url + "?type=" + str + "&index=" + _index + "&userId=" + cc.vv.userMgr.userId);
        }
        else if(this._CommodityBar.children[1].active){
            var str = this._CommodityBar.children[1].name;
            cc.vv.anysdkMgr.openUrl(this._url + "?type=" + str + "&index=" + _index + "&userId=" + cc.vv.userMgr.userId);
        }
    },

    yourOwnMoney:function(){
        var _moeny = cc.find("quantityMoney/moeny/Label",this.node).getComponent(cc.Label);
        var _diamond = cc.find("quantityMoney/diamond/Label",this.node).getComponent(cc.Label);
        var _gamegold = cc.find("quantityMoney/gamegold/Label",this.node).getComponent(cc.Label);

        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    _moeny.string = cc.vv.gameNetMgr.getNumbersToString(ret.coins);
                    _diamond.string = cc.vv.gameNetMgr.getNumbersToString(ret.gems);
                    _gamegold.string = cc.vv.gameNetMgr.getNumbersToString(ret.yuanbaos);
                }
            }
        };
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },

    closeShop:function(){
        this.node.active = false;
    },
});
