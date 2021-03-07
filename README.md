# homebridge-tools
[Homebridge](https://homebridge.io) plugin for SR201 relay.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Usage
Add the following content to your config.json:
````
{
  "accessory": "SR201Relay",
  "name": "My SR201 Relay",
  "address": "192.168.1.100",
  "index": 1
}
````
with:
* *accessory*: set to "SR201Relay"
* *name*: your module name
* *address*: the ip address of the module
* *index*: the relay you wish to manage on your module (starting from 1)


## Licensing
This project is licensed under the MIT license.
