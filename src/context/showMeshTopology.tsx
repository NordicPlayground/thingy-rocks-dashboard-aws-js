import { ComponentChildren, createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

export const MeshTopologyContext = createContext<{
	gatewayId?: string | undefined
	show: (gatewayId: string) => void
	hide: () => void
	toggle: (gatewayId: string) => void
}>({
	show: () => undefined,
	hide: () => undefined,
	toggle: () => undefined,
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [gatewayId, setGatewayId] = useState<string>()

	return (
		<MeshTopologyContext.Provider
			value={{
				gatewayId,
				show: (gatewayId) => {
					setGatewayId(gatewayId)
				},
				hide: () => {
					setGatewayId(undefined)
				},
				toggle: (showGatewayId) => {
					gatewayId === undefined
						? setGatewayId(showGatewayId)
						: showGatewayId === gatewayId
						? setGatewayId(undefined)
						: setGatewayId(showGatewayId)
				},
			}}
		>
			{children}
		</MeshTopologyContext.Provider>
	)
}

export const Consumer = MeshTopologyContext.Consumer

export const useMeshTopology = () => useContext(MeshTopologyContext)
