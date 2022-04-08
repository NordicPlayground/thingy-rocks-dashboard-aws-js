import * as React from "react";
import {
  BingMapsImageryProvider,
  BingMapsStyle,
  buildModuleUrl,
  IonImageryProvider,
  ProviderViewModel,
  TileMapServiceImageryProvider,
} from "cesium";
import {
  Viewer,
  Entity,
  ImageryLayerCollection,
  ImageryLayer,
  Globe,
} from "resium";

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
};

export default function WorldMap() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.cesiumElement) {
    }
  }, []);

  return (
    <Viewer
      id="cesiumContainer"
      {...defaultViewerProps}
      selectedImageryProviderViewModel={
        new ProviderViewModel({
          name: "Bing Aerial Labels",
          iconUrl: buildModuleUrl(
            "Widgets/Images/ImageryProviders/bingAerialLabels.png"
          ),
          tooltip: "Bing Aerial Labels",
          creationFunction: function () {
            return new IonImageryProvider({ assetId: 3 });
          },
        })
      }
    ></Viewer>
  );
}
