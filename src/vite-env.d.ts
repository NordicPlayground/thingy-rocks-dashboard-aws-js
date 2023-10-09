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
/**
 * Version of the Thingy World firmware that is considered to be the latest release
 *
 * @example '1.7.1'
 */
declare const FIRMWARE_RELEASE: string
/**
 * Version of the Modem firmware that is considered to be the latest release for 9160
 *
 * @example '1.3.3'
 */
declare const MODEM_FIRMWARE_RELEASE_9160: string
/**
 * Version of the Modem firmware that is considered to be the latest release for 9161, 9131
 *
 * @example '2.0.0'
 */
declare const MODEM_FIRMWARE_RELEASE_91x: string

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ImportMeta {
	readonly env: ImportMetaEnv
}
