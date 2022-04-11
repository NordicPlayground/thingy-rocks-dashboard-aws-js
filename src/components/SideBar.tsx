import * as React from "react";

import * as NordicLogo from "../assets/nordicLogo.svg";
import * as ThingyImage from "../assets/thingy.svg";
import * as NordicYImage from "../assets/nordic-marker-orange.svg";

import "./SideBar.scss";
import DeviceListItem from "./DeviceListItem";
import Device from "../device";

const SideBar: React.FunctionComponent<{ devices: Device[] }> = ({
  devices,
}) => (
  <div className="sidebar open">
    <a className="sidebar-toggle">
      <div></div>
    </a>
    <img className="logo" src={NordicLogo} />
    <div className="scrollable">
      <div className="data-display">
        <div className="device-info">
          <img className="device-img" src={ThingyImage} />
          <div className="device-location-name">
            <img src={NordicYImage} />
            <span className="device-location-name-label"></span>
          </div>
          <div className="device-location-coords">
            <h3 className="sidebar-heading">Coordinates</h3>
            <p className="coordinates"></p>
          </div>
        </div>
        <div className="device-data">
          <div className="device-data">
            <div
              className="device-data__datum temp"
              style={{ display: "none" }}
            >
              <h3 className="datum-name">Temperature</h3>
              <p className="datum-info">loading data...</p>
              <p className="datum-timestamp">updating...</p>
            </div>
            <div
              className="device-data__datum humidity"
              style={{ display: "none" }}
            >
              <h3 className="datum-name">Humidity</h3>
              <p className="datum-info">loading data...</p>
              <p className="datum-timestamp">updating...</p>
            </div>
          </div>
        </div>
      </div>

      <div className="device-list-block">
        <h3 className="sidebar-heading">All Devices</h3>
        <ul className="device-list">
          {devices.map(({ id, name, connected }) => (
            <DeviceListItem
              key={id}
              id={id}
              name={name}
              connected={connected}
            />
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default SideBar;
