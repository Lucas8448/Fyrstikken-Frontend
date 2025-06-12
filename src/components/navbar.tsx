"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { YearToggle } from "./YearToggle";

export default function Navbar() {
  const pathname = usePathname();

  // Extract current year from pathname, default to 2025
  const yearRegex = /\/year\/(\d{4})/;
  const yearMatch = yearRegex.exec(pathname);
  const currentYear = yearMatch?.[1] ?? "2025";

  return (
    <div className="sticky top-0 px-4 lg:px-6 h-14 flex items-center bg-gray-900 text-gray-50 z-50">
      <Link className="flex items-center justify-center" href="/">
        <FilmIcon className="h-6 w-6" />
        <span className="sr-only">Fyrstikken</span>
      </Link>

      {/* Centered navigation */}
      <nav className="flex-1 flex justify-center">
        <div className="flex gap-4 sm:gap-6 items-center">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/"
          >
            Hjem
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href={`/year/${currentYear}#categories`}
          >
            Kategorier
          </Link>
        </div>
      </nav>

      {/* Right side - Year toggle */}
      <div className="flex items-center">
        <YearToggle />
      </div>
    </div>
  );
}

function FilmIcon(props: Readonly<React.ComponentProps<"svg">>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}
