import * as React from "react";
import Device from "../device";
import "./DeviceListItem.scss";

type DeviceListItemProps = Pick<Device, "id" | "connected" | "name">;

const DeviceListItem: React.FunctionComponent<DeviceListItemProps> = ({
  name,
  id,
  connected,
}) => (
  <li>
    <a href="#" className={connected} id={id}>
      {name}
    </a>
  </li>
);

export default DeviceListItem;
