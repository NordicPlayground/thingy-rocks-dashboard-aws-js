export const withCancel =
	(handler: (e: Event) => unknown) =>
	(e: Event): void => {
		cancelEvent(e)
		handler(e)
	}

export const cancelEvent = (e: Event): void => {
	e.preventDefault()
	e.stopPropagation()
}
