module.exports = function(RED)
{
    var NtControl = require("ntcontrol-connection")

    //Main Function
    function Network(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;
        node.name = config.name;
        node.ipAddress = config.ipAddress;
        node.port = config.port;
        var username = config.username;
        var password = config.password;
        var statusCallbacks = [];
        var connected = false;
    
        const projectorConnection = new NtControl.Client(node.ipAddress, node.port, (l, m) => console.log(l + ' - ' + m));
        projectorConnection.setAuthentication(username, password);
        const projector = new NtControl.Projector(projectorConnection);
        projectorConnection.connect();
        
        projectorConnection.on("connect", function() {
            if(!connected) {
                node.updateStatus("success", "Connected");
                connected = true;
            }
        });

        projectorConnection.on("disconnect", function() {
            if(connected) {
                node.updateStatus("error", "Disconnected");
                node.warn("Panasonic Projector (" + node.ipAddress + ") Lost Connection");
                connected = false;
            }
        });

        projectorConnection.on("data", function(data) {
            console.log("DATA " + data);
        });

        projectorConnection.on("debug", function(msg) {
            if(msg.includes("Network error")) {
                node.updateStatus("error", msg);
                node.error("Panasonic Projector (" + node.ipAddress + ") Error: " + msg);
            }
        });

        projectorConnection.on("auth_error", function() {
            node.updateStatus("error", "Auth Error");
            node.error("Panasonic Projector (" + node.ipAddress + ") Authentication Error!");
        });

        //Add callbacks for status information
        node.addStatusCallback = function(func) {statusCallbacks.push(func);}
        node.updateStatus = function(color, message) {
            for(var i in statusCallbacks) {
                statusCallbacks[i](color, message);
            }
        }

        //Add basic commands that can be executed
        node.setPower = function(state) {projector.setPower(state);}
        node.setShutter = function(state) {projector.setShutter(state);}
        node.setFreeze = function(state) {projector.setFreeze(state);}
        node.getProjectorModel = function() {return projector.model;}
        node.getProjectorName = function() {return projector.name;}
        node.setInput = function(inputFriendlyName) {projector.setInput(NtControl.ProjectorInput[inputFriendlyName]);}
        node.queryRaw = function(command) {return projector.sendQuery(command);}
        node.sendRaw = function(command, value) {return projector.sendValue(NtControl[command], value);}

            // var value = undefined;
            // switch(inputFriendlyName.toUpperCase()) {
            //     case "COMPUTER1": {value = NtControl.ProjectorInput.COMPUTER1; break;}
            //     case "COMPUTER2": {value = NtControl.ProjectorInput.COMPUTER2; break;}
            //     case "VIDEO": {value = NtControl.ProjectorInput.VIDEO; break;}
            //     case "Y/C": {value = NtControl.ProjectorInput["Y/C"]; break;}
            //     case "DVI": {value = NtControl.ProjectorInput.DVI; break;}
            //     case "HDMI1": {value = NtControl.ProjectorInput.HDMI1; break;}
            //     case "HDMI2": {value = NtControl.ProjectorInput.HDMI2; break;}
            //     case "NETWORK/USB": {value = NtControl.ProjectorInput["NETWORK/USB"]; break;}
            //     case "Panasonic Application": {value = NtControl.ProjectorInput["Panasonic Application"]; break;}
            //     case "Miracast/Mirroring": {value = NtControl.ProjectorInput["Miracast/Mirroring"]; break;}
            //     case "MEMORY VIEWER": {value = NtControl.ProjectorInput["MEMORY VIEWER"]; break;}
            //     case "SDI1": {value = NtControl.ProjectorInput.SDI1; break;}
            //     case "SDI2": {value = NtControl.ProjectorInput.SDI2; break;}
            //     case "DIGITAL LINK": {value = NtControl.ProjectorInput["DIGITAL LINK"]; break;}
            //     default: {
            //         node.error("Misunderstood input: " + inputFriendlyName);
            //         return;
            //     }
          
        //}

        // projector.setPower(true);
        // projector.setShutter(true);
        // projector.setInput(NtControl.ProjectorInput.COMPUTER1);
        // projector.setFreeze(true);
        // projector.model
        // projector.name

        // projectorConnection.on("connect", () => {
        //     setTimeout(() => {
        //         pj.sendQuery(NtControl.InputSelectCommand).then(data => console.log('Got data: ' + data), err => console.log(err))
        //     }, 1000)
        // }
    }

    RED.nodes.registerType("panasonicprojector-network", Network);
}