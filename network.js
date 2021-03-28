module.exports = function(RED)
{
    //Main Function
    function Network(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;
        node.name = config.name;
        node.ipAddress = config.ipAddress;
        node.port = config.port;
        node.username = config.username;
        node.password = config.password;
        node.statusCallbacks = [];
        node.connected = false;
        node.NtControl = require("ntcontrol-connection")
    
        node.projectorConnection = new node.NtControl.Client(node.ipAddress, node.port, (l, m) => console.log(l + ' - ' + m));
        node.projectorConnection.setAuthentication(node.username, node.password);
        node.projector = new node.NtControl.Projector(node.projectorConnection);
        node.projectorConnection.connect();
        
        node.projectorConnection.on("connect", function() {
            if(!node.connected) {
                node.updateStatus("success", "Connected");
                node.connected = true;
            }
        });

        node.projectorConnection.on("disconnect", function() {
            if(node.connected) {
                node.updateStatus("error", "Disconnected");
                node.warn("Panasonic Projector (" + node.ipAddress + ") Lost Connection");
                node.connected = false;
            }
        });

        node.projectorConnection.on("data", function(data) {
            console.log("DATA " + data);
        });

        node.projectorConnection.on("debug", function(msg) {
            if(msg.includes("Network error")) {
                node.updateStatus("error", msg);
                node.error("Panasonic Projector (" + node.ipAddress + ") Error: " + msg);
            }
        });

        node.projectorConnection.on("auth_error", function() {
            node.updateStatus("error", "Auth Error");
            node.error("Panasonic Projector (" + node.ipAddress + ") Authentication Error!");
        });

        //Add callbacks for status information
        node.addStatusCallback = function(func) {node.statusCallbacks.push(func);}
        node.updateStatus = function(color, message) {
            for(var i in node.statusCallbacks) {
                node.statusCallbacks[i](color, message);
            }
        }

        //Add basic commands that can be executed
        node.setPower = function(state) {node.projector.setPower(state);}
        node.setShutter = function(state) {node.projector.setShutter(state);}
        node.setFreeze = function(state) {node.projector.setFreeze(state);}
        node.getProjectorModel = function() {return node.projector.model;}
        node.getProjectorName = function() {return node.projector.name;}
        node.setInput = function(inputFriendlyName) {node.projector.setInput(node.NtControl.ProjectorInput[inputFriendlyName]);}
        node.queryRaw = function(command) {return node.projector.sendQuery(command);}
        node.sendRaw = function(command, value) {return node.projector.sendValue(node.NtControl[command], value);}

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