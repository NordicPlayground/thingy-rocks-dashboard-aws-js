# ThingyWorld

A web application that shows Thingy91s around the world displaying their
location, humidity, temperature, and connection status. The application does
this by consuming the [Device API](https://api.nrfcloud.com/v1) from nRF Cloud.
This is a static site that uses an apiKey that is restricted to viewing only.

## Development

Install

```
npm ci
```

Set the correct environmental variables `CESIUM_ION_ACCESS_TOKEN` (an API key
for [Cesium](https://cesium.com/platform/cesiumjs/)) and `NRF_CLOUD_API_KEY` (a
read-only API key for [nRF Cloud](https://nrfcloud.com)).

Build and view locally

```
npm run build
npm run local
```
