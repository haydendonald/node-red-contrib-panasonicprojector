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

# Message Payloads
Coming :)

# Version History
## 3.0.0 (Major Update)
- Message format has been updated, this is a big change to anything before version 3.0
- Moved the project to use [ntcontrol-connection](https://github.com/peschuster/ntcontrol-connection) by peschuster