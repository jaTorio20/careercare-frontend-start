import { createFileRoute } from '@tanstack/react-router'
import { getCoverLetter } from '@/api/coverLetter'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Plus } from 'lucide-react'
import { CoverLetterSkeleton } from '@/components/cover-letter/CoverLetterSkeleton'
import { Suspense, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { X } from 'lucide-react'
import SortBy from '@/components/SortBy';

const coverLetterQueryOptions = () => {
  return queryOptions({
    queryKey: ["cover-letters"],
    queryFn: () => getCoverLetter(),
  })
};

export const Route = createFileRoute('/cover-letter/')({
  head: () => ({
    title: 'Cover Letters | CareerCare',
    meta: [
      { name: 'description', content: 'List of your AI-generated cover letters.' },
      { property: 'og:title', content: 'Cover Letters | CareerCare' },
      { property: 'og:description', content: 'List of your AI-generated cover letters.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Cover Letters | CareerCare' },
      { name: 'twitter:description', content: 'List of your AI-generated cover letters.' },
      { name: 'twitter:image', content: '/og-image.png' },
    ],
  }),

  component: () => (
    <ProtectedRoute>
      <Suspense fallback={<CoverLetterSkeleton />}>
        <CoverLetterPage />
      </Suspense>
    </ProtectedRoute>
  ),

});


function CoverLetterPage() {
  const { data: letters } = useSuspenseQuery(coverLetterQueryOptions());
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const search = useDebounce(searchInput, 400);

  const sortedAndFilteredLetters = [...letters]
    .filter((letter) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        letter.jobTitle.toLowerCase().includes(searchLower) ||
        letter.companyName.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'latest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
    });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cover Letters</h1>
        <Link
          to="/cover-letter/generate"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm 
          font-medium text-white bg-indigo-600 rounded-lg shadow
           hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Cover Letter</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-end gap-3 w-full">
        {/* Input wrapper */}
        <div className="relative w-full sm:max-w-sm">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full rounded-lg border border-transparent px-4 pr-10 py-2
             text-sm focus:outline-none 
             focus:border-indigo-500
              bg-white card-shadow-input"
          />

          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="w-full sm:w-auto flex justify-end relative">
          <SortBy sortOrder={sortOrder} setSortOrder={setSortOrder} />
        </div>
      </div>


      {/* Filtered Letters */}
      {sortedAndFilteredLetters.length === 0 ? (
        <p className="text-gray-500 text-center">No matching cover letters found.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAndFilteredLetters.map((letter) => (
            <li
              key={letter._id}
              className="group relative bg-white border border-transparent
              card-shadow
              rounded-xl hover:shadow-lg transition-shadow 
              p-6 flex flex-col"
            >
              <Link to={letter._id} className="flex flex-col h-full">
                {/* Job Info */}
                <p className="text-md font-semibold text-gray-900 mb-2">
                  {letter.jobTitle || "Untitled Position"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Company:</span> {letter.companyName}
                </p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {letter.jobDescription}
                </p>

                {/* Footer */}
                <div className="mt-auto text-xs text-gray-500">
                  Updated: {new Date(letter.updatedAt).toLocaleString()}
                </div>
              </Link>

              {/* Decorative hover ring */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-transparent
               group-hover:ring-indigo-500 transition pointer-events-none"></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
