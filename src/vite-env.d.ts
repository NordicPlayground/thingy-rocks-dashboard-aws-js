// These constants are string-replaced compile time.
// See https://vitejs.dev/config/shared-options.html#define
declare const WEBSOCKET_ENDPOINT: string
declare const VERSION: string
declare const HOMEPAGE: string
declare const COGNITO_IDENTITY_POOL_ID: string
declare const MAP_NAME: string
declare const REGION: string
declare const BUILD_TIME: string
declare const SENTRY_DSN: string | undefined

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ImportMeta {
	readonly env: ImportMetaEnv
}
