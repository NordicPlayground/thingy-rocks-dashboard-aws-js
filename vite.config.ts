import { fromEnv } from '@nordicsemiconductor/from-env'
import preact from '@preact/preset-vite'
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'

const { version, homepage } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'),
)
const { websocketEndpoint, mapName, cognitoIdentityPoolId } = fromEnv({
	websocketEndpoint: 'WEBSOCKET_ENDPOINT',
	mapName: 'MAP_NAME',
	cognitoIdentityPoolId: 'COGNITO_IDENTITY_POOL_ID',
})(process.env)

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
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
	},
})
