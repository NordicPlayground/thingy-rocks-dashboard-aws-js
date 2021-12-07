class Globe {
  constructor(data) {
    this.sidebar = new Sidebar();

    this.viewer = this.initViewer();
    this.configScene(this.viewer);
    this.getDevices();
    this.clickAction(this.viewer, this.sidebar);
  }

  configScene(viewer) {
    // scene settings
    viewer.scene.screenSpaceCameraController.enableTilt = false;

    // zoom control buttons
    document.querySelector("#zoom-out").addEventListener("click", function () {
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var cameraHeight = ellipsoid.cartesianToCartographic(
        viewer.camera.position
      ).height;
      var moveRate =
        cameraHeight < 300000 ? cameraHeight / 15.0 : cameraHeight / 5.0;
      viewer.camera.moveBackward(moveRate);
    });
    document.querySelector("#zoom-in").addEventListener("click", function () {
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var cameraHeight = ellipsoid.cartesianToCartographic(
        viewer.camera.position
      ).height;
      var moveRate =
        cameraHeight < 300000 ? cameraHeight / 15.0 : cameraHeight / 5.0;
      viewer.camera.moveForward(moveRate);
    });
    return viewer;
  }

  initViewer() {
    var imagery = Cesium.createDefaultImageryProviderViewModels();
    var viewer = new Cesium.Viewer("cesiumContainer", {
      imageryProviderViewModels: imagery,
      selectedImageryProviderViewModel: imagery[1],
    });
    viewer.scene.postRender.addEventListener(function (rendered) {
      if (
        viewer.scene.globe.tilesLoaded == true &&
        document.querySelector(".intro-container") &&
        !document
          .querySelector(".intro-container")
          .classList.contains("globe-rendered")
      ) {
        document
          .querySelector(".intro-container")
          .classList.add("globe-rendered");
        document.querySelector(".message").innerHTML =
          "Click Anywhere to Begin.";
      }
    });
    return viewer;
  }

  getDevices() {
    var globe = this;
    var call = getAjaxSettings(
      "https://api.dev.nrfcloud.com/v1/devices?includeState=true&includeStateMeta=true&pageSort=desc"
    );

    $.ajax(call).done(function (response) {
      var devices = response.items;
      var deviceArray = [];
      for (let i = 0; i < devices.length; i++) {
        deviceArray[devices[i].id] = new Device(devices[i]);
      }
      globe.addPoints(deviceArray);
    });
  }

  addPoints(deviceArray) {
    var deviceList = document.querySelector(".device-list");
    var viewer = this.viewer;
    var sidebar = this.sidebar;
    var globe = this;

    if (Object.keys(deviceArray).length > 1) {
      for (const device in deviceArray) {
        globe.addPoint(viewer, deviceArray[device], deviceList, sidebar);
      }
    }
  }

  addPoint(viewer, data, deviceList, sidebar) {
    let showEntity = data.position == undefined ? false : true;
    let position =
      showEntity == true
        ? Cesium.Cartesian3.fromDegrees(data.position[1], data.position[0])
        : null;
    let listEntry = this.createListEntry(data, deviceList);
    let entity = viewer.entities.add({
      position: position,
      properties: {
        id: data.id,
        name: data.properties.name,
        list_entry: listEntry,
        coords: data.position,
        data: data.properties.data,
        serviceType: data.serviceType,
        uncertainty: data.uncertainty,
        locationUpdate: data.locationUpdate,
      },
      billboard: {
        height: 32,
        width: 32,
        image: "img/nordic-icon-g.svg",
        show: showEntity,
      },
    });
    listEntry.addEventListener("click", function () {
      viewer.selectedEntity = entity;
      if (window.innerWidth < 771) {
        sidebar.closeSidebar();
      }
    });
  }

  createListEntry(data, deviceList) {
    let listEntry = document.createElement("li");
    listEntry.innerHTML =
      '<a href="#" class="' +
      data.properties.connected +
      '">' +
      data.properties.name +
      "</a>";
    deviceList.appendChild(listEntry);

    return listEntry;
  }

  clickAction(viewer, sidebar) {
    viewer.selectedEntityChanged.addEventListener(function () {
      if (document.querySelector(".infobox")) {
        document.querySelector(".infobox").remove();
      }

      Globe.resetIcons(viewer);
      if (undefined !== viewer.selectedEntity) {
        Globe.getMessagesForDevice(
          viewer.selectedEntity._properties._id._value
        );
        Globe.populateSidebar(viewer.selectedEntity);
        Globe.populateMobileData(viewer.selectedEntity);
        viewer.selectedEntity.billboard = {
          height: 64,
          width: 64,
          image: "img/nordic-icon-y.svg",
        };
        var listEntry = viewer.selectedEntity._properties._list_entry._value;
        if (undefined !== listEntry) {
          null !== document.querySelector(".device-list li.active")
            ? document
                .querySelector(".device-list li.active")
                .classList.remove("active")
            : false;
          listEntry.classList.add("active");
        }

        if (
          viewer.selectedEntity._properties._coords &&
          viewer.selectedEntity._properties._coords._value &&
          viewer.selectedEntity._properties._coords._value.length > 0
        ) {
          viewer.flyTo(viewer.selectedEntity, {
            offset: new Cesium.HeadingPitchRange(0, -90, 5000),
          });
        }

        if (window.innerWidth > 770) {
          sidebar.openSidebar();
        } else {
          document.querySelector(".mobile-sidebar").classList.add("reveal");
        }
      } else {
        sidebar.closeSidebar();
        sidebar.closeMobileSidebar();
      }
    });
  }

  static getMessagesForDevice(deviceID) {
    var getTempData = getAjaxSettings(
      "https://api.dev.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceIdentifiers=" +
        deviceID +
        "&pageLimit=1&pageSort=desc&appId=TEMP"
    );
    var getHumidityData = getAjaxSettings(
      "https://api.dev.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceIdentifiers=" +
        deviceID +
        "&pageLimit=1&pageSort=desc&appId=HUMID"
    );

    $(".device-data__datum.temp .datum-info").html("Loading...");
    $(".device-data__datum.humidity .datum-info").html("Loading...");
    $(".device-data__datum").show();

    $.when($.ajax(getTempData), $.ajax(getHumidityData)).done(function (
      tempResponse,
      humidityResponse
    ) {
      var data = {
        Temperature: {
          data: null,
          timestamp: null,
        },
        Humidity: {
          data: null,
          timestamp: null,
        },
      };

      var tempData = tempResponse[0].items && tempResponse[0].items[0];
      var humidData = humidityResponse[0].items && humidityResponse[0].items[0];

      if (tempData) {
        data.Temperature.data = tempData.message.data;
        data.Temperature.timestamp = moment(
          new Date(Date.parse(tempData.receivedAt))
        ).format("ddd MMM DD YYYY, kk:mm:ss");
      }

      if (humidData) {
        data.Humidity.data = humidData.message.data;
        data.Humidity.timestamp = moment(
          new Date(Date.parse(humidData.receivedAt))
        ).format("ddd MMM DD YYYY, kk:mm:ss");
      }

      $(".device-data__datum.temp .datum-info").html(
        Globe.formatDataString(data, "Temperature")
      );
      $(".device-data__datum.temp .datum-timestamp").html(
        Globe.formatTimestamp(data, "Temperature")
      );
      $(".device-data__datum.humidity .datum-info").html(
        Globe.formatDataString(data, "Humidity")
      );
      $(".device-data__datum.humidity .datum-timestamp").html(
        Globe.formatTimestamp(data, "Humidity")
      );
    });
  }

  static formatDataString(message, dataKey) {
    return message[dataKey].data
      ? `${message[dataKey].data}${Device.dataMap[dataKey].unit}`
      : "--";
  }

  static formatTimestamp(message, dataKey) {
    return message[dataKey].timestamp
      ? `updated ${message[dataKey].timestamp}`
      : "No update";
  }

  static formatUncertainty(message) {
    return message && message !== "NA" ? `${message} m` : "N/A";
  }

  static populateSidebar(entity) {
    var props = entity._properties;
    var deviceData = document.querySelector(".data-display");
    var name = deviceData.querySelector(".device-location-name-label");
    var coords = deviceData.querySelector(".coordinates");
    var lastLocationServiceUpdate = moment(
      new Date(props.locationUpdate)
    ).format("ddd MMM DD YYYY, kk:mm:ss");
    var uncertainty = props.uncertainty.getValue();

    $(".device-data__datum.location_method .datum-info").html(
      props.serviceType.getValue() || "N/A"
    );

    $(".device-data__datum.location_method .datum-timestamp").html(
      lastLocationServiceUpdate != "Invalid date"
        ? `updated ${lastLocationServiceUpdate}`
        : "No update"
    );

    $(".device-data__datum.uncertainty .datum-info").html(
      Globe.formatUncertainty(uncertainty)
    );

    $(".device-data__datum.uncertainty .datum-timestamp").html(
      uncertainty ? `updated ${lastLocationServiceUpdate}` : "No update"
    );

    name.innerHTML = props._name;
    coords.innerHTML =
      props._coords && props._coords._value.length > 0
        ? `${props._coords._value[0].toFixed(
            4
          )}, ${props._coords._value[1].toFixed(4)}`
        : "No GPS Data Available";
  }

  static populateMobileData(entity) {
    var props = entity._properties;
    var deviceData = document.querySelector(".mobile-sidebar .data-display");
    var name = deviceData.querySelector(".device-location-name-label");
    var coords = deviceData.querySelector(".coordinates");
    var datumContainer = deviceData.querySelector(
      ".mobile-sidebar .device-data"
    );

    name.innerHTML = props._name;
    coords.innerHTML =
      props._coords && props._coords._value
        ? props._coords
        : "No GPS Data Available";
  }

  static resetIcons(viewer) {
    var entriesArray = viewer.entities._entities._array;
    if (undefined !== viewer.selectedEntity) {
      for (let i = 0; i < entriesArray.length; i++) {
        if (undefined !== entriesArray[i]._billboard._image) {
          entriesArray[i].billboard = {
            height: 32,
            width: 32,
            image: "img/nordic-icon-g.svg",
          };
        }
      }
    }
  }
}
