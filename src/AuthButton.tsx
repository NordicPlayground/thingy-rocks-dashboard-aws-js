import { LogIn, LogOut } from 'lucide-preact'
import { useAuth } from './context/Auth.tsx'

export const AuthButton = () => {
	const { isLoggedIn, signIn, signOut } = useAuth()

	return isLoggedIn ? (
		<button
			type="button"
			class="btn btn-link"
			onClick={() => void signOut()}
			title="Sign out"
		>
			<LogOut strokeWidth={2} />
		</button>
	) : (
		<button
			type="button"
			class="btn btn-link"
			onClick={() => void signIn()}
			title="Sign in"
		>
			<LogIn strokeWidth={2} />
		</button>
	)
}
