# world.thingy.rocks

[![GitHub Actions](https://github.com/NordicPlayground/thingy-rocks-dashboard-aws-js/actions/workflows/build-and-publish.yaml/badge.svg)](https://github.com/NordicPlayground/thingy-rocks-dashboard-aws-js/actions/workflows/build-and-publish.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/NordicPlayground/thingy-rocks-dashboard-aws-js)](https://mergify.io)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
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

## Configure

Provide these configuration settings from the
[backend](https://github.com/NordicPlayground/thingy-rocks-cloud-aws-js):

- `WEBSOCKET_ENDPOINT`
- `MAP_NAME`
- `COGNITO_IDENTITY_POOL_ID`

## Run

```bash
npm start
```
