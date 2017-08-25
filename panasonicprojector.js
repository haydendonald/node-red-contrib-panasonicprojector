var crypto = require('crypto');
var debug = require('debug')('node-red-contrib-panasonicprojector');
var tcp = require('net');
var eventEmitter = require("events");
var timeoutPeriod = 500;
class EventEmitter extends eventEmitter{}
module.exports = function(RED)
{
    //Main Function
    function PanasonicProjector(config)
    {
        const emitter = new EventEmitter();
        RED.nodes.createNode(this, config);
        var projectorId = config.projectorId;
        var ipAddress = config.ipAddress;
        var port = config.port;
        var username = config.username;
        var password = config.password;
        var server = new tcp.Socket();
        var node = this;
        var md5Hash;

        server.on("close", function()
        {
            server.destroy();
        });
		
		server.on("error", function(error)
		{
			RED.log.error("Socket Error: " + error);
            node.status({fill:"red",shape:"dot",text:"Internal Error, Check Debug"}); 
            msg = {"payload":{}};
            msg.payload.response = error;
		});

        //When a request is received on the input
        this.on("input", function(msg) {
           if(typeof msg.payload.ipAddress === "string") {
                ipAddress = msg.payload.ipAddress;
            }
            if(typeof msg.payload.port === "string") {
                port = msg.payload.port;
            }
            if(typeof msg.payload.username === "string") {
                username = msg.payload.username;
            }
           if(typeof msg.payload.password === "string") {
                password = msg.payload.password;
            }
           if(typeof msg.payload.projectorId === "string") {
                projectorId = msg.payload.projectorId;
            }

            var done = false;
            handShake(server, emitter, ipAddress, port, username, password, function(state, description, md5)
            {
                switch(state) {
                    case "handshakesuccess":
                        md5Hash = md5;
                        var command = msg.payload.command;
                        var subcommand = msg.payload.subcommand;
                        var parameter = msg.payload.parameter;

                        //Check
                        if(!command){
                            node.status({fill:"yellow",shape:"dot",text:"No msg.payload.command Parameter"});   
                            return;
                        }

                        if(!parameter){parameter = "";}
                        
                        //If there is a subcommand
                        if(subcommand){
                            var tempParameter = subcommand + "E" + parameter; 
                            sendData(command, tempParameter, server, username, password, projectorId, md5Hash);
                        }
                        else {
                            sendData(command, parameter, server, username, password, projectorId, md5Hash);
                        }

                        //Response handler
                        var handler = function(data) {
                            var data = getData(data, command);
                            if(data != "error") {
                                if(data.includes("ER")){
                                    if(data != "ER401") {
                                    RED.log.error("An Error Occurred: Error Returned " + data);
                                    node.status({fill:"red",shape:"dot",text:"Error: " + data}); 
                                    }
                                    else {
                                        node.status({fill:"yellow",shape:"dot",text:"Returned Cannot Execute"}); 
                                    }
                                }
                                else {
                                    node.status({fill:"green",shape:"dot",text:"Sent!"}); 
                                }
                                msg.payload.response = data.toString('utf8');
                                //Return the data and disconnect
                                server.removeListener("data", handler);
                                server.destroy();
                                node.send(msg);
                                done = true;
                            }
                            else {
                                RED.log.error("An Error Occurred: Unexpected Response");
                                node.status({fill:"red",shape:"dot",text:"Error: Unexpected Response"}); 
                                done = true;
                            }
                        };
                        server.on("data", handler);

                        //Timeout
                        setTimeout(function() {
                            if(!done) {
                                RED.log.error("An Error Occurred While Waiting For A Response: Timeout");
                                node.status({fill:"red",shape:"dot",text:"Error: Timeout"}); 
                                server.removeListener("data", handler);
                                server.destroy();  
                            }                      
                        }, timeoutPeriod);
                }
            });
        });
    }

    RED.nodes.registerType("panasonicprojector-panasonicprojector", PanasonicProjector);
}

//Return the data, returns false if failed, true if successful, and data if there is any
function getData(data, expectedCommand)
{
    if(!data[0] == 0x30){return false;}
    if(!data[1] == 0x30){return false;}
    
    //If there is data return it, else return true
    if (data.length - 3 > 0) {
        var returnData = new Buffer(data.length - 3);
        for(i = 0; i < data.length - 3; i++) {
            returnData[i] = data[2 + i];
        }
        return returnData;
    }
    else {
        return "error";
    }
}

//Send the data
function sendData(command, parameter, server, username, password, projectorId, md5Hash) 
{
    var hashValue = new Buffer(md5Hash);
    var start = new Buffer(7);
    start.writeUInt8(0x30, 0);
    start.writeUInt8(0x30, 1);
    start.write("A", 2);
    start.write("D", 3);
    start.write(projectorId[0].toUpperCase(), 4);
    start.write(projectorId[1].toUpperCase(), 5);
    start.writeUInt8(0x3b, 6);

    var commandBuff = new Buffer(command);
    var parameterBuff = new Buffer(parameter);

    var endBit = new Buffer(1);
    endBit.writeUInt8(0x0d, 0);

    if(parameter != "") {
        var buffer = Buffer.concat([hashValue, start, commandBuff, new Buffer(":"), parameterBuff, endBit]);
    }
    else {
        var buffer = Buffer.concat([hashValue, start, commandBuff, endBit]);
    }
    server.write(buffer);
}

//Hand shake with the projector
function handShake(server, emitter, ipAddress, port, username, password, callback)
{
    server.connect(port, ipAddress);

    var processHandshakeData = function(data) 
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

        emitter.emit("generate32ByteHash", randomNumber);
    }
    server.once("data", processHandshakeData);

    //Got a correct response, generate and reply
    emitter.once("generate32ByteHash", function(randomNumber) {
        emitter.emit("connection", "handshakesuccess", "", crypto.createHash('md5').update(username + ":" + password + ":" + randomNumber).digest("hex"));
    });

    emitter.once("connection", callback);
}