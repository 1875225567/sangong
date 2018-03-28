cc.Class({
    extends: cc.Component,

    properties: {
        _numsNode: null,
        _minutes: 10,
        _seconds: "00",
        timeNode: [cc.Label],
    },

    // use this for initialization
    onLoad: function () {
        this.timeNode[1].string = "00";
        this.timeNode[2].string = "00";
    },

    runTime:function(timenumber){
        this._minutes = Math.floor(timenumber / 60);
        this._seconds = timenumber % 60;
        if(this._minutes <　10){
            this.timeNode[1].string = "0" + this._minutes;
        }
        else if(this._seconds <　10){
            this.timeNode[2].string = "0" + this._seconds;
        }
        this.schedule(this.timekeeping,1);
    },

    timekeeping:function(){
        if(this._minutes > 0){
            if(this._seconds > 9){
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
            if(this._seconds > 0){
                this._seconds--;
                this.timeNode[2].string = this._seconds;
            }
            else if(this._seconds == 0){
                this.unschedule(this.timekeeping);
                this.timeNode[1].string = "00";
                this.timeNode[2].string = "00";
            }
        }
    },
});
