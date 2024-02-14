export const cancelEvent =
	(handler: (e: Event) => unknown) =>
	(e: Event): void => {
		e.preventDefault()
		e.stopPropagation()
		handler(e)
	}
