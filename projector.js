const { DefaultStringConverter, NumberConverter } = require("ntcontrol-connection");
const { GenericCommand } = require("ntcontrol-connection/dist/GenericCommands");

module.exports = function(RED)
{
    //Main Function
    function Projector(config)
    {
        RED.nodes.createNode(this, config);

        //var name = config.name;
        var node = this;
        node.projector = RED.nodes.getNode(config.network);
        
        //Add a callback to show status on this node
        node.projector.addStatusCallback(function(state, message) {
            switch(state) {
                case "success": {
                    node.status({fill:"green",shape:"dot",text:message});
                    node.sendMessage({
                        "topic": "information",
                        "payload": {
                            "type": "success",
                            "message": message
                        }
                    });
                    break;
                }
                case "error": {
                    node.status({fill:"red",shape:"dot",text:message});
                    node.sendMessage({
                        "topic": "information",
                        "payload": {
                            "type": "error",
                            "message": message
                        }
                    });
                    break;
                }
            }
        });

        //The msg output handler. We also add some information about the projector
        node.sendMessage = function(msg) {
            msg.projector = {
                "nodered": {
                    "projectorName": node.projector.name,
                    "nodeName": node.name
                },
                "projectorInformation": {
                    "name": node.projector.getProjectorName(),
                    "model": node.projector.getProjectorModel(),
                    "ipAddress": node.projector.ipAddress
                }
            }
            node.send(msg);
        }

        node.handleMsg = function(msg) {
            var sendErrorMsg = function(error) {
                node.sendMessage({
                    "topic": "information",
                    "payload": {
                        "type": "sendError",
                        "message": error
                    }
                });
            }

            if(msg.payload === undefined){node.error("There was no payload given! Cannot execute"); sendErrorMsg("No payload given"); return;}
            if(msg.payload.action === undefined){node.error("There was no action given! Cannot execute"); sendErrorMsg("No action given"); return;}
            if(msg.payload.command === undefined){node.error("There was no command given! Cannot execute"); sendErrorMsg("No command given"); return;}
            var command = msg.payload.command;
            switch(msg.payload.command) {
                case "name": {
                    command = "ProjectorNameCommand";
                    break;
                }
                case "model": {
                    command = "ModelNameCommand";
                    break;
                }
                case "power": {
                    command = "PowerCommand";
                    break;
                }
                case "freeze": {
                    command = "FreezeCommand";
                    break;
                }
                case "shutter": {
                    command = "ShutterCommand";
                    break;
                }
                case "input": {
                    command = "InputSelectCommand";
                    break;
                }
                case "lampStatus": {
                    command = "LampStatusCommand";
                    break;
                }
                case "lampControl": {
                    command = "LampControlStatusCommand";
                    break;
                }
            }

            var sendResponse = function(data, cmd) {
                if(data !== undefined) {
                    node.sendMessage({
                        "topic": "response",
                        "payload": {
                            "command": msg.payload.command,
                            "value": data
                        }
                    });
                }
            }
            var responseCallback = function(data, cmd){sendResponse(data, cmd);}

            //Switch the action to be performed
            switch(msg.payload.action) {
                case "set": {
                    var cmd = node.projector.findCommand(command);

                    if(msg.payload.value === undefined){node.error("There was no value given! Cannot execute"); return;}
                    var value = msg.payload.value;

                    switch(msg.payload.command) {
                        case "power": {
                            responseCallback = function(data) {
                                switch(data){
                                    case "PON": {sendResponse(true); break;}
                                    case "POF": {sendResponse(false); break;}
                                    default: {sendResponse(data); break;}
                                }
                                
                            }
                            break;
                        }
                        case "freeze":
                        case "shutter": {
                            responseCallback = function(data, cmd) {
                                sendResponse(data.replace(cmd.setCommand + cmd.setOperator, "") == "1");
                            }
                            break;
                        }
                        case "input": {
                            value = node.projector.findInput(value).input;
                            responseCallback = function(data, cmd) {
                                sendResponse(node.projector.findInput(data.replace(cmd.setCommand + cmd.setOperator, "")).friendly);
                            }
                            break;
                        }
                    }

                    //Raw command handling
                    if(command == "raw") {
                        console.log("TODO");
                        return;
                    }

                   //Execute it
                   if(cmd !== undefined) {
                       node.projector.sendRaw(cmd, value).then(
                           //Call the get command again so we have our handlers
                            function(data) {
                                responseCallback(data, cmd);
                            },
                           function(error) {sendErrorMsg("Error occurred sending command: " + command + ", " + error)});
                   }
                   else {
                       sendErrorMsg("Could not find command: " + command);
                   }

                    break;
                }
                case "get": {
                    var cmd = node.projector.findCommand(command);

                    //Supported commands
                    switch(msg.payload.command) {
                        case "power": {
                            responseCallback = function(data) {
                                var value = data;
                                if(data == "001") {value = true;}
                                else if(data == "000"){value = false;}
                                sendResponse(value);
                            }
                            break;
                        }
                        case "freeze":
                        case "shutter": {
                            responseCallback = function(data) {
                                var value = data;
                                if(data == "1") {value = true;}
                                else if(data == "0"){value = false;}
                                sendResponse(value);
                            }
                            break;
                        }
                        case "lampControl": {
                            responseCallback = function(data) {
                                var value = data;
                                switch(data) {
                                    case "0": {value = "off"; break;}
                                    case "1": {value = "warming"; break;}
                                    case "2": {value = "on"; break;}
                                    case "3": {value = "cooling"; break;}
                                }
                                sendResponse(value);
                            }
                            break;
                        }
                        case "input": {
                            responseCallback = function(data) {
                                sendResponse(node.projector.findInput(data).friendly);
                            }
                            break;
                        }
                        case "lampHours": {
                            cmd = new GenericCommand("$L:0", "LampHours", new NumberConverter(0, 9999));
                            console.log(cmd);
                            break;
                        }
                    }

                    //Raw command handling
                    if(command == "raw") {

                        return;
                    }

                    //Execute it
                    if(cmd !== undefined) {
                        node.projector.queryRaw(cmd).then(
                            function(data) {responseCallback(data);},
                            function(error) {sendErrorMsg("Error occurred sending command: " + command + ", " + error)});
                    }
                    else {
                        sendErrorMsg("Could not find command: " + command);
                    }
                    break;
                }
                default: {
                    node.warn("Misunderstood action: " + msg.payload.command);
                }
            }
        }

        //When we get an input on the node validate it and translate
        this.on("input", node.handleMsg);

    }

    RED.nodes.registerType("panasonicprojector-projector", Projector);
}