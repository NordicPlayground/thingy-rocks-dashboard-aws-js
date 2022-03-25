import * as React from "react";

import * as NordicLogo from "../asset/nordicLogo.svg";
import * as ThingyImage from "../asset/thingy.svg";
import * as NordicYImage from "../asset/nordic-marker-orange.svg";

import "./SideBar.scss";

const SideBar = () => (
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
          {/* TODO: Create device list component */}
        </ul>
      </div>
    </div>
  </div>
);

export default SideBar;
