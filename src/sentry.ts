import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/browser'

const enableSentry =
	SENTRY_DSN !== undefined && import.meta.env.PROD !== undefined

if (enableSentry) {
	console.debug(`Sentry enabled.`)
	Sentry.init({
		dsn: SENTRY_DSN,
		integrations: [new BrowserTracing()],
		tracesSampleRate: 0.05,
	})
	Sentry.setContext('app', {
		version: VERSION,
	})
} else {
	console.debug(`Sentry disabled.`)
}

export const captureMessage = (message: string): void => {
	console.debug(message)
	if (!enableSentry) return
	Sentry.captureMessage(message)
}
