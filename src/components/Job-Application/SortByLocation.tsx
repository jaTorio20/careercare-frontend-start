import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SortByLocationProps {
  sortLocation: string;
  setSortLocation: (location: string) => void;
}

const SortByLocation: React.FC<SortByLocationProps> = ({ sortLocation, setSortLocation }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const options = [
    { label: 'None', value: 'none' },
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Onsite', value: 'onsite' },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className={`inline-flex justify-between w-full sm:w-auto rounded-lg
         border border-transparent text-gray-700
          bg-white px-4 py-2 text-sm card-shadow-input
          ${dropdownOpen ? ' text-indigo-600' : ''}
          hover:bg-gray-50 focus:outline-none`}
        id="menu-button"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        {options.find((option) => option.value === sortLocation)?.label || 'Sort By Location'}
        {dropdownOpen ? (
          <ChevronDown className="-mr-1 ml-2 h-5 w-5 rotate-180 text-indigo-700 transition-transform duration-200" />
        ) : (
          <ChevronDown className="-mr-1 ml-2 h-5 w-5 transition-transform duration-200" />
        )}
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-sm focus:outline-none border border-indigo-400"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {options.map((option) => (
              <button
                key={option.value}
                className="block w-full px-4
                 py-2 text-sm text-indigo-600 hover:bg-gray-100 hover:text-gray-900 text-left"
                role="menuitem"
                onClick={() => {
                  setSortLocation(option.value);
                  setDropdownOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortByLocation;