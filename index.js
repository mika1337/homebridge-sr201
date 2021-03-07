'use strict'

let Service, Characteristic

module.exports = (homebridge) => {
  /* this is the starting point for the plugin where we register the accessory */
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-sr201', 'SR201Relay', SwitchAccessory)
}

class SwitchAccessory
{
  constructor (log, config)
  {

    /*
     * The constructor function is called when the plugin is registered.
     * log is a function that can be used to log output to the homebridge console
     * config is an object that contains the config for this plugin that was defined the homebridge config.json
     */

    this.log = log
    this.config = config

    this.index   = parseInt(this.config.index);
    if ( (this.index < 1) || this.index > 8 )
    {
        log('index parameter must be within [1;8], value is: ' + this.index);
        return;
    }

    this.address = this.config.address;
    this.port    = 6722;

    /*
     * A HomeKit accessory can have many "services". This will create our base service,
     * Service types are defined in this code: https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js
     * Search for "* Service" to tab through each available service type.
     * Take note of the available "Required" and "Optional" Characteristics for the service you are creating
     */
    this.service = new Service.Switch(this.config.name)

  }

  getServices ()
  {
    /*
     * The getServices function is called by Homebridge and should return an array of Services this accessory is exposing.
     * It is also where we bootstrap the plugin to tell Homebridge which function to use for which action.
     */

     /* Create a new information service. This just tells HomeKit about our accessory. */
    const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'No idea')
        .setCharacteristic(Characteristic.Model, 'SR201')
        .setCharacteristic(Characteristic.SerialNumber, 'Unspecified')

    /*
     * For each of the service characteristics we need to register setters and getter functions
     * 'get' is called when HomeKit wants to retrieve the current state of the characteristic
     * 'set' is called when HomeKit wants to update the value of the characteristic
     */
    this.service.getCharacteristic(Characteristic.On)
      .on('get', this.getOnCharacteristicHandler.bind(this))
      .on('set', this.setOnCharacteristicHandler.bind(this))

    /* Return both the main service (this.service) and the informationService */
    return [informationService, this.service]
  }

  setOnCharacteristicHandler (value, callback)
  {
    let log   = this.log;
    let index = this.index;

    log('Connecting to '+this.address+':'+this.port);
    var Net = require('net');
    var client = new Net.Socket();
    client.connect( this.port, this.address,
        function()
        {
            log('TCP connection established, setting state');
            var cmd = '2';
            if ( value == true )
            {
                cmd = '1';
            }
            client.write(`${cmd}${index}`);
        }
    );
    client.on('data',
        function(data)
        {
            log('Data received: '+data);
            client.destroy();
            var state = false;
            if ( String.fromCharCode(data[index-1]) == '1' )
            {
                state = true;
            }

            if ( value == state )
            {
                log('Success setting state');
                /*
                 * The callback function should be called to return the value
                 * The first argument in the function should be null unless and error occured
                 */
                callback(null);    
            }
            else
            {
                log('Failed to set state');
                callback('Failed to set state');
            }
        }
    );
    client.on('close',
        function()
        {
            log('TCP connection closed');
        }
    );
    client.on('error',
        function(ex)
        {
            log('TCP connection error: '+ex);
            callback(ex);
        }
    );
  }

  getOnCharacteristicHandler (callback) {
    let log   = this.log;
    let index = this.index;

    log('Connecting to '+this.address+':'+this.port);
    var Net = require('net');
    var client = new Net.Socket();
    client.connect( this.port, this.address,
        function()
        {
            log('TCP connection established, requesting state');
            client.write(`0${index}`);
        }
    );
    client.on('data',
        function(data)
        {
            log('Data received: '+data);
            client.destroy();
            var state = false;
            if ( String.fromCharCode(data[index-1]) == '1' )
            {
                state = true;
            }
            log('Read state: '+state);

            /*
             * The callback function should be called to return the value
             * The first argument in the function should be null unless and error occured
             * The second argument in the function should be the current value of the characteristic
             */
            callback(null,state);
        }
    );
    client.on('close',
        function()
        {
            log('TCP connection closed');
        }
    );
    client.on('error',
        function(ex)
        {
            log('TCP connection error: '+ex);
            callback(ex,null);
        }
    );
  }
}

