import { Check, X } from 'lucide-preact'
import { useState } from 'preact/hooks'
import type { Device } from './context/Devices'
import { useSettings } from './context/Settings'

export const CodeInput = ({ device }: { device: Device }) => {
	const {
		update,
		settings: { managementCodes },
	} = useSettings()
	const currentCode = managementCodes[device.id]
	const [code, setCode] = useState<string>(currentCode ?? '')
	return (
		<form class="d-flex mb-2 mt-2" autocomplete={'off'}>
			<div class="input-group">
				<span class="input-group-text">{device.id}</span>
				<input
					type="password"
					autocomplete={'off'}
					class="form-control form-control-sm"
					value={code}
					onChange={(e) => {
						const code = (e.target as HTMLInputElement).value
						setCode(code)
					}}
					name={`code-${device.id}`}
				/>
			</div>
			{(currentCode?.length ?? 0) > 0 && (
				<button
					type="button"
					class="btn btn-link"
					onClick={() => {
						const newCodes = { ...managementCodes }
						delete newCodes[device.id]
						update({
							managementCodes: newCodes,
						})
						setCode('')
					}}
				>
					<X strokeWidth={1} />
				</button>
			)}
			<button
				type="button"
				class="btn  btn-link"
				onClick={() => {
					update({
						managementCodes: {
							...managementCodes,
							[device.id]: code,
						},
					})
				}}
			>
				<Check strokeWidth={1} />
			</button>
		</form>
	)
}
