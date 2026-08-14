import { fromEnv } from '@nordicsemiconductor/from-env'
import { preact } from '@preact/preset-vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import chalk from 'chalk'
import fs from 'fs'
import Handlebars from 'handlebars'
import path from 'path'
import { defineConfig } from 'vite'

const { version: defaultVersion, homepage } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'),
)
const version = process.env.VERSION ?? defaultVersion
const {
	websocketEndpoint,
	mapApiKey,
	cognitoUserPoolURL,
	cognitoUserPoolClientId,
	cognitoIdentityPoolId,
	cognitoDomainUrl,
	streamMetadataTable,
} = fromEnv({
	websocketEndpoint: 'WEBSOCKET_ENDPOINT',
	mapApiKey: 'MAP_API_KEY',
	cognitoUserPoolURL: 'COGNITO_USER_POOL_URL',
	cognitoUserPoolClientId: 'COGNITO_USER_POOL_CLIENT_ID',
	cognitoIdentityPoolId: 'COGNITO_IDENTITY_POOL_ID',
	cognitoDomainUrl: 'COGNITO_DOMAIN_URL',
	streamMetadataTable: 'STREAM_METADATA_TABLE',
})(process.env)

console.debug(chalk.yellow('websocketEndpoint'), chalk.blue(websocketEndpoint))
console.debug(chalk.yellow('mapApiKey'), chalk.blue(mapApiKey))
console.debug(
	chalk.yellow('cognitoUserPoolURL'),
	chalk.blue(cognitoUserPoolURL),
)
console.debug(
	chalk.yellow('cognitoUserPoolClientId'),
	chalk.blue(cognitoUserPoolClientId),
)
console.debug(
	chalk.yellow('cognitoIdentityPoolId'),
	chalk.blue(cognitoIdentityPoolId),
)
console.debug(chalk.yellow('cognitoDomainUrl'), chalk.blue(cognitoDomainUrl))
console.debug(
	chalk.yellow('streamMetadataTable'),
	chalk.blue(streamMetadataTable),
)

// Optional environment variables
const sentryDSN = process.env.SENTRY_DSN
if (sentryDSN === undefined) {
	console.debug(chalk.yellow(`Sentry`), chalk.red('disabled'))
} else {
	console.debug(chalk.yellow(`Sentry DSN`), chalk.blue(sentryDSN))
}
// See https://github.com/NordicPlayground/thingy-world-firmware-aws/releases
const firmwareRelease = process.env.FIRMWARE_RELEASE ?? '2.2.1'
// See https://www.nordicsemi.com/Products/Development-hardware/nRF9160-DK/Download
const modemFirmwareRelease9160 =
	process.env.MODEM_FIRMWARE_RELEASE_9160 ?? '1.3.7'
// See https://www.nordicsemi.com/Products/nRF9161/Download
const modemFirmwareRelease91x =
	process.env.MODEM_FIRMWARE_RELEASE_91x ?? '2.0.2'

const replaceInIndex = (data: Record<string, string>) => ({
	name: 'replace-in-index',
	transformIndexHtml: (source: string): string => {
		const template = Handlebars.compile(source)
		return template(data)
	},
})

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		replaceInIndex({
			version,
		}),
		sentryVitePlugin({
			org: 'nordic-semiconductor-asa',
			project: 'thingy-world',
		}),
	],
	base: `${(process.env.BASE_URL ?? '').replace(/\/+$/, '')}/`,
	preview: {
		host: 'localhost',
		port: 8080,
	},
	server: {
		host: 'localhost',
		port: 8080,
	},
	resolve: {
		alias: [
			// https://ui.docs.amplify.aws/getting-started/installation?platform=vue#vite
			{
				find: './runtimeConfig',
				replacement: './runtimeConfig.browser',
			},
		],
	},
	optimizeDeps: {
		exclude: ['maplibre-gl'],
	},
	build: {
		outDir: './build',
		sourcemap: true,
		rollupOptions: {
			input: {
				main: path.join(process.cwd(), 'index.html'),
				topology: path.join(process.cwd(), 'topology.html'),
				'wirepas-topology': path.join(process.cwd(), 'wirepas-topology.html'),
			},
		},
	},
	// string values will be used as raw expressions, so if defining a string constant, it needs to be explicitly quoted
	define: {
		HOMEPAGE: JSON.stringify(homepage),
		VERSION: JSON.stringify(version ?? Date.now()),
		WEBSOCKET_ENDPOINT: JSON.stringify(websocketEndpoint),
		MAP_API_KEY: JSON.stringify(mapApiKey),
		COGNITO_USER_POOL_URL: JSON.stringify(cognitoUserPoolURL),
		COGNITO_USER_POOL_CLIENT_ID: JSON.stringify(cognitoUserPoolClientId),
		COGNITO_IDENTITY_POOL_ID: JSON.stringify(cognitoIdentityPoolId),
		COGNITO_DOMAIN_URL: JSON.stringify(cognitoDomainUrl),
		REGION: JSON.stringify(cognitoIdentityPoolId.split(':')[0]),
		SENTRY_DSN: JSON.stringify(sentryDSN),
		BUILD_TIME: JSON.stringify(new Date().toISOString()),
		FIRMWARE_RELEASE: JSON.stringify(firmwareRelease),
		MODEM_FIRMWARE_RELEASE_9160: JSON.stringify(modemFirmwareRelease9160),
		MODEM_FIRMWARE_RELEASE_91x: JSON.stringify(modemFirmwareRelease91x),
		STREAM_METADATA_TABLE: JSON.stringify(streamMetadataTable),
	},
})
