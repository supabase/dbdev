import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { cn } from "~/lib/utils";

export interface PackageCardProps {
  pkg: any;
  className?: string;
}

const PackageCard = ({ pkg, className }: PackageCardProps) => {
  return (
    <Link
      key={pkg.name}
      href={`/${pkg.handle}/${pkg.partial_name}`}
      className={cn(
        "col-span-4 bg-gradient-to-br from-white via-white to-gray-100 rounded-lg px-6 py-5 transition duration-300 group hover:shadow-xl opacity-90 hover:opacity-100 border border-gray-200",
        "dark:from-slate-600 dark:to-slate-800 dark:border-slate-800",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <p className="font-medium dark:text-white">{pkg.partial_name} </p>
          {pkg.version && (
            <>
              <p className="text-gray-400 font-normal">•</p>
              <p className="text-gray-400 font-normal">{pkg.version}</p>
            </>
          )}
        </div>
        <ArrowTopRightOnSquareIcon
          className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition"
          aria-hidden="true"
        />
      </div>
      <p className="text-gray-400">{pkg.handle}</p>
      <p className="text-gray-600 dark:text-gray-200 mt-2 text-sm">
        {pkg.control_description}
      </p>
    </Link>
  );
};

export default PackageCard;
