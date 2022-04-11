import * as React from "react";
import {
  buildModuleUrl,
  Cartesian3,
  IonImageryProvider,
  ProviderViewModel,
} from "cesium";
import { Viewer, Entity } from "resium";

import "./WorldMap.scss";
import { ViewerProps } from "resium/dist/Viewer/Viewer";
import { useEffect, useRef } from "react";

const defaultViewerProps: ViewerProps = {
  homeButton: false,
  navigationHelpButton: false,
  vrButton: false,
  timeline: false,
  infoBox: false,
  geocoder: false,
  projectionPicker: false,
  sceneModePicker: false,
  fullscreenButton: false,
  creditContainer: document.createElement("div"),
};

const position = Cartesian3.fromDegrees(-74.0707383, 40.7117244, 100);
const pointGraphics = { pixelSize: 10 };

// TODO: Create device entities
// TODO: Select entity
// TOO: Camera fly to selected entity

// What if the devices are ready before the globe??
const WorldMap = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.cesiumElement) {
      console.log(ref);
      ref.current.cesiumElement.scene.screenSpaceCameraController.enableTilt = true;
    }
  }, []);

  return (
    <Viewer
      id="cesiumContainer"
      ref={ref}
      {...defaultViewerProps}
      selectedImageryProviderViewModel={
        new ProviderViewModel({
          name: "Bing Aerial Labels",
          iconUrl: buildModuleUrl(
            "Widgets/Images/ImageryProviders/bingAerialLabels.png"
          ),
          tooltip: "Bing Aerial Labels",
          creationFunction: () => new IonImageryProvider({ assetId: 3 }),
        })
      }
    >
      <Entity position={position} point={pointGraphics}></Entity>
    </Viewer>
  );
};

const MemoWorldMap = React.memo(WorldMap);
export default MemoWorldMap;
