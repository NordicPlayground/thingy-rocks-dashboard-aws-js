// These constants are string-replaced compile time.
// See https://vitejs.dev/config/shared-options.html#define
declare const WEBSOCKET_ENDPOINT: string
declare const VERSION: string
declare const HOMEPAGE: string
declare const COGNITO_IDENTITY_POOL_ID: string
declare const MAP_NAME: string
declare const REGION: string
declare const SENTRY_DSN: string | undefined

/**
 * @see https://vitejs.dev/guide/env-and-mode.html#env-variables
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ImportMetaEnv {
	/**
	 * whether the app is running in production.
	 */
	readonly PROD: boolean
	/**
	 * Deployed version
	 */
	readonly VERSION: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ImportMeta {
	readonly env: ImportMetaEnv
}
