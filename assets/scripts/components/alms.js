cc.Class({
    extends: cc.Component,

    properties: {
        alert: cc.Node,
        prompting: cc.Node,
        prompting1: cc.Node,
        _timeMgr: null,

        _numsNode: null,
        _minutes: 10,
        _seconds: "",
        timeNode: [cc.Label],
        _number: null,
        _finish: null,
        _btn_get: null,
    },

    // use this for initialization
    onLoad: function () {
        this._finish = this.node.children[6].getChildByName("finish");
        this._btn_get = this.node.getChildByName("btn_get");
    },

    createAlmsClick:function(){
        cc.vv.transition.active(this.node);
        
        var self = this;
        
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
        };
        
        cc.vv.http.sendRequest("/dailyJiuJiJinInfo", data, function(obj){
            self.runTime(parseInt(obj.leftTime));
            self._number = parseInt(obj.count);
            self.timeNode[3].string = "领取次数：（" + self._number + "/3）";
            if(self._number == 3){
                self.broughtThreeTimes();
            }
        });
    },

    createAlmsClose:function(){
        this.node.active = false;
    },

    pick:function(){
        var self = this;
        var data = {
            account: cc.vv.userMgr.account,
            sign: cc.vv.userMgr.sign,
        };
        cc.vv.http.sendRequest("/getDailyJiuJiJin", data, function(obj){
            if(obj.errmsg != "ok"){
                //cc.vv.transition.active(self.alert);
            }
            else if(obj.errmsg == "ok"){
                self._number += 1;
                self.timeNode[3].string = "领取次数：（" + self._number + "/3）";
                if(self._number == 3){
                    self._btn_get.active = false;
                    self.broughtThreeTimes();
                }
                else{
                    self.runTime(parseInt(obj.config.limitTime));
                }
                var _canvas = cc.find("Canvas");
                var _hall = _canvas.getComponent("Hall");
                _hall.refreshInfo();
            }

            self.prompting.active = false;
            self.prompting1.active = false;
            if(obj.errmsg == "coins must less than 1000"){
                //self.prompting.active = true;
                cc.vv.alert.show("您持有的金币数大于1000，无法领取。");
            }
            else if(obj.errmsg == "time limit 600 seconds"){
                //self.prompting1.active = true;
                cc.vv.alert.show("领取时间在冷却，请稍后再来。");
            }
        });
    },

    createAlertClose:function(){
        this.alert.active = false;
    },

    runTime:function(timenumber){
        this._minutes = Math.floor(timenumber / 60);
        this._seconds = timenumber % 60;
        if(this._minutes < 10 && this._seconds > 10){
            this.timeNode[1].string = "0" + this._minutes;
            this.timeNode[2].string = this._seconds;
        }
        else if(this._minutes < 10 && this._seconds < 10){
            this.timeNode[1].string = "0" + this._minutes;
            this.timeNode[2].string = "0" + this._seconds;
        }
        this.schedule(this.timekeeping,1);
    },

    timekeeping:function(){
        if(this._minutes > 0){
            if(this._seconds > 10){
                this._seconds--;
                this.timeNode[2].string = this._seconds;
            }
            else if(this._seconds == 0){
                this._minutes--;
                this._seconds = 59;
                this.timeNode[1].string = "0" + this._minutes;
                this.timeNode[2].string = this._seconds;
            }
            else{
                this._seconds--;
                this.timeNode[2].string = "0" + this._seconds;
            }
        }
        else if(this._minutes == 0){
            if(this._seconds > 10){
                this._seconds--;
                this.timeNode[2].string = this._seconds;
            }
            else if(this._seconds == 0){
                this.unschedule(this.timekeeping);
            }
            else{
                this._seconds--;
                this.timeNode[2].string = "0" + this._seconds;
            }
        }
    },

    broughtThreeTimes:function(){
        this._btn_get.active = false;
        this.timeNode[1].string = "10";
        this.timeNode[2].string = "00";
        this._finish.active = true;
        for(var i = 0;i < 3;++i){
            this.timeNode[i].node.color = new cc.color(0,0,0,255);
        }
    }
});
