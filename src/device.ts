import {
  ConnectionStatus,
  LocationServiceType,
  State,
  DeviceJSON,
} from "./types";

export default class Device {
  id: string;
  name: string;
  connected: ConnectionStatus;
  locationData: {
    lat: number;
    lng: number;
    uncertainty: number;
    serviceType: LocationServiceType;
    updatedAt: string | number;
  };
  environmentalData: {
    temperature: number;
    temperatureUpdatedAt: number;
    humidity: number;
    humidityUpdatedAt: number;
  };

  constructor(deviceJSON: DeviceJSON) {
    const { id, name, state } = deviceJSON || {};
    const { lat, lng, serviceType, uncertainty, updatedAt } =
      deviceJSON?.locationData || {};
    const { temperature, humidity, humidityUpdatedAt, temperatureUpdatedAt } =
      deviceJSON?.environmentalData || {};

    this.id = id;
    this.name = name;
    this.connected = Device.getConnection(state);
    this.locationData = {
      lat: lat,
      lng: lng,
      uncertainty,
      serviceType,
      updatedAt,
    };
    this.environmentalData = {
      temperature,
      temperatureUpdatedAt,
      humidity,
      humidityUpdatedAt,
    };
  }

  static fromDeviceJSON(rawDeviceJSON: any): Device {
    return new Device(rawDeviceJSON);
  }

  static getConnection(deviceJSONState: State): ConnectionStatus {
    if (deviceJSONState?.reported) {
      const isConnected_LEGACY_FIRMWARE = !!deviceJSONState?.reported
        ?.connected;
      const isConnected_UPDATED_FIRMWARE =
        deviceJSONState?.reported?.connection?.status ===
        ConnectionStatus.Connected;

      if (isConnected_LEGACY_FIRMWARE || isConnected_UPDATED_FIRMWARE) {
        return ConnectionStatus.Connected;
      }
    }
    return ConnectionStatus.Disconnted;
  }
}
