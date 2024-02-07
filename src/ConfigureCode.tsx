import { Check, KeyRound, X } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { useSettings } from './context/Settings.js'

export const ConfigureCode = ({
	device,
	onCode,
}: {
	device: { id: string }
	onCode: (code: string | null) => void
}) => {
	const {
		update,
		settings: { managementCodes },
	} = useSettings()
	const [deviceCode, setDeviceCode] = useState<string>(
		managementCodes[device.id] ?? '',
	)
	return (
		<>
			<dt>
				<KeyRound strokeWidth={1} class="ms-2 p-1" />
			</dt>
			<dd class="d-flex my-2">
				<form autoComplete="off">
					<input
						type="password"
						autoComplete="off"
						class="form-control form-control-sm me-2"
						value={deviceCode}
						onInput={(e) => setDeviceCode((e.target as HTMLInputElement).value)}
					/>
					<button
						type="button"
						onClick={() => {
							console.log({ device: device.id, deviceCode })
							onCode(deviceCode)
							update({
								managementCodes: {
									...managementCodes,
									[device.id]: deviceCode,
								},
							})
						}}
					>
						<Check strokeWidth={1} />
					</button>
					<button
						type="button"
						onClick={() => {
							onCode(null)
							const codes = { ...managementCodes }
							delete codes[device.id]
							update({
								managementCodes: codes,
							})
						}}
					>
						<X strokeWidth={1} />
					</button>
				</form>
			</dd>
		</>
	)
}
