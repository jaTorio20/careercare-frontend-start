import { HeadContent, Outlet, Scripts, createRootRouteWithContext, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/context/AuthContext'
import Header from '@/components/Header'

import appCss from '@/styles.css?url'

type RouterContext = {
  queryClient: QueryClient
}

import ErrorPage from '@/components/ErrorPage'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CareerCare AI Automation Dashboard',
      },
      {
        name: 'description',
        content: 'CareerCare helps you analyze resumes, generate cover letters, track job applications, and practice interviews using AI.',
      },
      // Open Graph meta tags (for social sharing & SEO)
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'CareerCare AI Automation Dashboard',
      },
      {
        property: 'og:description',
        content: 'CareerCare helps you analyze resumes, generate cover letters, track job applications, and practice interviews using AI.',
      },
      {
        property: 'og:image',
        content: '/og-image.png',
      },
      {
        property: 'og:site_name',
        content: 'CareerCare',
      },
      // Twitter Card meta tags
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'CareerCare AI Automation Dashboard',
      },
      {
        name: 'twitter:description',
        content: 'CareerCare helps you analyze resumes, generate cover letters, track job applications, and practice interviews using AI.',
      },
      {
        name: 'twitter:image',
        content: '/og-image.png',
      },
      // Additional SEO
      {
        name: 'keywords',
        content: 'CareerCare, AI resume analyzer, cover letter generator, job application tracker, interview practice, AI job search',
      },
      {
        name: 'author',
        content: 'CareerCare',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: ErrorPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext()
  
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-full rounded-2xl">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" theme="light" richColors />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-4xl font-bold text-gray-800">
        404
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Ooops! The page you are looking for does not exist
      </p>
      <div className='mb-6'>
        <img     
        src="/tent.svg" 
        alt="Tent illustration" 
        className="max-w-xs md:max-w-sm lg:max-w-md mx-auto"/>
      </div>

      <Link to='/' className='px-6 py-2 bg-blue-600 text-white rounded-md 
        hover:bg-blue-700 transition'>
        Go Back Home
      </Link>
    </div>
  )
}
