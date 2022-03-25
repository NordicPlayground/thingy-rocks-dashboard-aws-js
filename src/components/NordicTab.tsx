import * as React from "react";

import * as NordicYImage from "../asset/nordic-marker-orange.svg";
import "./NordicTab.scss";

const NordicTab = () => (
  <a href="http://nordicsemiconductor.com/" target="_blank" className="top-tab">
    <img src={NordicYImage} />
  </a>
);

export default NordicTab;
