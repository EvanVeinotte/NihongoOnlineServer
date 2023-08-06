const Websocket = require('ws');
const { MongoClient } = require('mongodb');

const { ClientFuncs } = require('./clientfuncs');
const { getKeyByValue, removeFromArray} = require('./utils');

const VERSION = "0.0.1";

const PORT = 4421;

const MONGODB_NAME = "NihongoOnline"

const wss = new Websocket.Server({port: PORT});

const mongo_url = "mongodb://127.0.0.1:27017/";

var PLAYER_MAP = new Map();

var SOCKET_MAP = new Map();

MongoClient.connect(mongo_url, async (err, client) => {

    if(err) throw err;
    var db = client.db(MONGODB_NAME);

    var CF = new ClientFuncs(db, SOCKET_MAP, PLAYER_MAP, VERSION);

    console.log(`running WebSocket Server on port ${PORT}`);

    wss.on('connection', async function(ws) {
        ws.isAlive = true

        ws.on('pong', () => {
            ws.isAlive = true
        })

        ws.on('message', async function(message){
            
            let msg = JSON.parse(message);

            //check what type the message is here
            if(msg.type === "guest_login"){
                let auth_result = CF.authenticate(msg.data, ws);
                ws.send(JSON.stringify(auth_result));
            }
            else if(msg.type === "player_update"){
                let update_result = CF.playerUpdate(msg.data);
                if(update_result){
                    ws.send(JSON.stringify(update_result));
                }
            }
        });


        //handle when the user disconnects
        ws.on('close', (code, reason) => {
            closeWS(ws, code)
        });
    });

    //ping the client every 30 seconds
    setInterval(async () => {
        wss.clients.forEach(function each(ws){
            if(ws.isAlive === false){
                //run the close function
                closeWS(ws, "strange disconnect")
                return ws.terminate()
            }else{
                ws.isAlive = false
                ws.ping()
            }

        })
    }, 30000)

    function closeWS(ws, code){
        let uid = getKeyByValue(SOCKET_MAP, ws)
            if(uid){

                SOCKET_MAP.delete(uid)

                if(PLAYER_MAP.has(uid)){
                    PLAYER_MAP.delete(uid);
                }

                console.log(`user ${uid} disconnected with code ${code}`);

            }
            else{
                console.log(`unknown user disconnected with code ${code}`)
            }
    }

});