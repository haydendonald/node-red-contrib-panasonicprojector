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
## Get Commands
The following commands are supported for using ```action="get"```
* ```name``` The name of the projector
* ```model``` The model of the projector
* ```<<rawCommand>>``` Will set a raw command value. See [here](https://github.com/peschuster/ntcontrol-connection/blob/master/src/Commands.ts) for more information. Where ```rawCommand``` is the command name for instance ```ModelNameCommand```

### Example
```
{
    "payload": {
        "action": "get",
        "command": "name"
    }
}
```

## Set Commands
The following commands are supported for using ```action="set"```
* ```power``` Sets the power state of the projector.
    * true/false
* ```shutter``` Sets the shutter state of the projector.
    * true/false
* ```freeze``` Sets the freeze state of the projector.
    * true/false
* ```input``` Sets the input on the projector
    * COMPUTER1
    * COMPUTER2
    * VIDEO
    * Y/C
    * DVI
    * HDMI1
    * HDMI2
    * NETWORK/USB
    * Panasonic Application
    * Miracast/Mirroring
    * MEMORY VIEWER
    * SDI1
    * SDI2
    * DIGITAL LINK
* ```<<rawCommand>>``` Will set a raw command value. See [here](https://github.com/peschuster/ntcontrol-connection/blob/master/src/Commands.ts) for more information. Where ```rawCommand``` is the command name for instance ```ModelNameCommand```

### Example
```
{
    "payload": {
        "action": "set",
        "command": "power",
        "value": true //boolean
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