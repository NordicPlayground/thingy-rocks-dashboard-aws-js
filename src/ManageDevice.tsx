import {
	Check,
	FormInput,
	Lightbulb,
	LightbulbOff,
	Lock,
	ToggleLeft,
	ToggleRight,
	Unlock,
	X,
} from 'lucide-preact'
import { useState } from 'preact/hooks'
import styled from 'styled-components'
import type { Device } from './context/Devices'
import { useWebsocket } from './context/WebsocketConnection'

const LockIcon = styled.div`
	position: absolute;
	bottom: 0.5rem;
	right: 0.5rem;
`

export const ManageDevice = ({ device }: { device: Device }) => {
	const [showCodeInput, setShowCodeInput] = useState<boolean>(false)
	const [code, setCode] = useState<string>('')
	const { send } = useWebsocket()

	const key = `code:${device.id}`
	const unlocked = localStorage.getItem(key) !== null
	const ledIsOn =
		(device.state?.led?.v.reduce((total, c) => c + total, 0) ?? 0) > 0
	const [desiredLEDState, setDesiredLEDState] = useState<boolean>(false)

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
					<dd class="d-flex">
						<input
							type="password"
							class="form-control form-control-sm"
							value={code}
							onChange={(e) => setCode((e.target as HTMLInputElement).value)}
							autoComplete="off"
						/>
						<button
							type="button btn-link"
							onClick={() => {
								localStorage.removeItem(key)
								setShowCodeInput(false)
							}}
						>
							<X strokeWidth={1} />
						</button>
						<button
							type="button btn-link"
							onClick={() => {
								localStorage.setItem(key, code)
								setShowCodeInput(false)
							}}
						>
							<Check strokeWidth={1} />
						</button>
					</dd>
				</>
			)}
			{unlocked && (
				<>
					<dt>
						{ledIsOn && <Lightbulb strokeWidth={1} />}
						{!ledIsOn && <LightbulbOff strokeWidth={1} />}
					</dt>
					<dd>
						<button
							type="button btn-link"
							onClick={() => {
								setDesiredLEDState((s) => {
									const newState = !s

									send({
										desired: {
											led: {
												v: newState ? [255, 255, 255] : [0, 0, 0],
												ts: Date.now(),
											},
										},
										deviceId: device.id,
										code,
									})

									return newState
								})
							}}
						>
							{!desiredLEDState && <ToggleLeft />}
							{desiredLEDState && <ToggleRight />}
						</button>
					</dd>
				</>
			)}
		</>
	)
}
