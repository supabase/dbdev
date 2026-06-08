import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '~/components/layouts/Layout'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { toast } from '~/hooks/use-toast'
import dayjs from '~/lib/dayjs'
import { NextPageWithLayout } from '~/lib/types'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Package as PackageIcon,
  SlidersHorizontal,
  Calendar,
  Layers,
  User,
  Tag
} from 'lucide-react'

// Define the shape of each package according to database.dev response API
interface Package {
  id: string
  package_name: string
  handle: string
  partial_name: string
  latest_version: string
  description_md: string
  control_description: string
  control_requires: string[]
  created_at: string
  default_version: string
  package_alias: string | null
}

const PackagesPage: NextPageWithLayout = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPublisher, setSelectedPublisher] = useState('all')
  const [selectedRequires, setSelectedRequires] = useState('all')

  // Sorting state
  const [sortField, setSortField] = useState<'package_name' | 'handle' | 'latest_version' | 'created_at'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Copy success animation state per package
  const [copiedPackageId, setCopiedPackageId] = useState<string | null>(null)

  // Fetch packages from the public endpoint
  const fetchPackages = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://api.database.dev/rest/v1/rpc/search_packages', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'apikey': 'sb_publishable_044WUFe74ISl9ARZlSkDAQ_3jFCCRle',
          'content-type': 'application/json',
          'x-client-info': 'supabase-js/2.107.0; runtime=web',
          'Referer': 'https://database.dev/'
        },
        body: JSON.stringify({ handle: '' }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setPackages(data || [])
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching packages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  // Copy install command to clipboard
  const handleCopyCommand = async (pkg: Package) => {
    const alias = pkg.package_alias ?? pkg.package_name
    const version = pkg.latest_version ?? '0.0.0'
    const command = `dbdev add -o ./migrations -s extensions -v ${version} package -n "${alias}"`

    try {
      await navigator.clipboard.writeText(command)
      setCopiedPackageId(pkg.id)
      toast.success(`Copied installation command for ${alias}!`)
      setTimeout(() => {
        setCopiedPackageId(null)
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy command to clipboard')
    }
  }

  // Get unique options for filter dropdowns
  const publishers = useMemo(() => {
    const unique = new Set(packages.map((pkg) => pkg.handle).filter(Boolean))
    return Array.from(unique).sort()
  }, [packages])

  const requiredExtensions = useMemo(() => {
    const unique = new Set<string>()
    packages.forEach((pkg) => {
      if (Array.isArray(pkg.control_requires)) {
        pkg.control_requires.forEach((req) => unique.add(req))
      }
    })
    return Array.from(unique).sort()
  }, [packages])

  // Filter packages based on query, publisher, and required extensions
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // 1. Search Query filter (matches name, alias, handle, descriptions)
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        pkg.package_name.toLowerCase().includes(query) ||
        (pkg.package_alias && pkg.package_alias.toLowerCase().includes(query)) ||
        pkg.handle.toLowerCase().includes(query) ||
        (pkg.control_description && pkg.control_description.toLowerCase().includes(query)) ||
        (pkg.description_md && pkg.description_md.toLowerCase().includes(query))

      // 2. Publisher filter
      const matchesPublisher = selectedPublisher === 'all' || pkg.handle === selectedPublisher

      // 3. Required extension filter
      const matchesRequires =
        selectedRequires === 'all' ||
        (Array.isArray(pkg.control_requires) && pkg.control_requires.includes(selectedRequires))

      return matchesSearch && matchesPublisher && matchesRequires
    })
  }, [packages, searchQuery, selectedPublisher, selectedRequires])

  // Sort filtered packages
  const sortedPackages = useMemo(() => {
    const sorted = [...filteredPackages]
    sorted.sort((a, b) => {
      let aVal = a[sortField] || ''
      let bVal = b[sortField] || ''

      if (sortField === 'created_at') {
        return sortDirection === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime()
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return 0
    })
    return sorted
  }, [filteredPackages, sortField, sortDirection])

  // Pagination calculations
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedPackages.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedPackages, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedPackages.length / itemsPerPage)

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedPublisher('all')
    setSelectedRequires('all')
    setSortField('created_at')
    setSortDirection('desc')
    setCurrentPage(1)
  }

  // Effect to reset page number if filters or page sizes change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedPublisher, selectedRequires, itemsPerPage])

  return (
    <>
      <Head>
        <title>Packages Explorer | dbdev</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        {/* Header Block */}
        <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent border border-emerald-500/10 p-8 md:p-12">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
            <PackageIcon className="w-full h-full text-emerald-600" />
          </div>
          <div className="relative max-w-3xl space-y-4">
            <Badge variant="secondary" className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-medium">
              Database Extensions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent leading-none">
              Packages Explorer
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Discover, filter, and search packages for postgres Trusted Language Extensions (pg_tle). 
              Install extensions in your local migrations or client with ease.
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
              <span>Search and Filters</span>
            </div>
            {(searchQuery || selectedPublisher !== 'all' || selectedRequires !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 h-8 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search packages by name, handle, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500"
              />
            </div>

            {/* Publisher Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
              >
                <option value="all">👥 All Publishers</option>
                {publishers.map((pub) => (
                  <option key={pub} value={pub}>
                    {pub}
                  </option>
                ))}
              </select>
            </div>

            {/* Requires Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedRequires}
                onChange={(e) => setSelectedRequires(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
              >
                <option value="all">🛠️ All Required Extensions</option>
                {requiredExtensions.map((req) => (
                  <option key={req} value={req}>
                    {req}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-8 text-center max-w-2xl mx-auto my-12">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Failed to load packages</h3>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <Button onClick={fetchPackages} variant="outline" className="border-red-300 hover:bg-red-50 dark:hover:bg-red-950/50">
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="p-6 flex flex-col md:flex-row gap-6 animate-pulse">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="w-full md:w-48 space-y-2">
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loaded Data Table */}
        {!loading && !error && (
          <>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        onClick={() => handleSort('package_name')}
                      >
                        <div className="flex items-center gap-1.5">
                          <PackageIcon className="w-3.5 h-3.5" />
                          <span>Package Name</span>
                          {sortField === 'package_name' && (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                      </th>
                      <th
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        onClick={() => handleSort('handle')}
                      >
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>Publisher</span>
                          {sortField === 'handle' && (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                      </th>
                      <th className="py-4 px-6 w-1/3">Description</th>
                      <th className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Version</span>
                        </div>
                      </th>
                      <th className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Requires</span>
                        </div>
                      </th>
                      <th
                        className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Created</span>
                          {sortField === 'created_at' && (
                            sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-500" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                      </th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                    {paginatedPackages.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            <span className="font-semibold text-lg">No packages found</span>
                            <span className="text-sm text-slate-400">Try adjusting your filters or search query.</span>
                            <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 border-emerald-500/20 text-emerald-500">
                              Clear All Filters
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedPackages.map((pkg) => (
                        <tr
                          key={pkg.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                            <Link
                              href={`/${pkg.handle}/${pkg.partial_name}`}
                              className="hover:text-emerald-500 hover:underline transition flex flex-col"
                            >
                              <span>{pkg.package_alias ?? pkg.package_name}</span>
                              {pkg.package_alias && (
                                <span className="text-xs font-mono text-slate-400 font-normal mt-0.5">
                                  {pkg.package_name}
                                </span>
                              )}
                            </Link>
                          </td>
                          <td className="py-4 px-6">
                            <Link href={`/${pkg.handle}`}>
                              <div className="flex items-center gap-2 group cursor-pointer">
                                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/10 uppercase">
                                  {pkg.handle.substring(0, 2)}
                                </div>
                                <span className="group-hover:text-emerald-500 group-hover:underline transition font-mono">
                                  {pkg.handle}
                                </span>
                              </div>
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm truncate">
                            {pkg.control_description || pkg.description_md ? (
                              <p className="line-clamp-2" title={pkg.control_description || pkg.description_md}>
                                {pkg.control_description || pkg.description_md}
                              </p>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 italic">No description provided</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-700 dark:text-slate-300">
                            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium">
                              v{pkg.latest_version}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(pkg.control_requires) && pkg.control_requires.length > 0 ? (
                                pkg.control_requires.map((req) => (
                                  <Badge
                                    key={req}
                                    variant="secondary"
                                    className="px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-none rounded text-[10px] font-mono"
                                  >
                                    {req}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-600">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                            {dayjs(pkg.created_at).fromNow()}
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Copy CLI installation command */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyCommand(pkg)}
                                className={`h-8 px-2.5 transition-all ${
                                  copiedPackageId === pkg.id
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800'
                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                                title="Copy install command"
                              >
                                {copiedPackageId === pkg.id ? (
                                  <Check className="w-3.5 h-3.5 animate-scale-in" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>

                              {/* Link to detail page */}
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 px-2.5 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                <Link href={`/${pkg.handle}/${pkg.partial_name}`} title="View package page">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Controls */}
              {sortedPackages.length > 0 && (
                <div className="py-4 px-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Items count */}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Showing{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {Math.min(sortedPackages.length, (currentPage - 1) * itemsPerPage + 1)}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {Math.min(sortedPackages.length, currentPage * itemsPerPage)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sortedPackages.length}
                    </span>{' '}
                    packages
                  </span>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-4">
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Rows:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        className="bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="h-8 text-xs px-3"
                      >
                        Previous
                      </Button>
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1
                        // Logic to only show immediate pages if total pages are high
                        if (
                          totalPages > 5 &&
                          pageNum !== 1 &&
                          pageNum !== totalPages &&
                          Math.abs(pageNum - currentPage) > 1
                        ) {
                          if (pageNum === 2 || pageNum === totalPages - 1) {
                            return <span key={pageNum} className="px-1.5 text-xs text-slate-400">...</span>
                          }
                          return null
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-8 w-8 p-0 text-xs ${
                              currentPage === pageNum
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : ''
                            }`}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="h-8 text-xs px-3"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

PackagesPage.getLayout = (page) => <Layout containerWidth="full">{page}</Layout>

export default PackagesPage
