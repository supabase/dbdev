import { Typography } from '@supabase/ui'
import { useState } from 'react'

const comparisons = ['NPM for NodeJs', 'Cargo for Rust', 'Hex for Elixir']
const rand = Math.random() * comparisons.length
const asInt = parseInt(rand.toFixed(0))
const selected = asInt % comparisons.length

export default function Hero() {
  const [similar, setSimilar] = useState<number>(selected)
  return (
    <div className="p-4">
      <Typography.Text code>database.dev</Typography.Text>
      <p className="pt-4">
        <Typography.Text>
          A database package manager like{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (similar == comparisons.length - 1) setSimilar(0)
              else setSimilar(similar + 1)
            }}
          >
            {comparisons[similar]}
          </a>
          .
        </Typography.Text>
      </p>
    </div>
  )
}
