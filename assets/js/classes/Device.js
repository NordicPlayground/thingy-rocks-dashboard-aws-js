class Device {

    constructor(data) {
        this.id = data.id;
        this.position = [];
        this.name = data.name;
        this.connected = 'disconnected';
        this.coords = {
            'lat': null,
            'lng': null,
            'readable': null
        };
        this.properties = this.getProperties(data);
        this.getGPSData();
    }

    static get dataMap () {
        return {
            Humidity: {
                appId: 'HUMID',
                unit: '%'
            },
            Temperature: {
                appId: 'TEMP',
                unit: '°C'
            }
        }
    }

    getProperties(data) {
        // old firmware uses connected field
        // new firmware uses connection field with a status key value pair
        if(
          data &&
          data.state &&
          data.state.reported
        ) {
            var isConnected_LEGACY_FIRMWARE = !!data.state.reported.connected;
            var isConnected_UPDATED_FIRMWARE = (
              data.state.reported.connection &&
              data.state.reported.connection.status === 'connected'
            );

            if (isConnected_LEGACY_FIRMWARE || isConnected_UPDATED_FIRMWARE) {
                this.connected = 'connected';
            }
        }

        return {
            name: this.name,
            connected: this.connected
        }
    }

    getGPSData() {
        var call = getAjaxSettings("https://api.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceIdentifiers=" + this.id + "&pageLimit=1&pageSort=desc&appId=GPS", false);
        var device = this;
        $.ajax(call).done(function(response) {
            if (
              response &&
              response.items &&
              response.items[0] &&
              response.items[0].message &&
              response.items[0].message.data
            ) {
                var gpsData = response.items[0].message.data;
                var gpsArray = gpsData.split(',');
                // process latitude
                var lat_degrees = parseFloat(gpsArray[2].substr(gpsArray[2].indexOf('.') - 2)) / 60 + parseFloat(gpsArray[2].substr(0, gpsArray[2].indexOf('.') - 2));
                var lat_multiplier = gpsArray[3] == 'N' ? 1 : -1;

                var lat = lat_degrees * lat_multiplier;
                var lat_readable = lat_degrees.toFixed(3);
                // process longitude
                var lng_degrees = parseFloat(gpsArray[4].substr(gpsArray[4].indexOf('.') - 2)) / 60 + parseFloat(gpsArray[4].substr(0, gpsArray[4].indexOf('.') - 2));
                var lng_multiplier = gpsArray[5] == 'E' ? 1 : -1;

                var lng = lng_degrees * lng_multiplier;
                var lng_readable = lng.toFixed(3);

                var gps_readout = lat_readable + '° ' + gpsArray[3] + ', ' + lng_readable + '° ' + gpsArray[5];

                device.coords.readable = gps_readout;
                device.coords.lat = lat;
                device.coords.lng = lng;

                device.position = [
                    lat,
                    lng
                ];
                device.gps = device.coords;
            }

            return device;
        })
    }

}
