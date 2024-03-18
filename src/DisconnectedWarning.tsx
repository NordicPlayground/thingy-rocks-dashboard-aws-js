import { CloudOff } from 'lucide-preact'
import { styled } from 'styled-components'
import { useWebsocket } from './context/WebsocketConnection.js'

const Disconnected = styled.div`
	color: var(--color-nordic-red);
	display: flex;
	align-items: center;
	flex-direction: column;
	margin-bottom: 1rem;
`

export const DisconnectedWarning = () => {
	const { connected } = useWebsocket()

	if (connected) return null
	return (
		<Disconnected>
			<CloudOff />
			<span>Not connected</span>
		</Disconnected>
	)
}
