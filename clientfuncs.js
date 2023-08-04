const { Player } = require("./gameobjects");
const { removeFromArray } = require("./utils");

let challenges = []

class ClientFuncs{
    constructor(db, SOCKET_MAP, PLAYER_MAP, version){
        this.db = db;
        this.SOCKET_MAP = SOCKET_MAP;
        this.PLAYER_MAP = PLAYER_MAP;
        this.version = version;
    }

    authenticate(msgdata, ws){
        let auth_result = {type: "authresult", data: {}};

        if(msgdata.version !== this.version){
            auth_result.data["result"] = "wrongversion";
            auth_result.data["failedreason"] = "Your version of Nihongo Online needs to be updated!";
        }
        else if(this.PLAYER_MAP.has(msgdata.username)){
            auth_result.data["result"] = "usernameinuse"
            auth_result.data["failedreason"] = "It appears that this account is already logged in.";
        }
        else if(!msgdata.username || msgdata.username.length > 32){
            auth_result.data["result"] = "invalidusername"
            auth_result.data["failedreason"] = "It appears that this username is not valid.";
        }
        else if(!msgdata.username){
            auth_result.data["result"] = "invalidusername"
            auth_result.data["failedreason"] = "It appears that this username does not exist";
        }
        else{
            //no issues, so login is valid
            auth_result.data["result"] = "authsuccess"

            this.SOCKET_MAP.set(msgdata.uid, ws);
            this.PLAYER_MAP.set(msgdata.uid, new Player(msgdata.username, ws));
        }

        return auth_result
    }

    sendBanned(ws, reason="cheating"){
        ws.send(JSON.stringify({type: "banned", data: {reason: reason}}))
    }
}

module.exports = { ClientFuncs };