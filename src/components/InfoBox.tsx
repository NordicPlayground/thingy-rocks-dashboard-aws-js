import * as React from "react";

import * as ArrowLink from "../assets/arrow-link.svg";
import "./InfoBox.scss";

const InfoBox = () => (
  <div className="infobox">
    <p>
      Learn more about Nordic Semiconductor’s Thingy91 and newly updated device
      management platform.
    </p>
    <a href="https://nrfcloud.com/">
      <img src={ArrowLink} /> Visit nrfCloud
    </a>
  </div>
);

export default InfoBox;
