import { Ulid } from 'id128'
import { useEffect, useRef } from 'preact/hooks'
import { useDevices, type Reported, type Summary } from '../context/Devices'
import { useSettings } from '../context/Settings'

export const FakeDevice = ({
	fakeState,
	fakeHistory,
}: {
	fakeState: () => Reported
	fakeHistory?: () => Summary
}) => {
	const { updateHistory, updateState } = useDevices()
	const deviceId = useRef<string>(
		`test-${Ulid.generate().toCanonical().slice(-8)}`,
	)
	const {
		settings: { enableTestDevice },
	} = useSettings()

	const fakeData = () => {
		updateState(deviceId.current, fakeState())
		if (fakeHistory !== undefined)
			updateHistory(deviceId.current, fakeHistory())
	}

	useEffect(() => {
		if (!enableTestDevice) return

		console.log(`[Test Device]`, 'enabled', deviceId.current)

		fakeData()
		const i = setInterval(() => {
			fakeData()
		}, 60 * 1000)

		return () => {
			console.log(`[Test Device]`, 'disabled', deviceId.current)
			clearInterval(i)
		}
	}, [enableTestDevice])
	return null
}
