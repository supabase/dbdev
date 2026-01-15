import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { cn } from '~/lib/utils'

export interface PackageCardProps {
  pkg: {
    handle: string
    package_name: string
    package_alias: string
    partial_name: string
    latest_version: string
    control_description: string
  }
  className?: string
}

const PackageCard = ({ pkg, className }: PackageCardProps) => {
  return (
    <Link
      key={pkg.package_alias ?? pkg.package_name}
      href={`/${pkg.handle}/${pkg.partial_name}`}
      className={cn('col-span-4 block group', className)}
    >
      <Card className="h-full transition duration-300 hover:shadow-md opacity-90 hover:opacity-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-base font-medium overflow-hidden truncate max-w-36">
                {pkg.partial_name}
              </CardTitle>
              <span className="font-mono text-xs text-muted-foreground">
                v{pkg.latest_version}
              </span>
            </div>
            <ArrowTopRightOnSquareIcon
              className="w-4 h-4 text-muted-foreground transition group-hover:text-foreground"
              aria-hidden="true"
            />
          </div>
          <CardDescription>{pkg.handle}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {pkg.control_description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default PackageCard
