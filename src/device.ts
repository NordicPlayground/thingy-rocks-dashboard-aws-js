import {
  ConnectionStatus,
  LocationServiceType,
  DeviceResponseJSON,
  DeviceLocationJSON,
  State,
  DeviceJSON,
} from "./types";

export default class Device {
  id: string;
  name: string;
  coords: {
    lat: string | undefined;
    lng: string | undefined;
  };
  connected: ConnectionStatus;
  properties: any;
  serviceType: LocationServiceType | undefined;
  uncertainty: number | undefined;
  position: string[];
  locationUpdate: string | number;

  constructor(deviceJSON: DeviceJSON) {
    const { id, name, lat, lon, serviceType, uncertainty, insertedAt, state } =
      deviceJSON || {};
    this.id = id;
    this.name = name;
    this.coords = {
      lat: lat,
      lng: lon,
    };
    this.connected = Device.getConnection(state);
    this.properties = {
      name,
      connected: Device.getConnection(state),
    };
    this.serviceType = serviceType;
    this.uncertainty = +uncertainty;
    this.position = lat && lon ? [lat, lon] : [];
    this.locationUpdate = insertedAt;
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
