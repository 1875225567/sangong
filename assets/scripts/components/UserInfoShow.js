cc.Class({
    extends: cc.Component,

    properties: {
        _userinfo:null,
        _outUserBtnNode:null,
        _userId:0,
    },

    // use this for initialization
    onLoad: function () {
        if(cc.vv == null){
            return;
        }
        
        this._userinfo = cc.find("Canvas/userinfo");
        this._userinfo.active = false;
        //cc.vv.utils.addClickEvent(this._userinfo,this.node,"UserInfoShow","onClicked");
        var close = cc.find("Canvas/userinfo/close");
        cc.vv.utils.addClickEvent(close,this.node,"UserInfoShow","onClicked");

        this._outUserBtnNode = cc.find("Canvas/userinfo/btnoutuser");
        if(cc.director.getScene().name == "hall"){
            this._outUserBtnNode.active = false;
        }
        else{
            cc.vv.utils.addClickEvent(this._outUserBtnNode,this.node,"UserInfoShow","OutUser");
        }
        
        cc.vv.userinfoShow = this;
    },
    
    show:function(name,userId,gems,coins,yuanbaos,iconSprite,sex,ip){
        this._userId = userId;
        if(this._userId != null && this._userId > 0){
            cc.vv.transition.active(this._userinfo);
            this._userinfo.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = iconSprite.spriteFrame;
            this._userinfo.getChildByName("name").getComponent(cc.Label).string = name;
            this._userinfo.getChildByName("id").getComponent(cc.Label).string = "ID: " + this._userId;

            var _diamond = cc.find("diamond/Label",this._userinfo).getComponent(cc.Label);
            var _gamegold = cc.find("gamegold/Label",this._userinfo).getComponent(cc.Label);
            var _money = cc.find("money/Label",this._userinfo).getComponent(cc.Label);
            _diamond.string = cc.vv.gameNetMgr.getNumbersToString(gems);
            _money.string = cc.vv.gameNetMgr.getNumbersToString(coins);
            _gamegold.string = cc.vv.gameNetMgr.getNumbersToString(yuanbaos);
            
            if(cc.vv.gameNetMgr.conf.type != "sangong"){
                this._outUserBtnNode.active = false;
            }
/*             var sex_female = this._userinfo.getChildByName("sex_female");
            sex_female.active = false;
            
            var sex_male = this._userinfo.getChildByName("sex_male");
            sex_male.active = false;
            
            if(sex == 1){
                sex_male.active = true;
            }   
            else if(sex == 2){
                sex_female.active = true;
            } */
        }
    },
    
    onClicked:function(data){
        this._userinfo.active = false;
    },

    OutUser:function(){
        if(this._userId != 0){
            if(cc.vv.userMgr.userId == cc.vv.gameNetMgr.conf.creator){
                if(this._userId != cc.vv.userMgr.userId){
                    cc.vv.net.send("kick",this._userId);
                    this._userinfo.active = false;
                    for(var i = 0;i < cc.vv.gameNetMgr.seats.length;++i){
                        if(cc.vv.gameNetMgr.seats[i].seatUserId == this._userId){
                            var SGRoom = this.node.getComponent("SGRoom");
                            SGRoom.leaveSeat(this._userId); //cc.vv.gameNetMgr.seats[i].seatIndex
                        }
                    }
                }
                else{
                    cc.vv.alert.show("不能踢自己");
                }
            }
            else{
                cc.vv.alert.show("只有房主才能踢人");
            }
        }
    },
});
