import { ChevronUp, Settings2, Star, StarOff } from 'lucide-preact'
import { useDevices } from './context/Devices'
import { useSettings } from './context/Settings'

export const Settings = () => {
	const { devices, alias } = useDevices()
	const {
		settings: {
			showSettings,
			enableTestDevice,
			gainReferenceEveryMinute,
			gainReferenceEveryHour,
			showFavorites,
			favorites,
		},
		update,
		reset,
	} = useSettings()
	if (!showSettings) return null
	return (
		<aside class="fixed-top mx-auto my-5 w-50">
			<div class="card">
				<div class="card-header">
					<h1 class="card-title h5 mt-2">Settings</h1>
				</div>
				<div class="card-body">
					<h2>Visible devices</h2>
					<div class="form-check">
						<input
							class="form-check-input"
							type="checkbox"
							id="showFavorites"
							checked={showFavorites}
							onClick={() => update({ showFavorites: !showFavorites })}
						/>
						<label class="form-check-label" htmlFor="showFavorites">
							Show only favorited devices?
						</label>
					</div>
					{showFavorites && (
						<ul class="list-group">
							{Object.keys(devices)
								.sort((id1, id2) => {
									const i1 = favorites.indexOf(id1)
									const i2 = favorites.indexOf(id2)
									if (i1 === -1) return Number.MAX_SAFE_INTEGER
									if (i2 === -1) return -Number.MAX_SAFE_INTEGER
									return i1 - i2
								})
								.map((id, i) => {
									const favorited = favorites.includes(id)
									return (
										<li class="list-group-item d-flex justify-content-between align-items-center ">
											<button
												type="button"
												class="btn btn-link"
												onClick={() => {
													if (favorited) {
														update({
															favorites: favorites
																.filter((i) => i !== id)
																.filter(Boolean),
														})
													} else {
														update({ favorites: [...favorites, id] })
													}
												}}
											>
												{favorited ? <Star /> : <StarOff />}
											</button>
											<span class="flex-grow-1">{alias(id) ?? id}</span>
											{i > 0 && favorited && (
												<button
													type="button"
													class="btn btn-link"
													onClick={() => {
														const index = favorites.indexOf(id)
														const prev = favorites[index - 1] as string
														update({
															favorites: [
																...favorites.slice(0, index - 1),
																id,
																prev,
																...favorites.slice(index + 1),
															].filter(Boolean),
														})
													}}
												>
													<ChevronUp />
												</button>
											)}
										</li>
									)
								})}
						</ul>
					)}
					<h2 class="mt-5">Chart: Gain reference</h2>
					<p>Configure the reference values shown in the Gain chart.</p>
					<p>Power consumption when sending updates:</p>
					<div class="mb-3 input-group">
						<span class="input-group-text">every minute</span>
						<input
							type="number"
							class="form-control"
							id="gainReferenceEveryMinute"
							placeholder="e.g. '2 mA'"
							step={0.1}
							min={0}
							value={gainReferenceEveryMinute}
							onChange={(e) => {
								update({
									gainReferenceEveryMinute: parseFloat(
										(e.target as HTMLInputElement).value,
									),
								})
							}}
						/>
						<span class="input-group-text">mA</span>
					</div>
					<div class="mb-3 input-group">
						<span class="input-group-text">every hour</span>
						<input
							type="number"
							class="form-control"
							id="gainReferenceEveryHour"
							placeholder="e.g. '1 mA'"
							step={0.1}
							min={0}
							value={gainReferenceEveryHour}
							onChange={(e) => {
								update({
									gainReferenceEveryHour: parseFloat(
										(e.target as HTMLInputElement).value,
									),
								})
							}}
						/>
						<span class="input-group-text">mA</span>
					</div>
					<h2 class="mt-5">Developer settings</h2>
					<div class="form-check">
						<input
							class="form-check-input"
							type="checkbox"
							id="showTestDevice"
							checked={enableTestDevice}
							onClick={() => update({ enableTestDevice: !enableTestDevice })}
						/>
						<label class="form-check-label" htmlFor="showTestDevice">
							Show test device?
						</label>
					</div>
				</div>
				<div class="card-footer d-flex justify-content-between">
					<button
						type="button"
						class="btn btn-outline-danger"
						onClick={() => {
							reset()
						}}
					>
						Reset
					</button>
					<button
						type="button"
						class="btn btn-outline-secondary"
						onClick={() => {
							update({ showSettings: false })
						}}
					>
						Close
					</button>
				</div>
			</div>
		</aside>
	)
}

/**
 * Toggle the settings UI
 */
export const SettingsButton = () => {
	const {
		update,
		settings: { showSettings },
	} = useSettings()
	return (
		<button
			type={'button'}
			class="btn btn-link"
			onClick={() => {
				update({ showSettings: !showSettings })
			}}
		>
			<Settings2 strokeWidth={2} size={32} />
		</button>
	)
}
