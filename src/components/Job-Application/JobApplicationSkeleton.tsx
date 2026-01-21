export default function ApplicationsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-16 md:w-36 bg-gray-200 rounded animate-pulse" />
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