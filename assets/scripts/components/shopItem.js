cc.Class({
    extends: cc.Component,

    properties: {
        _btn_pay: null,
    },

    onLoad: function () {
        this._btn_pay = this.node.getChildByName("button_pay");
    },

    init:function(obj,str,index){
        var productName = this.node.getChildByName("productName").getComponent(cc.Label);
        var commodityPrices = this.node.getChildByName("commodityPrices").getComponent(cc.Label);
        var commodity = this.node.getChildByName("commodity");
        if(str == "gamegold"){
            productName.string = obj.gamegold + "个元宝";
            commodityPrices.string = obj.price + "元";
        }
        else if(str == "gems"){
            productName.string = obj.gems + "个钻石";
            commodityPrices.string = obj.price + "元";
        }
        else if(str == "gems2coins"){
            productName.string = obj.coins + "个元宝";
            commodityPrices.string = obj.price + "钻石";
        }
        this.setImage(commodity,str,index);
    },


    getTypeByImgName:function(t,index){
        if(t == "gems"){
            return "diamond" + index;
        }
        else if(t == "gems2coins"){
            return "gamegold" + index;
        }
        else if(t == "gamegold"){
            return "gamegold" + index;
        }
    },

    setImage:function(node,t,index){
        var self = this;
        cc.loader.loadRes("textures/wrapper/shop",cc.SpriteAtlas,function(err,atlas){
            var str = self.getTypeByImgName(t,index);
            var spriteframe = atlas.getSpriteFrame(str);
            
            if(!spriteframe){
                console.log("public 载入图片失败 spriteframe 为空");
                return;
            }
            node.getComponent(cc.Sprite).spriteFrame = spriteframe;
        });
    },
});
