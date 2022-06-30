# Thingy World

[thingyworld.nrfcloud.com](http://thingyworld.nrfcloud.com)

A web application that shows Thingy91s around the world displaying their location, humidity, temperature, and connection status. The application does this by consuming the [Device API](https://api.nrfcloud.com/v1) from nRFCloud. Details can be found here https://projecttools.nordicsemi.no/confluence/display/IRIS/ThingyWorld. This is a static site that uses an apiKey that is restricted to viewing only.

## Development

Install

```
npm i
```

Build and view locally

```
npm run build
npm run local
```

You can also create a build that is linked to your own account and view it locally:

1. Get the apikey from your own nRFCloud account
2. Change the apikey [here](https://github.com/nRFCloud/thingy-world-app/blob/master/assets/js/scripts.js#L29)
3. Run the build and view commands above
