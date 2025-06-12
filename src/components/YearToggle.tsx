"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Year {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface YearsData {
  categories: Record<string, Year>;
}

// Simple dropdown components without the complex DropdownMenu
function SimpleDropdown({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  return <div className="relative inline-block">{children}</div>;
}

function DropdownTrigger({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-50 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${className}`}
    >
      {children}
      <svg
        className="ml-1 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

function DropdownContent({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  return (
    <div
      className={`absolute right-0 z-50 mt-1 w-32 origin-top-right rounded-md border border-gray-600 bg-gray-800 shadow-lg transition-all duration-200 ${
        isOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}

function DropdownItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-full px-4 py-2 text-left text-sm text-gray-50 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none first:rounded-t-md last:rounded-b-md"
    >
      {children}
    </button>
  );
}

export function YearToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const [years, setYears] = useState<Year[]>([]);
  const [currentYear, setCurrentYear] = useState<string>("2025");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load available years
    fetch("/data/years.json")
      .then((res) => res.json())
      .then((data: YearsData) => {
        const yearsList = Object.values(data.categories);
        setYears(yearsList);
      })
      .catch((err) => console.error("Failed to load years:", err));

    // Extract current year from pathname
    const yearRegex = /\/year\/(\d{4})/;
    const yearMatch = yearRegex.exec(pathname);
    if (yearMatch) {
      setCurrentYear(yearMatch[1]);
    }
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleYearChange = (newYear: string) => {
    // If we're on a year-specific page, update the year in the path
    if (pathname.includes("/year/")) {
      const yearRegex = /\/year\/\d{4}/;
      const newPath = pathname.replace(yearRegex, `/year/${newYear}`);
      router.push(newPath);
    } else {
      // If we're on the main page, go to the year page
      router.push(`/year/${newYear}`);
    }
    setCurrentYear(newYear);
    setIsOpen(false);
  };

  const currentYearData = years.find(
    (year) => year.id.toString() === currentYear
  );

  return (
    <div ref={dropdownRef}>
      <SimpleDropdown isOpen={isOpen}>
        <DropdownTrigger
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs px-3 py-1 h-8"
        >
          {currentYearData?.title ?? currentYear}
        </DropdownTrigger>
        <DropdownContent isOpen={isOpen}>
          {years.map((year) => (
            <DropdownItem
              key={year.id}
              onClick={() => handleYearChange(year.id.toString())}
            >
              {year.title}
            </DropdownItem>
          ))}
        </DropdownContent>
      </SimpleDropdown>
    </div>
  );
}
