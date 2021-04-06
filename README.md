# Panasonic Projector Control for NodeRed
This project allows interfacing with a panasonic projector using the NTControl protocol provided by [ntcontrol-connection](https://github.com/peschuster/ntcontrol-connection) by peschuster.

# Work in progress!
This project is currently being converted to use ntcontrol-connection as the previous implementation was developed when i had limited knowledge and isn't amazingly reliable.

The aims of moving to ntcontrol-connection is to provide better control of multiple projectors as well as more functionality.

# Node Information
## Panasonic Projector Node
This node is what takes input and output of messages
### Fields
- ```Name``` the name shown in the flow
- ```Projector``` the projector to control. See below

## Panasonic Network Node
This node is responsible for handling the network portion of a projector. This node defines a projector
### Fields
- ```Name``` the name shown in the flow
- ```IP Address``` is the IP Address of the projector to be controlled
- ```Port``` is the port. Default is ```1024```
- ```User``` is the username for authentication. Default is ```admin1```
- ```Password``` is the password for authentication. Default is ```panasonic1```

# Input Message
The following is the basic syntax of a message to be sent to the node
```
{
    "payload": {
        "action": "set/get", // Should we set the value or get the value
        "command": "", // The command to be executed
        "value": "" // The value to set (Not required for action=get)
    }
}
```

## Commands
The following commands are supported for using ```action="get"```
* ```name (get)``` The name of the projector
* ```model (get)``` The model of the projector
* ```power (get/set)``` The current power status of the projector
    * ```true/false```
* ```freeze (get/set)``` The freeze status
* ```shutter (get/set)``` The shutter status
* ```input (get/set)``` The input of the projector
    * See [here](https://github.com/peschuster/ntcontrol-connection/blob/master/src/Types.ts) for input names
* ```lampStatus (get)``` The current status of the lamp(s)
* ```lampControl (get)``` The current lamp control status of the lamp(s)
    * ```off``` Lamp is off
    * ```warming``` Lamp is warming up
    * ```on``` Lamp is at full intensity
    * ```cooling``` Lamp is cooling down
* ```raw``` Sends a raw command see [here](https://na.panasonic.com/ns/265897_rz570_rz575_command_en_ja.pdf) for raw commands (Not supported yet)
* It is also possible to send direct commands supported by ntcontrol-connection, see [here](https://github.com/peschuster/ntcontrol-connection/blob/master/src/Commands.ts) for more information. Where ```command``` is the command name for instance ```ModelNameCommand```

### Example
```
//Get payload
{
    "payload": {
        "action": "get",
        "command": "power"
    }
}

//Set payload
{
    "payload": {
        "action": "set",
        "command": "power",
        "value": true
    }
}
```

# Output Message
## Response Message
This message relays information about the node status. For example the connection states
```
{
    "topic": "information",
    "payload": {
        "type": "The type of information message",
        "message": "The message of the information."
    }
}
```


## Information Message
This message relays responses sent from the projector
```
{
    "topic": "response",
    "payload": {
        "command": "The command",
        "value": "The value"
    }
}
```

# Version History
## 3.0.0 (Major Update)
- Message format has been updated, this is a big change to anything before version 3.0
- Moved the project to use [ntcontrol-connection](https://github.com/peschuster/ntcontrol-connection) by peschuster