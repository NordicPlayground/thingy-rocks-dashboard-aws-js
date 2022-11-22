# thingy.rocks AWS IoT dashboard developed using Preact in TypeScript

[![GitHub Actions](https://github.com/NordicPlayground/thingy-rocks-dashboard-aws-js/workflows/Test%20and%20Release/badge.svg)](https://github.com/NordicPlayground/thingy-rocks-dashboard-aws-js/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/NordicPlayground/thingy-rocks-dashboard-aws-js)](https://mergify.io)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

thingy.rocks AWS IoT dashboard developed using [Preact](https://preactjs.com/)
in [TypeScript](https://www.typescriptlang.org/).

## Setup

Install the dependencies:

```bash
npm ci
```

## Configure

Provide the websocket endpoint from the
[backend](https://github.com/NordicPlayground/thingy-rocks-cloud-aws-js) in the
environment variable `PUBLIC_WEBSOCKET_ENDPOINT`.

## Run

```bash
npm start
```
