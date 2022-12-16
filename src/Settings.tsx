import { Settings2 } from 'lucide-preact'
import { useSettings } from './context/Settings'

export const Settings = () => {
	const {
		settings: {
			showSettings,
			enableTestDevice,
			gainReferenceEveryMinute,
			gainReferenceEveryHour,
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
					<h2>Chart: Gain reference</h2>
					<p>Configure the reference values shown in the Gain chart.</p>
					<p>Power consumption when sending updates:</p>
					<div class="mb-3">
						<div class="input-group">
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
					</div>
					<div class="mb-3">
						<div class="input-group">
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
					</div>
					<h2 class="mt-5">Developer settings</h2>
					<p>
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
					</p>
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
