class Device {
  constructor(deviceJSON, locationDataJSON) {
    this.id = deviceJSON.id;
    this.name = deviceJSON.name;
    this.connected = "disconnected";
    this.coords = {
      lat: null,
      lng: null,
    };
    this.properties = this.getProperties(deviceJSON);

    const deviceLat = +locationDataJSON.lat || undefined;
    const deviceLon = +locationDataJSON.lon || undefined;

    this.coords.lat = deviceLat;
    this.coords.lng = deviceLon;
    this.serviceType = locationDataJSON.serviceType || "GPS";
    this.uncertainty = +locationDataJSON.uncertainty;

    if (deviceLat && deviceLon) {
      this.position = [deviceLat, deviceLon];
    } else {
      this.position = [];
    }

    this.locationUpdate = locationDataJSON.insertedAt || "N/A";
    this.gps = this.coords;
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
}
