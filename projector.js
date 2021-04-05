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

        //When we get an input on the node validate it and translate
        this.on("input", function(msg) {
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

            //if(!projector.connected) {node.error("We cannot send the command cause we're not connected"); sendErrorMsg("Not connected"); return;}

            //Switch the action to be performed
            switch(msg.payload.action) {
                case "set": {
                    if(msg.payload.value === undefined){node.error("There was no value given! Cannot execute"); return;}

                    //Switch the command
                    switch(msg.payload.command) {
                        case "PowerCommand": {node.projector.setPower(msg.payload.value); break;}
                        case "ShutterCommand": {node.projector.setShutter(msg.payload.value); break;}
                        case "FreezeCommand": {node.projector.setFreeze(msg.payload.value); break;}
                        case "InputSelectCommand": {node.projector.setInput(msg.payload.value); break;}
                        default: {
                            //Raw command handler
                            node.projector.sendRaw(msg.payload.command, msg.payload.value).then(
                                function(data) {
                                    node.sendMessage({
                                        "topic": "response",
                                        "payload": {
                                            "command": msg.payload.command,
                                            "value": data
                                        }
                                    });
                                },
                                function(error) { //Probably need a handler to show command not found here
                                    sendErrorMsg(error);
                                }
                            );
                            break;
                        }
                    }
                    break;
                }
                case "get": {
                    var result = node.projector.queryRaw(msg.payload.command);
                    if(typeof result != "string") {
                        result.then(function(data) {
                            node.sendMessage({
                                "topic": "response",
                                "payload": {
                                    "command": msg.payload.command,
                                    "value": data
                                }
                            });
                        });
                    }
                    else {
                        sendErrorMsg(result);
                    } 
                    break;
                }
                default: {
                    node.warn("Misunderstood action: " + msg.payload.command);
                }
            }
        });

    }

    RED.nodes.registerType("panasonicprojector-projector", Projector);
}