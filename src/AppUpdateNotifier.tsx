import { useCallback, useEffect, useState } from 'preact/hooks'
import { compare, parse } from 'semver'

const getStored = (): string[] => {
	try {
		return JSON.parse(localStorage.getItem('app:ignored_versions') ?? '[]')
	} catch {
		return []
	}
}

export const AppUpdateNotifier = () => {
	const [warning, setWarning] = useState<string | undefined>()
	const [ignored, setIgnored] = useState<string[]>(getStored())

	const checkVersion = useCallback(() => {
		fetch('./.well-known/release')
			.then(async (res) => res.text())
			.then(parse)
			.then((releasedVersion) => {
				if (releasedVersion === null) return
				if (compare(releasedVersion, VERSION) > 0) {
					console.log(
						ignored,
						releasedVersion.raw,
						ignored.includes(releasedVersion.raw),
					)
					if (ignored.includes(releasedVersion.raw)) {
						console.debug(
							`[App]`,
							`a newer version is available`,
							releasedVersion.raw,
						)
						return
					}
					console.warn(
						`[App]`,
						`a newer version is available`,
						releasedVersion.raw,
					)
					setWarning(releasedVersion.raw)
				}
			})
			.catch((err) => {
				console.error(`[AppUpdateNotifier]`, err)
			})
	}, [ignored])

	useEffect(() => {
		const i = setInterval(checkVersion, 10 * 60 * 1000)
		checkVersion()
		return () => {
			clearInterval(i)
		}
	}, [checkVersion])
	if (warning === undefined) return null
	return (
		<div class="container my-4">
			<div
				class="col col-lg-6 offset-lg-3 alert alert-warning d-flex justify-content-between align-items-center"
				role="alert"
			>
				<span>A newer version ({warning}) is available.</span>
				<span>
					<button
						type="button"
						class="btn btn-outline-danger"
						onClick={() => {
							if (warning === undefined) return
							localStorage.setItem(
								'app:ignored_versions',
								JSON.stringify([...new Set([...ignored, warning])]),
							)
							setIgnored((i) => [...new Set([...i, warning])])
							setWarning(undefined)
							console.log(`[App]`, `ignored newer version`, warning)
						}}
					>
						ignore
					</button>
					<a href="./" class="btn btn-outline-secondary ms-2">
						reload
					</a>
				</span>
			</div>
		</div>
	)
}
