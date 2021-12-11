class Device {
  constructor(data) {
    this.id = data.id;
    this.position = [];
    this.name = data.name;
    this.connected = "disconnected";
    this.coords = {
      lat: null,
      lng: null,
    };
    this.serviceType = "";
    this.uncertainty = null;
    this.properties = this.getProperties(data);
    this.getLocationData();
  }

  static get dataMap() {
    return {
      Humidity: {
        appId: "HUMID",
        unit: "%",
      },
      Temperature: {
        appId: "TEMP",
        unit: "°C",
      },
    };
  }

  getProperties(data) {
    // old firmware uses connected field
    // new firmware uses connection field with a status key value pair
    if (data && data.state && data.state.reported) {
      var isConnected_LEGACY_FIRMWARE = !!data.state.reported.connected;
      var isConnected_UPDATED_FIRMWARE =
        data.state.reported.connection &&
        data.state.reported.connection.status === "connected";

      if (isConnected_LEGACY_FIRMWARE || isConnected_UPDATED_FIRMWARE) {
        this.connected = "connected";
      }
    }

    return {
      name: this.name,
      connected: this.connected,
    };
  }

  getLocationData() {
    var call = getAjaxSettings(
      "https://api.nrfcloud.com/v1/location/history?deviceId=" +
        this.id +
        "&pageLimit=1",
      false
    );
    var device = this;
    $.ajax(call).done(function (response) {
      const deviceLocationHistoryResult =
        response && response.items && response.items[0];
      if (deviceLocationHistoryResult) {
        const deviceLat = +deviceLocationHistoryResult.lat || undefined;
        const deviceLon = +deviceLocationHistoryResult.lon || undefined;
        device.coords.lat = deviceLat;
        device.coords.lng = deviceLon;
        device.serviceType = deviceLocationHistoryResult.serviceType || "N/A";
        device.uncertainty = +deviceLocationHistoryResult.uncertainty;
        device.position = [deviceLat, deviceLon];
        device.locationUpdate = deviceLocationHistoryResult.insertedAt || "N/A";
        device.gps = device.coords;
      }
      return device;
    });
  }
}
