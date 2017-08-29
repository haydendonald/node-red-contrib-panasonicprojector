# node-red-contrib-panasonicprojector
Panasonic Network Control For Node Red


# How To Use:
Simply pass the following into the module:
### Basic Commands
**msg.payload.command**: The command to be processed  
**msg.payload.parameter**: The parameters(s) of the command, not required if there is none  
### Using Sub Commands
**msg.payload.command**: The command to be processed  
**msg.payload.subcommand**: The sub command to be processed  
**msg.payload.parameter**: The parameter(s) of the command, not required if there is none  

## Error Codes:
**ERR1**: Undefined control command  
**ERR2**: Out of parameter range  
**ERR3**: Busy state  
**ERR4**: Timeout  
**ERR5**: Wrong data length  
**ERRA**: Password mismatch  
**ER401**: Command cannot be executed  
**ER402**: Invalid parameter  
The module will also pass network connection errors on the output

## Commands
![Panasonic Projector Commands](https://raw.githubusercontent.com/haydendonald/node-red-contrib-panasonicprojector/master/img/commands.png)



