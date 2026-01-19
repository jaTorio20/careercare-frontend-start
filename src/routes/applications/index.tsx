import { createFileRoute } from '@tanstack/react-router'
import { getJobApplications } from '@/api/jobApplication'
import { Link } from '@tanstack/react-router'
import { StatusBadge } from '@/components/Job-Application/StatusBadge'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import type { JobApplicationEntry } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'
import { Suspense } from 'react'

const jobApplicationQueryOptions = () => {
  return queryOptions({
    queryKey: ['applications'],
    queryFn: () => getJobApplications(),
  })
}

export const Route = createFileRoute('/applications/')({
  head: () => ({
    title: 'Job Applications | CareerCare',
    meta: [
      { name: 'description', content: 'List of your job applications.' },
      { property: 'og:title', content: 'Job Applications | CareerCare' },
      { property: 'og:description', content: 'List of your job applications.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Job Applications | CareerCare' },
      { name: 'twitter:description', content: 'List of your job applications.' },
      { name: 'twitter:image', content: '/og-image.png' },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <Suspense fallback={<ApplicationsSkeleton />}>
        <JobApplicationPage />
      </Suspense>
    </ProtectedRoute>
  ),
})

function ApplicationsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function JobApplicationPage() {
  const { data: applications } = useSuspenseQuery(jobApplicationQueryOptions())
  
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)

  // Filter applications client-side
  const filteredApplications = applications.filter((app) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      app.jobTitle.toLowerCase().includes(searchLower) ||
      app.companyName.toLowerCase().includes(searchLower)
    )
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Job Applications</h1>
        <Link
          to="/applications/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm
          font-semibold text-white bg-indigo-600
           rounded-md shadow-sm hover:bg-indigo-700 
           focus:outline-none transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Application</span>
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between relative sm:max-w-sm w-full">
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search by job title or company..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        />
        
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        )}
      </div>

      {filteredApplications.length === 0 ? (
        <p className="text-gray-500 text-center">
          {search ? 'No matching applications found.' : 'No applications found.'}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((jobApplication: JobApplicationEntry) => (
            <div
              key={jobApplication._id}
              className="flex flex-col justify-between border
               border-gray-200 rounded-xl bg-white p-6 
               shadow-sm hover:shadow-lg transition transform
                hover:-translate-y-1"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {jobApplication.jobTitle}{' '}
                  <span className="text-gray-500 font-normal">@ {jobApplication.companyName}</span>
                </h2>
                <div className="flex items-center gap-2 mt-3">
                  <StatusBadge status={jobApplication.status} />
                  <span className="text-sm text-gray-500">{jobApplication.location}</span>
                </div>
              </div>

              <Link
                to={`/applications/$applicationId`}
                params={{ applicationId: jobApplication._id }}
                className="mt-6 inline-block text-center px-4 py-2 
                text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}