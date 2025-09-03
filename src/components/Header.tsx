import { Link } from '@tanstack/react-router'
import { useAuthContext } from '@/auth/AuthProvider'

import { useNavigate } from '@tanstack/react-router'

export default function Header() {
  const { user, signOut } = useAuthContext()
  const navigate = useNavigate()
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between items-center">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>
      </nav>
      <div className="text-sm">
        {user ? (
          <button
            onClick={async () => {
              await signOut()
              navigate({ to: '/login', replace: true })
            }}
            className="underline"
          >
            Sign out
          </button>
        ) : (
          <Link to="/login" className="underline">Login</Link>
        )}
      </div>
    </header>
  )
}

