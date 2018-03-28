cc.Class({
    extends: cc.Component,

    properties: {
        one: cc.Node,
        ten: cc.Node,
        _tenPrize: [],
    },

    onLoad: function () {
    },

    getAPrize:function(data){
        this.one.active = true;
        var self = this;
        //var element = this.dialsNode.children[i];
        var str = this.getTypeByChinaseName(data);
        var num = this.getNumber(data);
        var child = this.one.getChildByName("props");
        child.getChildByName("New Label").getComponent(cc.Label).string = num + "个" + str;

        cc.loader.loadRes("textures/wrapper/public",cc.SpriteAtlas,function(err,atlas){
            var sprite = self.getTypeByImgName(data);
            var frame = atlas.getSpriteFrame(sprite);
            child.getChildByName("award").getComponent(cc.Sprite).spriteFrame = frame;
        });
    },

    arrNumber:function(data){
        this._tenPrize.push(data);
    },

    getTenPrizes:function(node){
        this.ten.active = true;
        this.createAlertClick(node);

        var self = this;
        //var element = this.dialsNode.children[i];
        for(var i = 0;i < this._tenPrize.length; ++i){
            var str = this.getTypeByChinaseName(this._tenPrize[i]);
            var num = this.getNumber(this._tenPrize[i]);
            var child = this.ten.children[i];
            child.getChildByName("New Label").getComponent(cc.Label).string = num + "个" + str;

            var award = child.getChildByName("award");
            this.setImage(award,this._tenPrize[i]);
            if(i == 9){
                this._tenPrize = [];
            }
        };
    },

    showTenPresents:function(award,element,data){
        var self = this;
        //var element = this.dialsNode.children[i];
        var str = this.getTypeByChinaseName(data);
        var num = this.getNumber(data);
        element.string = num + "个" + str;

        cc.loader.loadRes("textures/wrapper/public",cc.SpriteAtlas,function(err,atlas){
            var sprite = self.getTypeByImgName(data);
            var frame = atlas.getSpriteFrame(sprite);
            award.getComponent(cc.Sprite).spriteFrame = frame;
        });
    },

    createAlertClick:function(node){
        cc.vv.transition.active(this.node);
        node.active = false;
    },

    createAlertClose:function(){
        this.node.active = false;
        this.one.active = false;
        this.ten.active = false;
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
