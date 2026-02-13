import type { AuthUser } from 'aws-amplify/auth'

export type InitAuthFn = () => Promise<AuthUser | null>
