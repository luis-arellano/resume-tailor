"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  HomeIcon, 
  DocumentTextIcon, 
  BriefcaseIcon, 
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Editor", href: "/dashboard", icon: PencilSquareIcon },
  { name: "Resumes", href: "/dashboard/resumes", icon: DocumentTextIcon },
  { name: "Job Applications", href: "/dashboard/job_applications", icon: BriefcaseIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: ChartBarIcon },
  // { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function SideMenu() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`flex flex-col h-screen ${isCollapsed ? 'w-12' : 'w-36'} bg-white border-r border-grey transition-all duration-300`}>
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        <nav className="flex-1 px-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-gray-100 text-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`flex-shrink-0 h-4 w-4 ${
                    isActive ? "text-black" : "text-gray-400 group-hover:text-black"
                  }`}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span className="ml-2 text-xs">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 