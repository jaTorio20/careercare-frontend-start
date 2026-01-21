import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getResumes } from '@/api/resumes'
import { Link } from '@tanstack/react-router'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Plus } from 'lucide-react'
import { ResumeSkeleton } from '@/components/Resume/ResumeSkeleton'
import { Suspense, useState } from 'react'
import SortBy from '@/components/SortBy'

const resumeQueryOptions = () => {
  return queryOptions({
    queryKey: ['resumes'],
    queryFn: () => getResumes(),
  })
}

export const Route = createFileRoute('/resumes/')({
  head: () => ({
    title: 'Resumes | CareerCare',
    meta: [
      { name: 'description', content: 'List of your uploaded resumes.' },
      { property: 'og:title', content: 'Resumes | CareerCare' },
      { property: 'og:description', content: 'List of your uploaded resumes.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Resumes | CareerCare' },
      { name: 'twitter:description', content: 'List of your uploaded resumes.' },
      { name: 'twitter:image', content: '/og-image.png' },
    ],
  }),

  // component: ResumesPage,
    component: () => (
    <ProtectedRoute>
      <Suspense fallback={<ResumeSkeleton />}>
        <ResumesPage />
      </Suspense>
    </ProtectedRoute>
  ),
})

function ResumesPage() {
  const { data: resumes } = useSuspenseQuery(resumeQueryOptions());
  const [sortOrder, setSortOrder] = useState('latest');

  const sortedResumes = [...resumes].sort((a, b) => {
    if (sortOrder === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  return (
  <div className="max-w-5xl mx-auto px-2 py-10">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        Uploaded Resumes
      </h1>
      <Link
        to="/resumes/analyze"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
         text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden md:inline">Upload Resume</span>
      </Link>
    </div>

    {/* Sort By Dropdown */}
    <div className="flex justify-end mb-6">
      <SortBy sortOrder={sortOrder} setSortOrder={setSortOrder} />
    </div>

    {/* Empty State */}
    {sortedResumes.length === 0 ? (
      <Link 
        to="/resumes/analyze"
        className="flex flex-col items-center justify-center py-16
        hover:border-indigo-400 
        border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <Plus className="w-12 h-12 hover:text-indigo-400 
        text-gray-400" />
        <p className="text-gray-500
        text-lg">No cover letters yet.</p>

      </Link>
    ) : (
      /* Responsive Grid of Resume Cards */
      <ul className="grid gap-6 sm:grid-cols-2">
        {sortedResumes.map((resume) => (
          <li
            key={resume._id}
            className="group relative
             bg-white border border-gray-200 
            rounded-xl shadow-sm hover:shadow-lg transition transform
                hover:-translate-y-1 p-6
              flex flex-col"
          >
            {/* Resume Title */}
            <p className="text-lg font-semibold text-gray-900 truncate">
              {resume.originalName}
            </p>

            {/* Metadata */}
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                Uploaded: {new Date(resume.createdAt).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">ID: {resume._id}</p>
            </div>

            {/* Action */}
            <Link
              to="/resumes/$resumeId"
              params={{ resumeId: resume._id }}
              className="mt-6 inline-block text-center px-4 py-2 
                text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
            >
              View Details
            </Link>

          </li>
        ))}
      </ul>
    )}
  </div>
            
  )
}
