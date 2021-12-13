const handleEvent = (
  eventName,
  { el, callback, useCapture = false } = {},
  thisArg
) => {
  const element = el || document.documentElement;

  function handler(e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof callback === "function") {
      callback.call(thisArg, e);
    }
  }
  handler.destroy = function destroy() {
    return element.removeEventListener(eventName, handler, useCapture);
  };
  element.addEventListener(eventName, handler, useCapture);
  return handler;
};

function getAjaxSettings(url, async = true) {
  var settings = {
    crossDomain: true,
    async: async,
    url: url,
    method: "GET",
    headers: {
      Authorization: "Bearer 12af85ea3af2d76df38e56a9bc1484fd70389d1d", // viewer access token
    },
  };
  return settings;
}

function getLocationDataForDevice(deviceId, callback) {
  const device = {};
  var locationHistory = getAjaxSettings(
    "https://api.nrfcloud.com/v1/location/history?deviceId=" +
      deviceId +
      "&pageLimit=1",
    false
  );

  var legacyLocationHistory = getAjaxSettings(
    "https://api.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceId=" +
      deviceId +
      "&pageLimit=1&pageSort=desc&appId=GPS",
    false
  );

  $.when($.ajax(locationHistory), $.ajax(legacyLocationHistory)).done(function (
    locationHistoryResponse,
    legacyLocationHistoryResponse
  ) {
    const deviceLocationHistoryResult =
      locationHistoryResponse[0] &&
      locationHistoryResponse[0].items &&
      locationHistoryResponse[0].items[0];

    const legacyDeviceLocationHistoryResult =
      legacyLocationHistoryResponse[0] &&
      legacyLocationHistoryResponse[0].items &&
      legacyLocationHistoryResponse[0].items[0] &&
      legacyLocationHistoryResponse[0].items[0].message &&
      legacyLocationHistoryResponse[0].items[0].message.data;

    if (deviceLocationHistoryResult) {
      const deviceLat = +deviceLocationHistoryResult.lat || undefined;
      const deviceLon = +deviceLocationHistoryResult.lon || undefined;
      device.coords = {
        lat: null,
        lng: null,
      };
      device.coords.lat = deviceLat;
      device.coords.lng = deviceLon;
      device.serviceType = deviceLocationHistoryResult.serviceType || "N/A";
      device.uncertainty = +deviceLocationHistoryResult.uncertainty;
      device.position = [deviceLat, deviceLon];
      device.locationUpdate = deviceLocationHistoryResult.insertedAt || "N/A";
      device.gps = device.coords;
    } else if (legacyDeviceLocationHistoryResult) {
      var gpsArray = legacyDeviceLocationHistoryResult.split(",");
      // process latitude
      var lat_degrees =
        parseFloat(gpsArray[2].substr(gpsArray[2].indexOf(".") - 2)) / 60 +
        parseFloat(gpsArray[2].substr(0, gpsArray[2].indexOf(".") - 2));
      var lat_multiplier = gpsArray[3] == "N" ? 1 : -1;

      var lat = lat_degrees * lat_multiplier;
      var lat_readable = lat_degrees.toFixed(3);
      // process longitude
      var lng_degrees =
        parseFloat(gpsArray[4].substr(gpsArray[4].indexOf(".") - 2)) / 60 +
        parseFloat(gpsArray[4].substr(0, gpsArray[4].indexOf(".") - 2));
      var lng_multiplier = gpsArray[5] == "E" ? 1 : -1;

      var lng = lng_degrees * lng_multiplier;
      var lng_readable = lng.toFixed(3);

      var gps_readout =
        lat_readable +
        "° " +
        gpsArray[3] +
        ", " +
        lng_readable +
        "° " +
        gpsArray[5];

      device.coords = {
        lat: null,
        lng: null,
      };

      device.coords.readable = gps_readout;
      device.coords.lat = lat;
      device.coords.lng = lng;
      device.locationUpdate =
        legacyLocationHistoryResponse[0].items[0].receivedAt || "N/A";

      device.position = [lat, lng];
      device.gps = device.coords;
    }

    callback(device);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded");
  new Globe();

  window.setTimeout(function () {
    document.querySelector("body").classList.add("loaded");
    if (window.innerWidth > 770) {
      document.querySelector(".sidebar").classList.add("open");
      document.querySelector("body").classList.add("open-sidebar");
    }
  }, 800);

  // hide, then remove the intro overlay
  document
    .querySelector(".intro-container")
    .addEventListener("click", function () {
      this.classList.add("hidden");
      window.setTimeout(function () {
        document.querySelector(".intro-container").remove();
      }, 800);
    });
});
