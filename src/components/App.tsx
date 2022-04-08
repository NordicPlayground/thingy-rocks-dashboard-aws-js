import * as React from "react";
import "./App.scss";

import SideBar from "./SideBar";
import InfoBox from "./InfoBox";
import WorldMap from "./WorldMap";
import NordicTab from "./NordicTab";
import DeviceAPI from "../requests";
import Device from "../device";

export function ThingyWorld() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  // selectedDevice

  React.useEffect(() => {
    DeviceAPI.getDevices().then((devices) => {
      setDevices(devices.map((d) => Device.fromDeviceJSON(d)));
    });
  }, []);

  // Load devices onto the globe asyncronously
  // ---> Make Device component
  // ---> pass in devices and selected device
  // Load devices onto the the sidebar asyncrounously
  // ---> pass in devices and selected device
  return (
    <>
      <SideBar />
      <WorldMap />
      <InfoBox />
      <NordicTab />
    </>
  );
}
