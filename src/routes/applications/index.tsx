import { createFileRoute } from '@tanstack/react-router'
import { getJobApplications } from '@/api/jobApplication/jobApplication'
import { Link } from '@tanstack/react-router'
import { StatusBadge } from '@/components/Job-Application/StatusBadge'
import ProtectedRoute from '@/components/ProtectedRoute'
import React, { useState, useEffect, useRef } from 'react'
import { Plus, Bell } from 'lucide-react'
import { queryOptions, useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import type { JobApplicationEntry } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'
import { Suspense } from 'react'
import ReminderModal from '@/components/Job-Application/Reminders/ReminderModal'
import { getRemindersByApplication, cancelReminder } from '@/api/jobApplication/jobReminder'
import SortBy from '@/components/SortBy';
import SortByLocation from '@/components/Job-Application/SortByLocation';
import ApplicationsSkeleton from '@/components/Job-Application/JobApplicationSkeleton';

const jobApplicationQueryOptions = () => {
  return queryOptions({
    queryKey: ['applications'],
    queryFn: () => getJobApplications(),
    staleTime: 0, // Ensure data is always fresh
    refetchOnWindowFocus: true, // Refetch data when the window regains focus
    refetchOnReconnect: true, // Refetch data when the network reconnects
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


const useReminders = (applicationId: string) => {
  return useSuspenseQuery({
    queryKey: ['reminders', applicationId],
    queryFn: () => getRemindersByApplication(applicationId),
    staleTime: 0, // Ensure fresh data
  });
};

function JobApplicationPage() {
  const { data: applications } = useSuspenseQuery(jobApplicationQueryOptions());
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 400);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobApplicationId, setSelectedJobApplicationId] = useState<string>('');

  const [cancelingReminders, setCancelingReminders] = useState<Record<string, boolean>>({});

  const [visibleApplications, setVisibleApplications] = useState(7); // Number of visible applications
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [sortOrder, setSortOrder] = useState('latest');
  const [sortLocation, setSortLocation] = useState('none');

  const { mutateAsync: cancelReminderAsync } = useMutation({
    mutationFn: async ({ applicationId, reminderId }: { applicationId: string; reminderId: string }) => {
      return cancelReminder(applicationId, reminderId);
    },
    onSuccess: async (_, { applicationId }) => {
      await queryClient.invalidateQueries({ queryKey: ['reminders', applicationId] });
    },
  });

  const handleCancelReminder = async (applicationId: string, reminderId: string) => {
    if (!applicationId || !reminderId) {
      console.error('Invalid applicationId or reminderId:', applicationId, reminderId);
      return;
    }

    setCancelingReminders((prev) => ({ ...prev, [reminderId]: true }));

    try {
      await cancelReminderAsync({ applicationId, reminderId });

      await queryClient.invalidateQueries({ queryKey: ['reminders', applicationId] });
      await queryClient.refetchQueries({ queryKey: ['reminders', applicationId] });
    } finally {
      setCancelingReminders((prev) => ({ ...prev, [reminderId]: false }));
    }
  };

  // Filter and sort applications client-side
  const sortedApplications = [...applications]
    .filter((app) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        app.jobTitle.toLowerCase().includes(searchLower) ||
        app.companyName.toLowerCase().includes(searchLower)
      );
    })
    .filter((app) => {
      if (sortLocation === 'none') return true;
      return app.location.toLowerCase() === sortLocation;
    })
    .sort((a, b) => {
      if (sortOrder === 'latest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
    });

  // Lazy load more applications
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleApplications((prev) => Math.min(prev + 2, sortedApplications.length));
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [sortedApplications.length]);

  // Pre-fetch reminders for all applications
  const reminders = Object.fromEntries(
    applications.map((app) => [app._id, useReminders(app._id)])
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleDropdownToggle = (dropdownId: string) => {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      const isHidden = dropdown.classList.contains("hidden");
      document.querySelectorAll("[id^='dropdown-']").forEach((el) => el.classList.add("hidden")); // Close other dropdowns
      if (isHidden) {
        dropdown.classList.remove("hidden");
      } else {
        dropdown.classList.add("hidden");
      }
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest("[id^='dropdown-']") && !target.closest(".dropdown-toggle")) {
      document.querySelectorAll("[id^='dropdown-']").forEach((el) => el.classList.add("hidden"));
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

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

      <div className="mb-6 flex flex-col sm:flex-row justify-end gap-3 w-full">
        {/* Input wrapper */}
        <div className="relative w-full sm:max-w-sm">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by job title or company..."
            className="w-full rounded-lg card-shadow-input border border-transparent px-4 pr-10 py-2 
            text-sm focus:border-indigo-600 focus:outline-none 
             bg-white"
          />

          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort dropdown */}
          <div className="w-full sm:w-auto flex justify-end relative gap-2">
          <SortBy
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          {/* Sort by Location */}
          <SortByLocation
            sortLocation={sortLocation}
            setSortLocation={setSortLocation}
          />
        </div>
      </div>


      {sortedApplications.length === 0 ? (
        <p className="text-gray-500 text-center">
          {search ? 'No matching applications found.' : 'No applications found.'}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 ">
          {sortedApplications.slice(0, visibleApplications).map((jobApplication: JobApplicationEntry) => {
            const appReminders = reminders[jobApplication._id]?.data;

            return (
              <div
                key={jobApplication._id}
                className="flex flex-col justify-between
                  rounded-xl bg-white px-6 py-4 hover:border-indigo-400 
                  border border-transparent
                 card-shadow hover:shadow transition transform
                  hover:-translate-y-1"
              >
                <div className='flex justify-between mb-6'>
                  <button className='cursor-pointer' 
                    onClick={() => {
                      setIsModalOpen(true);
                      setSelectedJobApplicationId(jobApplication._id);
                    }}>
                    <Bell className='h-5 w-5 text-indigo-600 hover:text-indigo-800'/>
                  </button>
                  <div>
                    {appReminders && appReminders.length > 0 ? (
                      <div className="relative text-sm text-gray-500">
                        {appReminders[0].status === "pending" && (
                          <button 
                            onClick={() => handleCancelReminder(jobApplication._id, appReminders[0]._id)}
                            disabled={cancelingReminders[appReminders[0]._id]}
                            className="text-red-600 hover:text-red-800 mr-4 cursor-pointer"
                          >
                            {cancelingReminders[appReminders[0]._id] ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                        {appReminders[0].status !== "cancelled" && (
                        <button
                          className="dropdown-toggle text-indigo-600 hover:text-indigo-800 focus:outline-none cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDropdownToggle(`dropdown-${jobApplication._id}`);
                          }}
                        >
                          View Status
                        </button>
                        )}
                        <div
                          id={`dropdown-${jobApplication._id}`}
                          className={`absolute z-10 mt-0 ${appReminders[0].status === "pending" ? "-left-16" : "-left-30"} w-48 bg-white border border-gray-200 rounded shadow-lg hidden`}
                        >
                          <div className="px-4 py-2">
                            <p> {new Date(appReminders[0].reminderDate).toLocaleDateString()} {new Date(appReminders[0].reminderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p>Type: {appReminders[0].type}</p>
                            <p>Status: {appReminders[0].status}</p>
                            {appReminders[0].remindBefore !== "none" && (
                              <p>Remind Before: {appReminders[0].remindBefore}</p>
                            )}
                            {appReminders[0].remindBeforeSent && (
                              <p>Remind Before Sent: Yes</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No reminders set.</div>
                    )}
                  </div>
                </div>

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
            );
          })}
        </div>
      )}

      {visibleApplications < sortedApplications.length && (
        <div ref={loadMoreRef} className="flex justify-center mt-6">
          <div className="loader animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {isModalOpen && (
        <ReminderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          jobApplication={{ jobApplicationId: selectedJobApplicationId }}
        />
      )}
    </div>
  );
}