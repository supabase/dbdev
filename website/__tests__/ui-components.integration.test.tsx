import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

function ProfileCard({
  name,
  role,
  initials,
  onFollow
}: {
  name: string
  role: string
  initials: string
  onFollow: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="" alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Badge>PostgreSQL</Badge>
          <Badge variant="secondary">Extensions</Badge>
          <Badge variant="outline">Open Source</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onFollow}>Follow</Button>
      </CardFooter>
    </Card>
  )
}

describe('UI Components Integration', () => {
  it('renders a profile card with all UI components working together', async () => {
    const user = userEvent.setup()
    const handleFollow = vi.fn()

    render(
      <ProfileCard
        name="Jane Developer"
        role="Database Engineer"
        initials="JD"
        onFollow={handleFollow}
      />
    )

    // Card content renders correctly
    expect(screen.getByText('Jane Developer')).toBeInTheDocument()
    expect(screen.getByText('Database Engineer')).toBeInTheDocument()

    // Avatar fallback shows initials
    expect(screen.getByText('JD')).toBeInTheDocument()

    // Badges render with different variants
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
    expect(screen.getByText('Extensions')).toBeInTheDocument()
    expect(screen.getByText('Open Source')).toBeInTheDocument()

    // Button interaction works
    const followButton = screen.getByRole('button', { name: /follow/i })
    await user.click(followButton)
    expect(handleFollow).toHaveBeenCalledOnce()
  })

  it('renders badges with correct variant classes', () => {
    render(
      <div>
        <Badge data-testid="default">Default</Badge>
        <Badge variant="secondary" data-testid="secondary">Secondary</Badge>
        <Badge variant="destructive" data-testid="destructive">Destructive</Badge>
        <Badge variant="outline" data-testid="outline">Outline</Badge>
      </div>
    )

    expect(screen.getByTestId('default')).toHaveClass('bg-primary')
    expect(screen.getByTestId('secondary')).toHaveClass('bg-secondary')
    expect(screen.getByTestId('destructive')).toHaveClass('bg-destructive')
    expect(screen.getByTestId('outline')).not.toHaveClass('bg-primary')
  })
})
