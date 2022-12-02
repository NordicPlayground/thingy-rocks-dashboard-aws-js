Sentry.captureMessage('Something went wrong')

import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

const enableSentry = SENTRY_DSN !== undefined && import.meta.env.PROD

if (enableSentry) {
	console.debug(`Sentry enabled.`)
	Sentry.init({
		dsn: SENTRY_DSN,
		integrations: [new BrowserTracing()],
		tracesSampleRate: 0.05,
	})
} else {
	console.debug(`Sentry disabled.`)
}

export const captureMessage = (message: string): void => {
	console.debug(message)
	if (!enableSentry) return
	Sentry.captureMessage(message)
}
