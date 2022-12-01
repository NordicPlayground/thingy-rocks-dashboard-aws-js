import styled from 'styled-components'

const Container = styled.div`
	width: 15vw;
	height: 15vw;
	max-width: 150px;
	max-height: 150px;
	min-width: 32px;
	min-height: 32px;
	position: absolute;
	z-index: 10000;
	left: 4vw;
	background-color: #fff;
	img {
		margin: 20% 13% 0 17%;
	}
	top: -1px;
`

export const Logo = () => (
	<Container>
		<img src="/static/logo.svg" alt="Nordic Semiconductor" />
	</Container>
)
