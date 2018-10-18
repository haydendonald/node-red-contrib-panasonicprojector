var crypto = require('crypto');
module.exports = function(RED)
{

    //Main function
    function Network(config)
    {
        RED.nodes.createNode(this, config);
        this.ipAddress = config.ipAddress;
        this.port = config.port;
        this.deviceId = config.deviceId;
        this.server = require("./tcp.js");
        this.nodes = [];
        this.projectorId = config.projectorId;
        this.username = config.username;
        this.password = config.password;
        this.md5Hash;
        this.link = function link(node) {
            this.nodes.push(node);
        }
        var network = this;

        //Inital connection
        sendStatus(network, "yellow", "Attempting connection...");
        network.server.connect(network.port, network.ipAddress, function(){
            sendStatus(network, "yellow", "Handshake");
            network.server.addOnce("data", function(data) {
                network.md5Hash = handShake(data, network.ipAddress, network.port, network.username, network.password);
                if(network.md5Hash === undefined || network.md5Hash === null) {
                    sendStatus(network, "red", "Internal Error");
                    RED.log.error("Misunderstood Handshake, Check User");
                }
                else {
                    sendStatus(network, "green", "Connected!");
                }
            });
        });

        //Add the error callback
        network.server.setErrorCallback(function(error, description) {
            var nodeText = "";
            var errorText = "";
            switch(error) {
                case "socket": nodeText = "Socket Error"; errorText = "Socket Error: " + description; break;
                case "cannot send": nodeText = "Cannot Send"; errorText = "Not Connected Cannot Send!"; break;
                default: nodeText = "Unknown Error"; errorText = "Unknown Error: " + error + ", " + description; break;
            }

            RED.log.error(errorText.toString());
            sendStatus(network, "red", nodeText.toString());
        });
      
		//When the flows are stopped
        this.on("close", function() {
        });
    }

    //Add the node
    RED.nodes.registerType("panasonic-projector", Network);
}

//Hand shake with the projector and get unique id
function handShake(data, ipAddress, port, username, password)
{
    //Get in the request, checking that it's correct as well as getting the random number
    var randomNumber = new Buffer(8);
    if(data[0] != 0x4E){return;}
    if(data[1] != 0x54){return;}
    if(data[2] != 0x43){return;}
    if(data[3] != 0x4F){return;}
    if(data[4] != 0x4E){return;}
    if(data[5] != 0x54){return;}
    if(data[6] != 0x52){return;}
    if(data[7] != 0x4F){return;}
    if(data[8] != 0x4C){return;}
    if(data[9] != 0x20){return;}
    if(data[10] != 0x31){return;}
    if(data[11] != 0x20){return;}
    for(i = 0; i < 8; i++) {
        randomNumber.writeInt8(data[12 + i], 0 + i);
    }
    if(data[20] != 0x0d){return;}

    return crypto.createHash('md5').update(username + ":" + password + ":" + randomNumber).digest("hex");
}

//Send out the message to all the nodes
function sendMsg(network, msg) {
    for(var i = 0; i < network.nodes.length; i++) {
        network.nodes[i].send(msg);
    }
}

//Send status to each node
function sendStatus(network, color, nodeText) {
    for(var i = 0; i < network.nodes.length; i++) {
        network.nodes[i].status({fill:color,shape:"dot",text:nodeText});
    }
}