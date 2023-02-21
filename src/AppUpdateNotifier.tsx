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
	const [newerVersion, setNewerVersion] = useState<string | undefined>()
	const [ignored, setIgnored] = useState<string[]>(getStored())

	const checkVersion = useCallback(() => {
		fetch('./.well-known/release')
			.then(async (res) => (await res.text()).trim())
			.then(parse)
			.then((releasedVersion) => {
				if (releasedVersion === null) return
				if (compare(releasedVersion, VERSION) > 0) {
					if (ignored.includes(releasedVersion.raw)) {
						console.debug(
							`[App]`,
							`a newer version is available`,
							releasedVersion.raw,
						)
						return
					}
					console.warn(`[App]`, `a newer version is available`, releasedVersion)
					setNewerVersion(releasedVersion.raw)
				} else {
					console.debug(
						`[App]`,
						`release version`,
						releasedVersion.raw,
						`is older`,
					)
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
	if (newerVersion === undefined) return null
	return (
		<div class="container my-4">
			<div
				class="col col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 alert alert-warning d-flex justify-content-between align-items-center"
				role="alert"
			>
				<span>A newer version ({newerVersion}) is available.</span>
				<span class="flex-shrink-0">
					<button
						type="button"
						class="btn btn-outline-danger"
						onClick={() => {
							if (newerVersion === undefined) return
							localStorage.setItem(
								'app:ignored_versions',
								JSON.stringify([...new Set([...ignored, newerVersion])]),
							)
							setIgnored((i) => [...new Set([...i, newerVersion])])
							setNewerVersion(undefined)
							console.log(`[App]`, `ignored newer version`, newerVersion)
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
