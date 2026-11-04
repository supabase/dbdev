import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Markdown from '~/components/ui/markdown'

// Header in the style of GitHub READMEs, e.g. supabase/supa_audit
const README_HTML = `<!-- badges -->
<p align="center">
  <a href="https://github.com/supabase/supa_audit"><img src="https://img.shields.io/badge/postgresql-12+-blue.svg" alt="PostgreSQL version" height="18"></a>
</p>

<details>
<summary>Installation</summary>

Install with the \`dbdev\` CLI.

</details>
`

describe('Markdown Integration', () => {
  it('renders raw HTML from package READMEs instead of escaping it', () => {
    const { container } = render(<Markdown>{README_HTML}</Markdown>)

    // Tags and comments are not printed as text
    expect(container).not.toHaveTextContent('<p')
    expect(container).not.toHaveTextContent('<img')
    expect(container).not.toHaveTextContent('badges')

    // Badge image is rendered inside its link and centered paragraph
    const badge = screen.getByAltText('PostgreSQL version')
    expect(badge.tagName).toBe('IMG')
    expect(badge).toHaveAttribute(
      'src',
      'https://img.shields.io/badge/postgresql-12+-blue.svg'
    )
    expect(badge).toHaveAttribute('height', '18')
    expect(badge.closest('a')).toHaveAttribute(
      'href',
      'https://github.com/supabase/supa_audit'
    )
    expect(badge.closest('p')).toHaveAttribute('align', 'center')

    // Markdown nested in a collapsible section still renders
    const details = container.querySelector('details')
    expect(details).not.toBeNull()
    expect(details!.querySelector('summary')).toHaveTextContent('Installation')
    expect(details!.querySelector('p code')).toHaveTextContent('dbdev')
  })

  it('strips scripts, event handlers and dangerous URLs from raw HTML', () => {
    const { container } = render(
      <Markdown>
        {`<script>alert('script')</script>

<img src="x" onerror="alert('onerror')" alt="image">

<a href="javascript:alert('html')">html link</a> [markdown link](javascript:alert('md'))

<iframe src="https://example.com"></iframe>

<div id="__NEXT_DATA__">clobbered</div>`}
      </Markdown>
    )

    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
    expect(container.querySelector('[onerror]')).toBeNull()
    container.querySelectorAll('a').forEach((link) => {
      expect(link.getAttribute('href') ?? '').not.toMatch(/^javascript:/i)
    })

    // ids from READMEs can't clobber ids the page relies on
    expect(document.getElementById('__NEXT_DATA__')).toBeNull()
  })

  it('keeps highlighting fenced code blocks with a copy button', () => {
    const { container } = render(
      <Markdown>{'```sql\nselect 1;\n```'}</Markdown>
    )

    const code = container.querySelector('pre > code')
    expect(code).toHaveClass('hljs', 'language-sql')
    expect(code!.querySelector('.hljs-keyword')).toHaveTextContent('select')
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('keeps in-page links pointing at their targets', () => {
    render(
      <Markdown>
        {`Records are versioned[^1]. See [the anchor](#anchor).

<a id="anchor"></a>

[^1]: Each change is stored in \`audit.record_version\`.`}
      </Markdown>
    )

    const targetOf = (link: HTMLElement) =>
      document.getElementById(link.getAttribute('href')!.slice(1))

    // Footnote reference and back reference resolve to each other, using the
    // same fragment as GitHub
    const ref = screen.getByRole('link', { name: '1' })
    expect(ref).toHaveAttribute('href', '#user-content-fn-1')
    const footnote = targetOf(ref)
    expect(footnote).toHaveTextContent('audit.record_version')
    const backref = footnote!.querySelector<HTMLElement>(
      'a[data-footnote-backref]'
    )
    expect(targetOf(backref!)).toBe(ref)

    // Links to anchors defined in raw HTML resolve too
    const anchor = targetOf(screen.getByRole('link', { name: 'the anchor' }))
    expect(anchor).not.toBeNull()
    expect(anchor!.tagName).toBe('A')
  })
})
