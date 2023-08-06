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
        let auth_result = {type: "auth_result", data: {}};

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
            console.log("Player logged in as " + msgdata.username)

            this.SOCKET_MAP.set(msgdata.uid, ws);
            this.PLAYER_MAP.set(msgdata.uid, new Player(msgdata.uid, msgdata.username, ws));
        }

        return auth_result
    }

    playerUpdate(msgdata){
        let playerobj = this.PLAYER_MAP.get(msgdata.uid)
        if(playerobj){
            //set new player data
            playerobj.state = msgdata.state
            playerobj.facingdir = msgdata.facingdir
            playerobj.curpos = msgdata.curpos
            playerobj.speech = msgdata.speech

            //make message data
            let worldupdatedata = {
                type: "world_update",
                data: {listofplayers: []}
            }

            //add players to message
            this.PLAYER_MAP.forEach((p) => {
                if(p.uid !== msgdata.uid){
                    worldupdatedata.data.listofplayers.push({
                        uid: p.uid,
                        state: p.state,
                        facingdir: p.facingdir,
                        curpos: p.curpos,
                        speech: p.speech
                    })
                }
            })

            return worldupdatedata

        }else{
            console.log("!!!player tried to update player data however player obj doesn't exist!!!")
            console.log([...this.PLAYER_MAP.entries()])
            return false
        }
    }

    sendBanned(ws, reason="cheating"){
        ws.send(JSON.stringify({type: "banned", data: {reason: reason}}))
    }
}

module.exports = { ClientFuncs };