# world.thingy.rocks

[![GitHub Actions](https://github.com/NordicPlayground/thingy-rocks-dashboard-aws-js/actions/workflows/build-and-publish.yaml/badge.svg)](https://github.com/NordicPlayground/thingy-rocks-dashboard-aws-js/actions/workflows/build-and-publish.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

thingy.rocks AWS IoT dashboard developed using [Preact](https://preactjs.com/)
in [TypeScript](https://www.typescriptlang.org/).

## Target

The app is intended to be displayed on the half part of a 42 inch 1080p TV in
portrait mode. Target resolution: 1080 x 768.

[Feature overview](https://miro.com/app/board/uXjVP4ck03g=/?share_link_id=90630083064)

## Setup

Install the dependencies:

```bash
npm ci
ln -s ../node_modules/svg-country-flags/svg static/flags
```

## Node & NPM

This project requires Node.js `>=24.19.0 <25` and npm `>=12.0.2 <13` (enforced
via `check-node-version` on `npm install` and `npm ci`). The check is skipped
during `npm publish` and `npm pack`, because `semantic-release` bundles its own
npm (`@semantic-release/npm` depends on `npm@^11.6.2`) and runs the publish with
that version rather than the one installed in CI.

## Configure

Provide these configuration settings from the
[backend](https://github.com/NordicPlayground/thingy-rocks-cloud-aws-js):

- `WEBSOCKET_ENDPOINT`
- `COGNITO_USER_POOL_URL`
- `COGNITO_USER_POOL_CLIENT_ID`
- `COGNITO_IDENTITY_POOL_ID`
- `COGNITO_DOMAIN_URL`
- `STREAM_METADATA_TABLE`

For the `MAP_API_KEY`, create an new API key in Amazon Location, with these
permissions:

- `GetStaticMap`
- `GetTile`

and limit it to these referrers:

- `http://localhost:*`
- `https://world.thingy.rocks`

## Run

```bash
npm start
```
