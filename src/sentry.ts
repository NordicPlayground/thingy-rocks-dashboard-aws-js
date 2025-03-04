import { browserTracingIntegration } from '@sentry/browser'
import * as Sentry from '@sentry/react'

const enableSentry =
	SENTRY_DSN !== undefined && import.meta.env.PROD !== undefined

if (enableSentry) {
	console.debug(`Sentry enabled.`)
	Sentry.init({
		dsn: SENTRY_DSN,
		integrations: [browserTracingIntegration()],
		tracesSampleRate: 0.05,
		release: VERSION,
	})
	Sentry.setTag('app_version', VERSION)
} else {
	console.debug(`Sentry disabled.`)
}

export const captureMessage = (message: string): void => {
	console.debug(message)
	if (!enableSentry) return
	Sentry.captureMessage(message)
}
