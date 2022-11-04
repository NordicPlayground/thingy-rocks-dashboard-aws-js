# ThingyWorld

[thingyworld.nrfcloud.com](http://thingyworld.nrfcloud.com)

A web application that shows Thingy91s around the world displaying their location, humidity, temperature, and connection status. The application does this by consuming the [Device API](https://api.nrfcloud.com/v1) from nRFCloud. This is a static site that uses an apiKey that is restricted to viewing only.

## Development

Install

```
npm ci
```

Set the correct environmental variables `CESIUM_ION_ACCESS_TOKEN` and `NRF_CLOUD_API_KEY`. See the [wiki](https://github.com/nRFCloud/thingy-world-app/wiki) on how to get both. You can use the `CESIUM_ION_ACCESS_TOKEN` from the existing Cesium account or setup a separate Cesium account. The former being the fastest way to get up and running. The `API_KEY` can be set to the existing nRFCloud viewer account or an account of your choice. If you deploy the app use only an `API_KEY` that has read permissions only. Details on how this is currently done is outlined in the wiki.

Build and view locally

```
npm run build
npm run local
```

More details can be found on the [wiki](https://github.com/nRFCloud/thingy-world-app/wiki)
