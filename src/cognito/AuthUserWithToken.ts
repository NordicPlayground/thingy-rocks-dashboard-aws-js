import type { AuthUser } from 'aws-amplify/auth'

export type AuthUserWithToken = AuthUser & {
	idToken: string
	sub: string // e.g. 'c686cedd-8a1a-413f-a3ed-cb394b2a4d09',
	name: string // e.g. 'Alex Doe',
	['custom:mflt:hideExpChooser']?: '1' | '0'
	['custom:nrfcloud:userid']: string // e.g. '98b50972-a436-4832-a5c0-fa137a4d4a24',
}
