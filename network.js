module.exports = function(RED)
{
    //Main Function
    function Network(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on("input", function(msg) {});
    }

    RED.nodes.registerType("panasonicprojector-network", Network);
}