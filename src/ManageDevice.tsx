import {
	Check,
	FormInput,
	Lightbulb,
	LightbulbOff,
	Lock,
	Palette,
	ToggleLeft,
	ToggleRight,
	Unlock,
	X,
} from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import type { Device } from './context/Devices'
import { useWebsocket } from './context/WebsocketConnection'
import { hexToRGB } from './hexToRGB'
import { RGB, rgbToHex } from './rgbToHex'

const LockIcon = styled.div`
	position: absolute;
	bottom: 0.5rem;
	right: 0.5rem;
`

const ColorInput = styled.input`
	border: 0;
	width: 25px;
	height: 25px;
	margin-right: 0.5rem;
`

const isOn = (color: RGB) => (color.reduce((total, c) => c + total, 0) ?? 0) > 0

export const ManageDevice = ({
	device,
	led,
	onLockChange,
}: {
	device: Device
	led?: 'rgb' | 'on/off'
	onLockChange?: (unlocked: boolean) => void
}) => {
	const storageKey = `code:${device.id}`
	const [showCodeInput, setShowCodeInput] = useState<boolean>(false)
	const [code, setCode] = useState<string>(
		localStorage.getItem(storageKey) ?? '',
	)
	const { send } = useWebsocket()

	const unlocked = localStorage.getItem(storageKey) !== null
	const ledIsOn = isOn(device.state?.led?.v?.color ?? [0, 0, 0])
	const [desiredLEDColor, setDesiredLEDColor] = useState<
		[number, number, number]
	>(device.state?.led?.v?.color ?? [0, 0, 0])
	const desiredOn = isOn(desiredLEDColor)

	useEffect(() => {
		onLockChange?.(unlocked)
	}, [unlocked])

	return (
		<>
			{!showCodeInput && (
				<LockIcon>
					<button class="btn btn-link" onClick={() => setShowCodeInput(true)}>
						{!unlocked && <Lock strokeWidth={1} />}
						{unlocked && <Unlock strokeWidth={1} />}
					</button>
				</LockIcon>
			)}
			{showCodeInput && (
				<>
					<dt>
						<abbr title="Enter code">
							<FormInput strokeWidth={1} />
						</abbr>
					</dt>
					<dd>
						<form
							class="d-flex"
							onSubmit={() => {
								return false
							}}
						>
							<input
								type="text"
								class="form-control form-control-sm"
								value={code}
								onChange={(e) => {
									const code = (e.target as HTMLInputElement).value
									setCode(code)
									localStorage.setItem(storageKey, code)
								}}
								name={`code-${device.id}`}
							/>
							<button
								type="button btn-link"
								onClick={() => {
									localStorage.removeItem(storageKey)
									setShowCodeInput(false)
								}}
							>
								<X strokeWidth={1} />
							</button>
							<button
								type="button btn-link"
								onClick={() => {
									localStorage.setItem(storageKey, code)
									setShowCodeInput(false)
								}}
							>
								<Check strokeWidth={1} />
							</button>
						</form>
					</dd>
				</>
			)}
			{unlocked && led === 'on/off' && (
				<>
					<dt>
						{ledIsOn && <Lightbulb strokeWidth={1} />}
						{!ledIsOn && <LightbulbOff strokeWidth={1} />}
					</dt>
					<dd>
						<button
							type="button btn-link"
							onClick={() => {
								setDesiredLEDColor((s) => {
									const newState = !isOn(s)
									const v: RGB = newState ? [255, 255, 255] : [0, 0, 0]
									send({
										desired: {
											led: {
												color: v,
											},
										},
										deviceId: device.id,
										code,
									})

									return v
								})
							}}
						>
							{!desiredOn && <ToggleLeft />}
							{desiredOn && <ToggleRight />}
						</button>
					</dd>
				</>
			)}
			{unlocked && led === 'rgb' && (
				<>
					<dt>
						<Palette strokeWidth={1} />
					</dt>
					<dd class="d-flex">
						<ColorInput
							type="color"
							value={`#${rgbToHex(desiredLEDColor)}`}
							onChange={(e: Event) => {
								setDesiredLEDColor(
									hexToRGB((e.target as HTMLInputElement).value),
								)
							}}
						/>
						<button
							type="button btn-link"
							onClick={() => {
								send({
									desired: {
										led: {
											v: { color: desiredLEDColor },
										},
									},
									deviceId: device.id,
									code,
								})
							}}
						>
							<Check strokeWidth={1} />
						</button>
					</dd>
				</>
			)}
		</>
	)
}
