import { notFound } from 'next/navigation'
import { source } from '~/lib/source'
import { getMDXComponents } from '~/components/docs/mdx-components'
import { TableOfContents } from '~/components/docs/TableOfContents'
import { DocsBreadcrumb } from '~/components/docs/DocsBreadcrumb'
import { DocsPagination } from '~/components/docs/DocsPagination'
import { findNeighbour } from 'fumadocs-core/page-tree'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function DocsPage(props: PageProps) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDXContent = page.data.body
  const toc = page.data.toc
  const neighbours = findNeighbour(source.pageTree, page.url)

  const breadcrumbs =
    page.slugs.length > 0
      ? [{ name: page.data.title }]
      : []

  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        {breadcrumbs.length > 0 && <DocsBreadcrumb items={breadcrumbs} />}

        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {page.data.title}
        </h1>
        {page.data.description && (
          <p className="text-lg text-muted-foreground mb-8">
            {page.data.description}
          </p>
        )}

        <div className="docs-content">
          <MDXContent components={getMDXComponents()} />
        </div>

        <DocsPagination previous={neighbours.previous} next={neighbours.next} />
      </article>

      <TableOfContents toc={toc} />
    </div>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) return {}

  return {
    title: `${page.data.title} - dbdev Docs`,
    description: page.data.description,
  }
}
