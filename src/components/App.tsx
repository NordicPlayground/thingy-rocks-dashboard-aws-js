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
    DeviceAPI.getDevices().then((devicesResponse) => {
      devicesResponse.map((deviceJSON) =>
        DeviceAPI.getDeviceWithData(deviceJSON.id).then((dataJSON) => {
          setDevices((existingDevices) => [
            Device.fromDeviceJSON({ ...deviceJSON, ...dataJSON }),
            ...existingDevices,
          ]);
        })
      );
    });
  }, []);

  // Load devices onto the globe asyncronously
  // ---> Make Device component
  // ---> pass in devices and selected device
  // Load devices onto the the sidebar asyncrounously
  // ---> pass in devices and selected device
  return (
    <>
      <SideBar devices={devices} />
      <WorldMap />
      <InfoBox />
      <NordicTab />
    </>
  );
}
