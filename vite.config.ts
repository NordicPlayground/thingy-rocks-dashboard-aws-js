import { fromEnv } from '@nordicsemiconductor/from-env'
import preact from '@preact/preset-vite'
import chalk from 'chalk'
import fs from 'fs'
import Handlebars from 'handlebars'
import path from 'path'
import { defineConfig } from 'vite'

const { version: defaultVersion, homepage } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'),
)
const version = process.env.VERSION ?? defaultVersion
const { websocketEndpoint, mapName, cognitoIdentityPoolId } = fromEnv({
	websocketEndpoint: 'WEBSOCKET_ENDPOINT',
	mapName: 'MAP_NAME',
	cognitoIdentityPoolId: 'COGNITO_IDENTITY_POOL_ID',
})(process.env)

console.debug(chalk.yellow('websocketEndpoint'), chalk.blue(websocketEndpoint))
console.debug(chalk.yellow('mapName'), chalk.blue(mapName))
console.debug(
	chalk.yellow('cognitoIdentityPoolId'),
	chalk.blue(cognitoIdentityPoolId),
)

// Optional environment variables
const sentryDSN = process.env.SENTRY_DSN
if (sentryDSN === undefined) {
	console.debug(chalk.yellow(`Sentry`), chalk.red('disabled'))
} else {
	console.debug(chalk.yellow(`Sentry DSN`), chalk.blue(sentryDSN))
}

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
	build: {
		outDir: './build',
		sourcemap: true,
	},
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' },
	},
	// string values will be used as raw expressions, so if defining a string constant, it needs to be explicitly quoted
	define: {
		HOMEPAGE: JSON.stringify(homepage),
		VERSION: JSON.stringify(version ?? Date.now()),
		WEBSOCKET_ENDPOINT: JSON.stringify(websocketEndpoint),
		MAP_NAME: JSON.stringify(mapName),
		COGNITO_IDENTITY_POOL_ID: JSON.stringify(cognitoIdentityPoolId),
		REGION: JSON.stringify(cognitoIdentityPoolId.split(':')[0] as string),
		SENTRY_DSN: JSON.stringify(sentryDSN),
	},
})
