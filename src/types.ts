export enum ConnectionStatus {
  Connected = "connected",
  Disconnted = "disconnected",
}

export enum LocationServiceType {
  GPS = "GPS",
}

export interface DeviceResponseJSON {
  id: string;
  name: string;
  state: State;
}

export interface State {
  desired: any;
  reported: ReportedState;
}

export interface ReportedState extends State {
  connected: boolean;
  genericInfo: {
    platform: {
      name: string;
      version: string;
    };
    versions: {
      gateway: string;
      library: string;
    };
  };
  device?: DeviceInfo;
  connection: {
    status: ConnectionStatus;
    disconnectReason: DisconnectReason;
    clientInitiatedDisconnect: boolean;
    keepalive: number;
  };
  config?: DeviceConfig;
}

export enum DisconnectReason {
  AuthError = "AUTH_ERROR",
  ClientInitiatedDisconnect = "CLIENT_INITIATED_DISCONNECT",
  ClientError = "CLIENT_ERROR",
  ConnectionLost = "CONNECTION_LOST",
  DuplicateClientID = "DUPLICATE_CLIENTID",
  ForbiddenAccess = "FORBIDDEN_ACCESS",
  MQTTKeepAliveTimeout = "MQTT_KEEP_ALIVE_TIMEOUT",
  ServerError = "SERVER_ERROR",
  ServerInitiatedDisconnect = "SERVER_INITIATED_DISCONNECT",
  Throttled = "THROTTLED",
  WebsocketTTLExpiration = "WEBSOCKET_TTL_EXPIRATION",
}

enum FotaType {
  App = "APP",
  Boot = "BOOT",
  Modem = "MODEM",
  BLE = "BLE",
  Bootloader = "BOOTLOADER",
  SoftDevice = "SOFTDEVICE",
}

export type Services = {
  serviceInfo: {
    ui: string[];
    fota_v2: FotaType[];
    fota_v2_ble: boolean;
  };
};
export type DeviceProperties = { [key: string]: any };
export type DeviceInfo = { [key: string]: DeviceProperties } & Services; // Map of device fields names and properties
export type DeviceConfig = { [key: string]: DeviceProperties };

export interface DeviceLocationJSON {
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
}

export type DeviceJSON = DeviceResponseJSON & DeviceLocationJSON;
