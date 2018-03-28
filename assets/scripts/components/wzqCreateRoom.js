cc.Class({
    extends: cc.Component,

    properties: {
        joinRoomNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {

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
                self.node.active = false;
                cc.vv.gameNetMgr.connectGameServer(ret);
            }
        };

        var conf = null;
        conf = this.constructWZQConf();
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
            conf: JSON.stringify(conf)
        };
        console.log(data);
        cc.vv.wc.show("正在创建房间");
        cc.vv.http.sendRequest("/create_private_room", data, onCreate);
    },
    
    constructWZQConf: function () {
        var conf = {
            type:'wzq',
        };
        return conf;
    },
    

    createWZQRoomClick:function(){
        cc.vv.transition.active(this.node);
    },
    createWZQRoomClose:function(){
        this.node.active = false;
    },
    
    joinWZQGame:function(){
        cc.vv.transition.active(this.joinRoomNode);
    },

});
