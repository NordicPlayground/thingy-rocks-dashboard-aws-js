import { Check, Lightbulb, Lock, UploadCloud, X } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { Device, useDevices } from './context/Devices'
import { LastUpdate, Title } from './DeviceList'
import { RelativeTime } from './RelativeTime'

export const LightbulbDevice = ({
	device,
	onClick,
}: {
	device: Device
	onClick: () => void
}) => {
	const { lastUpdateTs, alias } = useDevices()
	const lastUpdateTime = lastUpdateTs(device.id) as number
	const shortenedDeviceId =
		alias(device.id) ??
		device.id.replace(/^[\d]+\d{4}$/, (match) => `…${match.slice(-4)}`)
	const color = device.state?.led?.v ?? [0, 0, 0]
	return (
		<>
			<Title type={'button'} onClick={onClick}>
				<Lightbulb
					class={'mx-1'}
					color={`rgb(${color[0]},${color[1]},${color[2]})`}
				/>
				<span class="info">
					{shortenedDeviceId !== device.id && (
						<abbr title={device.id}>{shortenedDeviceId}</abbr>
					)}
					{shortenedDeviceId === device.id && <>{device.id}</>}
				</span>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
			</Title>
			<DeviceCodeForm />
		</>
	)
}

const DeviceCodeForm = () => {
	const [deviceCode, setDeviceCode] = useState<string>('')
	const [showForm, setShowForm] = useState<boolean>(false)

	if (!showForm)
		return (
			<button type="button" onClick={() => setShowForm(true)}>
				<Lock class={'mx-1 my-2'} /> Unlock
			</button>
		)
	return (
		<form>
			<label htmlFor={'deviceCode'}>Enter device code</label>
			<div class="input-group mb-3">
				<input
					type="text"
					class="form-control form-control-sm"
					id="deviceCode"
					placeholder="e.g. 'd3c4fb4d'"
					value={deviceCode}
					onChange={(e) => {
						setDeviceCode((e.target as HTMLInputElement).value)
					}}
				/>
				<div class="input-group-append">
					<button type="button" class={'btn'} onClick={() => setShowForm(true)}>
						<Check class={'mx-1 my-2'} />
					</button>
					<button
						type="button"
						class={'btn'}
						onClick={() => setShowForm(false)}
					>
						<X class={'mx-1 my-2'} />
					</button>
				</div>
			</div>
		</form>
	)
}
