import {
	withIdentityPoolId,
	type MapAuthHelper,
	type SDKAuthHelper,
} from '@aws/amazon-location-utilities-auth-helper'
import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'

export type AuthHelper = MapAuthHelper & SDKAuthHelper

export const WithMapAuthHelper = ({
	children,
}: {
	children: (authHelper: AuthHelper) => ComponentChildren
}) => {
	const [authHelper, setAuthHelper] = useState<AuthHelper>()

	useEffect(() => {
		withIdentityPoolId(COGNITO_IDENTITY_POOL_ID)
			.then(setAuthHelper)
			.catch(console.error)
	}, [])

	if (authHelper === undefined) return null

	return <>{children(authHelper)}</>
}
