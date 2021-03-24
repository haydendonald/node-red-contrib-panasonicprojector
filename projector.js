module.exports = function(RED)
{
    //Main Function
    function Projector(config)
    {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on("input", function(msg) {});
    }

    RED.nodes.registerType("panasonicprojector-projector", Projector);
}