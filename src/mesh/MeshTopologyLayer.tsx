import { X } from 'lucide-preact'
import styled from 'styled-components'
import { isMeshGateway, useDevices } from '../context/Devices'
import { useMeshTopology } from '../context/showMeshTopology'
import { FiveGMesh } from '../icons/5GMesh'
import { NRPlus } from '../icons/NRPlus'
import { MeshTopology } from './MeshTopology'

const Button = styled.button`
	color: var(--color-nordic-middle-grey);
	background-color: transparent;
	padding: 0;
	border: 0;
`
const Container = styled.div`
	background-color: var(--color-panel-bg);
	position: absolute;
	bottom: 0;
	left: 0;
	padding: 0 1rem 0 0;
	color: white;
	font-size: 12px;
	${Button} {
		position: absolute;
		right: 0;
		top: 0;
		padding: 1rem;
	}
	p {
		.logo {
			width: 50px;
			height: 50px;
			margin-bottom: 0.2rem;
		}
		span {
			opacity: 0.5;
		}
	}
	aside {
		margin: 0 1rem 0 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	section {
		display: flex;
		align-items: center;
	}
	footer {
		margin: 0 0 0 1rem;
		opacity: 0.8;
		font-size: 10px;
		a {
			color: inherit;
		}
	}
`

export const MeshTopologyLayer = () => {
	const { devices } = useDevices()
	const { hide, gatewayId } = useMeshTopology()

	if (gatewayId === undefined) return null

	const network = Object.values(devices).find(
		(device) => isMeshGateway(device) && device.id === gatewayId,
	)?.meshNodes
	if (network !== undefined)
		return (
			<Container>
				<section>
					<aside>
						<p>
							<FiveGMesh class="logo" />
							<br />
							<span>
								Wirepas
								<br />
								5G Mesh
							</span>
						</p>
						<p>
							<NRPlus class="logo" />
							<br />
							<span>DECT NR+</span>
						</p>
					</aside>
					<MeshTopology network={network.map((node) => node.state.meshNode)} />
				</section>
				<footer>
					<p>
						Visualization for illustrative purposes only.
						<br />
						Use the{' '}
						<a
							href="https://www.wirepas.com/wirepas-monitoring"
							target="_blank"
						>
							Wirepas Monitoring &amp; Network Tool
						</a>
						<br />
						for viewing the accurate network topology.
					</p>
				</footer>
				<Button type={'button'} onClick={() => hide()}>
					<X />
				</Button>
			</Container>
		)
	return null
}
