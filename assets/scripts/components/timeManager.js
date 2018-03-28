cc.Class({
    extends: cc.Component,

    properties: {
        _numsNode:null,
        _nums:0,
        _stateNode:null,
        timeNode:cc.Node,
        _boole:false,
    },

    // use this for initialization
    onLoad: function () {
        this._numsNode = this.timeNode.getChildByName("number");
        this.timeNode.active = false;
        this._stateNode = this.timeNode.getChildByName("stateNode");
        this._stateNode.active = false;
    },

    runTime:function(timenumber){
        this._nums = timenumber;
        this._numsNode.getComponent(cc.Label).string = this._nums;
        this.timeNode.active = true;
        this.getStateStr();
        console.log("runtime :" + timenumber);
        this.schedule(this.timekeeping,1);
    },

    timekeeping:function(){
        this._numsNode.getComponent(cc.Label).string = this._nums;
        if(this._nums === 5){
            this.example(false, this._nums);
        }
        if(this._nums <= 0){
            this.unschedule(this.timekeeping);
            this.timeNode.active = false;
        }
        else{
            this._nums--;
        }
    },

    getStateStr:function(){
        var self = this;
        this._stateNode.active = true;
        var state = cc.vv.gameNetMgr.gamestate;
        var stateStr = "showcard";
        if(state == "idle" || state == "showResult"){
            stateStr = "result"
        }
        else if(state == "stake"){
            stateStr = "stake"
        }
        else if(state == "turnOverCard" || state == "showCard"){
            stateStr = "showcard"
        }

        cc.loader.loadRes("textures/wrapper/state/"+stateStr,cc.SpriteFrame,function(err,spriteFrame){
            self._stateNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    },

    example:function(boole, index){
        if(boole){
            this._boole = boole;
        }
        if(this._boole && index === 5){
            cc.vv.audioMgr.playSFX("countdown.mp3");
            this._boole = boole;
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
