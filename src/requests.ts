import axios from "axios";
import Device from "./device";
import { DeviceResponseJSON, LocationServiceType } from "./types";

export enum HttpMethod {
  get = "GET",
  post = "POST",
  put = "PUT",
  patch = "PATCH",
  delete = "DELETE",
}

interface ReturnResult<T> {
  items: T[];
  pageNextToken: string;
  total: number;
}

export interface DeviceMessage<T> {
  tenantId: string;
  topic: string;
  deviceId: string;
  receivedAt: string;
  message: T;
}

export interface DeviceLocation {
  deviceId: string;
  insertedAt: string;
  lat: string;
  lon: string;
  serviceType: LocationServiceType;
  type: string;
  uncertainty: string;
}

export interface Temperature {
  appId: AppId.Temp;
  data: string;
  messageType: string;
  ts?: number;
}

export interface Humidity {
  appId: AppId.Humid;
  data: string;
  messageType: string;
  ts?: number;
}

export enum AppId {
  AirPress = "AIR_PRESS",
  AirQuality = "AIR_QUAL",
  Button = "BUTTON",
  Device = "DEVICE",
  Flip = "FLIP",
  Humid = "HUMID",
  Light = "LIGHT",
  RSRP = "RSRP",
  Temp = "TEMP",

  //Location Data
  Gps = "GPS",
  CELLPOS = "CELL_POS",
  MultiCell = "MCELL",
  SingleCell = "SCELL",
  WIFI = "WIFI",
}

interface MessageParams extends Record<string, string> {
  deviceId: string;
  inclusiveStart?: string;
  exclusiveEnd?: string;
  appId?: AppId;
  pageSort?: PageSort;
}

export enum PageSort {
  Ascending = "asc",
  Descending = "desc",
}

// function parseResult(result):

namespace DeviceAPI {
  const BASE_URL = "devices";
  const inclusiveStart = "2018-06-18T19:19:45.902Z";
  const exclusiveEnd = "3000-06-20T19:19:45.902Z";

  async function makeRequest(url: string): Promise<any> {
    return axios({
      method: "GET",
      url: `${process.env.DEVICE_API_ENDPOINT}/${url}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.THINGYWORLD_API_KEY}`,
      },
    });
  }

  async function fetch<T>(url: string): Promise<ReturnResult<T>> {
    return (await makeRequest(url)).data;
  }

  async function fetchAll(
    urlStr: string,
    paginationKey: string = null
  ): Promise<any[]> {
    let items: any[] = [];
    do {
      let url = new URL(`${process.env.DEVICE_API_ENDPOINT}/${urlStr}`);

      if (paginationKey) {
        url.searchParams.append(
          "pageNextToken",
          encodeURIComponent(paginationKey)
        ); //url.searchParams is guaranteed to be there so no need for null checks
      }

      const data = await fetch(
        `${url.pathname.replace("/v1/", "")}${url.search}`
      );
      paginationKey = data.pageNextToken;

      items = items.concat(data.items);
    } while (paginationKey);
    return items;
  }

  export async function getDevices(): Promise<DeviceResponseJSON[]> {
    try {
      const devices = await fetchAll(
        `${BASE_URL}?pageLimit=100&includeState=true&includeStateMeta=true`
      );
      return devices;
    } catch (err) {
      console.error("There was an error fetching devices", err);
      return [];
    }
  }

  export function getDeviceWithData(
    deviceId: string
  ): Promise<Pick<Device, "locationData" | "environmentalData">> {
    return Promise.all([
      getLocation({ deviceId }),
      getMessages<Temperature>({
        deviceId,
        appId: AppId.Temp,
        inclusiveStart,
        exclusiveEnd,
      }),
      getMessages<Humidity>({
        deviceId,
        appId: AppId.Humid,
        inclusiveStart,
        exclusiveEnd,
      }),
    ]).then(([location, temp, humid]) => {
      const [locationResult] = location?.items;
      const [tempResult] = temp?.items;
      const [humidtyResult] = humid?.items;
      return mapToDeviceJSON(locationResult, tempResult, humidtyResult);
    });
  }

  function mapToDeviceJSON(
    locationJSON: DeviceLocation,
    tempJSON: DeviceMessage<Temperature>,
    humidJSON: DeviceMessage<Humidity>
  ): Pick<Device, "locationData" | "environmentalData"> {
    const { lat, lon, uncertainty, insertedAt, serviceType } =
      locationJSON || {};
    const { data: temperature, ts: tempTs } = tempJSON?.message || {};
    const { data: humidity, ts: humidTs } = humidJSON?.message || {};
    return {
      locationData: {
        lat: +lat,
        lng: +lon,
        uncertainty: +uncertainty,
        serviceType,
        updatedAt: insertedAt,
      },
      environmentalData: {
        temperature: +temperature,
        temperatureUpdatedAt: tempTs,
        humidity: +humidity,
        humidityUpdatedAt: humidTs,
      },
    };
  }

  function getMessages<T>(
    params: MessageParams
  ): Promise<ReturnResult<DeviceMessage<T>>> {
    return fetch(
      `messages?pageLimit=1&${new URLSearchParams(params).toString()}`
    );
  }

  export function getLocation(
    params: MessageParams
  ): Promise<ReturnResult<DeviceLocation>> {
    return fetch(
      `location/history?pageLimit=1&${new URLSearchParams(params).toString()}`
    );
  }
}

export default DeviceAPI;
