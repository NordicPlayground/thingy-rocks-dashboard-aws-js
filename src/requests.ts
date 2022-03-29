import axios from "axios";
import { DeviceResponseJSON } from "./types";

export enum HttpMethod {
  get = "GET",
  post = "POST",
  put = "PUT",
  patch = "PATCH",
  delete = "DELETE",
}

export interface DeviceMessage {
  tenantId: string;
  topic: string;
  deviceId: string;
  receivedAt: string;
  message: unknown;
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
  inclusiveStart: string;
  exclusiveEnd?: string;
  appId?: AppId;
  pageSort?: PageSort;
}

export enum PageSort {
  Ascending = "asc",
  Descending = "desc",
}

namespace DeviceAPI {
  const BASE_URL = "devices";

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

  async function fetch(url: string): Promise<any> {
    return (await makeRequest(url)).data;
  }

  async function fetchAll(
    urlStr: string,
    paginationKey: string = null
  ): Promise<any[]> {
    let items: any[] = [];
    do {
      //Instead of trying to create a URL the hard way, let's use the built-in tools
      console.log("expecting endpoint", process.env.DEVICE_API_ENDPOINT);
      let url = new URL(`${process.env.DEVICE_API_ENDPOINT}/${urlStr}`);

      if (paginationKey) {
        url.searchParams.append("pageNextToken", paginationKey); //url.searchParams is guaranteed to be there so no need for null checks
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

  function getMessages(params: MessageParams): Promise<DeviceMessage[]> {
    return fetchAll(
      `messages?pageLimit=100&${new URLSearchParams(params).toString()}`
    );
  }

  export function getLocations(params: MessageParams): Promise<Location[]> {
    return fetchAll(
      `location/history?pageLimit=100&${new URLSearchParams(params).toString()}`
    );
  }
}

export default DeviceAPI;
