import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { AuthProvider } from '@/auth/AuthProvider'

import Header from '../components/Header'

export const Route = createRootRoute({
  component: () => {
    const location = useLocation()
    const hideHeader = location.pathname === '/login' || location.pathname === '/'

    return (
      <AuthProvider>
        {!hideHeader && <Header />}
        <Outlet />
        <TanstackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </AuthProvider>
    )
  },
})
