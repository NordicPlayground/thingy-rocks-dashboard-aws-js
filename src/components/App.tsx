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

  React.useEffect(() => {
    console.log(process.env);
    DeviceAPI.getDevices().then((devices) => {
      setDevices(devices.map((d) => Device.fromDeviceJSON(d)));
    });
  }, []);

  return (
    <>
      <SideBar />
      <WorldMap />
      {/* <InfoBox /> */}
      {/* <NordicTab /> */}
    </>
  );
}
