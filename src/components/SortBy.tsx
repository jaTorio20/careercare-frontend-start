import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SortByProps {
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const SortBy: React.FC<SortByProps> = ({ sortOrder, setSortOrder }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-between w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none"
        id="menu-button"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        {sortOrder === 'latest' ? 'Latest' : 'Oldest'}
        {dropdownOpen ? (
          <ChevronDown className="-mr-1 ml-2 h-5 w-5 rotate-180 transition-transform duration-200" />
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
            <button
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-left"
              role="menuitem"
              onClick={() => {
                setSortOrder('latest');
                setDropdownOpen(false);
              }}
            >
              Latest
            </button>
            <hr className="text-indigo-200" />
            <button
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-left"
              role="menuitem"
              onClick={() => {
                setSortOrder('oldest');
                setDropdownOpen(false);
              }}
            >
              Oldest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortBy;