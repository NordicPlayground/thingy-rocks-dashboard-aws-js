import * as React from "react";
import "./App.scss";

import SideBar from "./SideBar";
import InfoBox from "./InfoBox";
import WorldMap from "./WorldMap";
import NordicTab from "./NordicTab";

export function ThingyWorld() {
  return (
    <>
      <SideBar />
      <WorldMap />
      <InfoBox />
      <NordicTab />
    </>
  );
}
