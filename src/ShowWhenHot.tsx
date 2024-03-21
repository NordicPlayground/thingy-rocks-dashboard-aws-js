import type { VNode } from 'preact'
import { useEffect, useState } from 'preact/hooks'

export const diff = (ts: Date): number =>
	Math.floor((Date.now() - ts.getTime()) / 1000)

export const ShowWhenHot = ({
	ts,
	untilSeconds,
	children,
}: {
	ts: Date
	untilSeconds?: number
	children: (diffSeconds: number) => VNode<any>
}) => {
	const [diffSeconds, setDiffSeconds] = useState<number>(diff(ts))

	useEffect(() => {
		const i = setInterval(() => {
			const diffSeconds = diff(ts)
			setDiffSeconds(diffSeconds)
			if (diffSeconds > (untilSeconds ?? 30)) clearInterval(i)
		}, 1000)
		return () => {
			clearInterval(i)
		}
	}, [ts])

	if (diffSeconds > (untilSeconds ?? 30)) return null
	return children(diffSeconds)
}
