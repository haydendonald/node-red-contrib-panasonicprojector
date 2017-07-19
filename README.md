# node-red-contrib-panasonicprojector
Panasonic Network Control For Node Red


# How To Use:
Simply pass the following into the module:
### Basic Commands
**msg.command**: The command to be processed  
**msg.parameter**: The parameters(s) of the command, not required if there is none  
### Using Sub Commands
**msg.command**: The command to be processed  
**msg.subcommand**: The sub command to be processed  
**msg.parameter**: The parameter(s) of the command, not required if there is none  

## Error Codes:
**ERR1**: Undefined control command  
**ERR2**: Out of parameter range  
**ERR3**: Busy state  
**ERR4**: Timeout  
**ERR5**: Wrong data length  
**ERRA**: Password mismatch  
**ER401**: Command cannot be executed  
**ER402**: Invalid parameter  

## Commands
![Panasonic Projector Commands](https://raw.githubusercontent.com/haydendonald/node-red-contrib-panasonicprojector/master/img/commands.png)



