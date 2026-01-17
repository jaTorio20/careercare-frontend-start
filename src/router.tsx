import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a query client for SSR
export const getQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  })
}

// Create a new router instance
export const getRouter = () => {
  const queryClient = getQueryClient()
  
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
