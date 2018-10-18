module.exports = function(RED)
{
    //Main Function
    function Command(config)
    {
        RED.nodes.createNode(this, config);
        var network = RED.nodes.getNode(config.network);
        var command = config.command;
        var parameter = config.parameter;
        var node = this;

        network.link(node);
        node.on("close", function() {
            network.server.close();
        });

        node.on("input", function(msg) {
            if(msg.payload.command !== undefined && msg.payload.command !== null){command = msg.payload.command;}
            if(msg.payload.parameter !== undefined && msg.payload.parameter !== null){parameter = msg.payload.parameter;}

            if(command === undefined || command === null){node.status({fill:"yellow",shape:"dot",text:"Command Invalid"});}
            if(parameter === undefined || parameter === null){parameter = "";}

            network.server.send(generateData(command, parameter, network.projectorId, network.md5Hash),
                function(success){
                    if(success) {
                        node.status({fill:"green",shape:"dot",text:"Sent!"});
                    }
                    else {
                        node.error(node, "An error occured while sending the command, please check your connection");
                        node.status({fill:"red",shape:"dot",text:"Could not send"});
                    }
                },
                function(response) {
                    var data = getData(response);
                    if(data !== false) {
                        var msg = {
                            "payload":{
                                "command":command,
                                "parameter":""+data,
                                "raw":[command, data]
                            }
                        }
                        return node.send(msg);
                    }
                    return true;
                });
            });
    }
    RED.nodes.registerType("panasonic-command", Command);
}


//Send the data
function generateData(command, parameter, projectorId, md5Hash) 
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
    return buffer;
}

//Return the data, returns false if failed, true if successful, and data if there is any
function getData(data)
{
    if(data[0] !== 0x30){return false;}
    if(data[1] !== 0x30){return false;}
    
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

//Show an error
function showError(node, errorShort, errorLong) {
    node.error(errorLong);
    node.status({fill:"red",shape:"dot",text:errorShort});
}