class Player {
    constructor(uid, username, ws){
        this.uid = uid;
        this.username = username;
        this.ws = ws;
        this.curpos = [400,400];
        this.state = "idle";
        this.facingdir = "down"
        this.speech = ""
    }
}

module.exports = {Player}