import { CloudOff, Zap } from 'lucide-preact'
import styled from 'styled-components'
import { useWebsocket } from './context/WebsocketConnection'

const StyledFooter = styled.footer`
	color: var(--highlight);
	position: absolute;
	bottom: 0;
	left: 0;
	z-index: 1000;
	font-family: 'Share Tech Mono', monospace;
	padding: 1rem;
`

const Disconnected = styled.span`
	color: var(--error);
`

export const Footer = () => {
	const { connected } = useWebsocket()
	return (
		<StyledFooter>
			{connected && (
				<>
					<Zap /> Connected
				</>
			)}
			{!connected && (
				<Disconnected>
					<CloudOff />
					Not connected
				</Disconnected>
			)}
		</StyledFooter>
	)
}
