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
        node.NtControl = require("ntcontrol-connection");
    
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

        node.projectorConnection.on("debug", function(msg) {
            if(msg.includes("Network error")) {
                node.updateStatus("error", msg);
                node.error("Panasonic Projector (" + node.ipAddress + ") Error: " + msg);
                node.connected = false;
            }
        });

        node.projectorConnection.on("auth_error", function() {
            node.updateStatus("error", "Auth Error");
            node.error("Panasonic Projector (" + node.ipAddress + ") Authentication Error!");
            node.connected = false;
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
        node.findCommand = function(command) {return node.NtControl[command];}
        node.sendRaw = function(command, value) {return node.projector.sendValue(command, value);}
        node.findInput = function(input) {
            for(var i in this.NtControl.ProjectorInput){
                if(this.NtControl.ProjectorInput[i] == input || i == input){return {"friendly": i, "input": this.NtControl.ProjectorInput[i]}}
            }
            return {"friendly": "unknown", "input": ""};
        }
    }

    RED.nodes.registerType("panasonicprojector-network", Network);
}