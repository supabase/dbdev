import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '~/components/layouts/Layout'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent } from '~/components/ui/card'
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
import supabase from '~/lib/supabase'

export interface Package {
  id: string
  package_name: string
  handle: string
  partial_name: string
  latest_version: string
  description_md?: string | null
  control_description?: string | null
  control_requires?: string[] | null
  created_at: string
  default_version?: string | null
  package_alias?: string | null
}

// Default fallback catalog for offline/local development when database is unseeded
const FALLBACK_PACKAGES: Package[] = [
  {
    id: '1',
    package_name: 'olirice-index_advisor',
    handle: 'olirice',
    partial_name: 'index_advisor',
    latest_version: '0.2.0',
    control_description: 'Query index advisor for PostgreSQL',
    control_requires: [],
    created_at: '2023-08-30T08:32:55Z',
    package_alias: 'olirice@index_advisor'
  },
  {
    id: '2',
    package_name: 'burggraf-pg_headerkit',
    handle: 'burggraf',
    partial_name: 'pg_headerkit',
    latest_version: '1.0.0',
    control_description: 'HTTP request and response header parsing toolkit',
    control_requires: [],
    created_at: '2023-03-31T14:59:34Z',
    package_alias: 'burggraf@pg_headerkit'
  },
  {
    id: '3',
    package_name: 'langchain-embedding_search',
    handle: 'langchain',
    partial_name: 'embedding_search',
    latest_version: '1.1.0',
    control_description: 'Vector embeddings search utilities for LangChain',
    control_requires: ['vector'],
    created_at: '2023-05-08T17:59:52Z',
    package_alias: 'langchain@embedding_search'
  },
  {
    id: '4',
    package_name: 'langchain-hybrid_search',
    handle: 'langchain',
    partial_name: 'hybrid_search',
    latest_version: '1.1.0',
    control_description: 'Hybrid keyword and vector semantic search engine',
    control_requires: ['vector', 'pg_trgm'],
    created_at: '2023-05-08T17:59:53Z',
    package_alias: 'langchain@hybrid_search'
  },
  {
    id: '5',
    package_name: 'michelp-adminpack',
    handle: 'michelp',
    partial_name: 'adminpack',
    latest_version: '0.0.2',
    control_description: 'Administrative support functions package',
    control_requires: [],
    created_at: '2023-12-07T11:29:42Z',
    package_alias: 'michelp@adminpack'
  }
]

const PackagesPage: NextPageWithLayout = () => {
  const [packages, setPackages] = useState<Package[]>(FALLBACK_PACKAGES)
  const [loading, setLoading] = useState(false)
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

  // Fetch packages from configured Supabase client or fallback
  const fetchPackages = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false })

      if (!dbError && data && data.length > 0) {
        setPackages(data as any)
        return
      }

      // Try public registry search endpoint
      const response = await fetch('https://api.database.dev/rest/v1/rpc/search_packages', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'apikey': 'sb_publishable_044WUFe74ISl9ARZlSkDAQ_3jFCCRle',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ handle: '' }),
      })

      if (response.ok) {
        const publicData = await response.json()
        if (Array.isArray(publicData) && publicData.length > 0) {
          setPackages(publicData)
          return
        }
      }
      
      // Use fallback if database has no rows
      setPackages(FALLBACK_PACKAGES)
    } catch {
      // Gracefully maintain fallback catalog on network failure
      setPackages(FALLBACK_PACKAGES)
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
    } catch {
      toast.error('Failed to copy command to clipboard')
    }
  }

  // Unique options for filter dropdowns
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
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        pkg.package_name.toLowerCase().includes(query) ||
        (pkg.package_alias && pkg.package_alias.toLowerCase().includes(query)) ||
        pkg.handle.toLowerCase().includes(query) ||
        (pkg.control_description && pkg.control_description.toLowerCase().includes(query)) ||
        (pkg.description_md && pkg.description_md.toLowerCase().includes(query))

      const matchesPublisher = selectedPublisher === 'all' || pkg.handle === selectedPublisher

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
      const aVal = a[sortField] || ''
      const bVal = b[sortField] || ''

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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedPublisher, selectedRequires, itemsPerPage])

  return (
    <>
      <Head>
        <title>Explore Extensions | dbdev</title>
      </Head>

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-7xl">
        {/* Header Block */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium text-xs">
              Registry
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Explore Extensions
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Discover, filter, and search packages for PostgreSQL Trusted Language Extensions (pg_tle). 
            Install extensions in your local migrations or client with ease.
          </p>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-8 border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <span>Search and Filters</span>
              </div>
              {(searchQuery || selectedPublisher !== 'all' || selectedRequires !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset filters
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Input */}
              <div className="relative md:col-span-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search packages by name, handle, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full bg-background border-input text-foreground"
                />
              </div>

              {/* Publisher Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedPublisher}
                  onChange={(e) => setSelectedPublisher(e.target.value)}
                  aria-label="Filter by publisher"
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="all">All Publishers</option>
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
                  aria-label="Filter by required extension"
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="all">All Required Extensions</option>
                  {requiredExtensions.map((req) => (
                    <option key={req} value={req}>
                      {req}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-destructive/50 bg-destructive/10 p-6 text-center max-w-2xl mx-auto">
            <h3 className="text-base font-bold text-destructive mb-2">Failed to load packages</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPackages} variant="outline" size="sm">
              Try Again
            </Button>
          </Card>
        )}

        {/* Loading Skeleton State */}
        {loading && (
          <Card className="overflow-hidden border-border bg-card">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="p-6 flex flex-col md:flex-row gap-6 animate-pulse">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 bg-muted rounded" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </div>
                  <div className="w-full md:w-48 space-y-2">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Data Table */}
        {!loading && (
          <Card className="overflow-hidden border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th
                      className="py-4 px-6 cursor-pointer hover:bg-muted/70 transition"
                      onClick={() => handleSort('package_name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <PackageIcon className="w-3.5 h-3.5" />
                        <span>Package Name</span>
                        {sortField === 'package_name' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th
                      className="py-4 px-6 cursor-pointer hover:bg-muted/70 transition"
                      onClick={() => handleSort('handle')}
                    >
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Publisher</span>
                        {sortField === 'handle' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
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
                      className="py-4 px-6 cursor-pointer hover:bg-muted/70 transition"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created</span>
                        {sortField === 'created_at' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {paginatedPackages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Search className="w-8 h-8 text-muted-foreground/60" />
                          <span className="font-semibold text-lg text-foreground">No packages found</span>
                          <span className="text-sm text-muted-foreground">Try adjusting your filters or search query.</span>
                          <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                            Clear All Filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPackages.map((pkg) => (
                      <tr
                        key={pkg.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-foreground">
                          <Link
                            href={`/${pkg.handle}/${pkg.partial_name}`}
                            className="hover:underline transition flex flex-col"
                          >
                            <span>{pkg.package_alias ?? pkg.package_name}</span>
                            {pkg.package_alias && (
                              <span className="text-xs font-mono text-muted-foreground font-normal mt-0.5">
                                {pkg.package_name}
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="py-4 px-6">
                          <Link href={`/${pkg.handle}`}>
                            <div className="flex items-center gap-2 group cursor-pointer">
                              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center text-[10px] border border-border uppercase">
                                {pkg.handle.substring(0, 2)}
                              </div>
                              <span className="group-hover:underline transition font-mono text-xs text-foreground">
                                {pkg.handle}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground leading-relaxed max-w-sm truncate">
                          {pkg.control_description || pkg.description_md ? (
                            <p className="line-clamp-2 text-xs" title={pkg.control_description || pkg.description_md || ''}>
                              {pkg.control_description || pkg.description_md}
                            </p>
                          ) : (
                            <span className="text-muted-foreground/60 italic text-xs">No description provided</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono text-foreground">
                          <Badge variant="outline" className="text-xs font-medium">
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
                                  className="px-1.5 py-0 rounded text-[10px] font-mono"
                                >
                                  {req}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground/60">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground text-xs whitespace-nowrap">
                          {dayjs(pkg.created_at).fromNow()}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Copy CLI installation command */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyCommand(pkg)}
                              className="h-8 px-2.5"
                              title="Copy install command"
                            >
                              {copiedPackageId === pkg.id ? (
                                <Check className="w-3.5 h-3.5 text-foreground" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>

                            {/* Link to detail page */}
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-8 px-2.5"
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
              <div className="py-4 px-6 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items count */}
                <span className="text-xs text-muted-foreground">
                  Showing{' '}
                  <span className="font-semibold text-foreground">
                    {Math.min(sortedPackages.length, (currentPage - 1) * itemsPerPage + 1)}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-foreground">
                    {Math.min(sortedPackages.length, currentPage * itemsPerPage)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-foreground">
                    {sortedPackages.length}
                  </span>{' '}
                  packages
                </span>

                {/* Pagination Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Rows:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      aria-label="Rows per page"
                      className="bg-transparent border-none focus:ring-0 text-foreground font-semibold cursor-pointer"
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
                      if (
                        totalPages > 5 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - currentPage) > 1
                      ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="px-1.5 text-xs text-muted-foreground">...</span>
                        }
                        return null
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 w-8 p-0 text-xs"
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
          </Card>
        )}
      </div>
    </>
  )
}

PackagesPage.getLayout = (page) => <Layout containerWidth="full">{page}</Layout>

export default PackagesPage
