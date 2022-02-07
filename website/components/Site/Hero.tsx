import { Typography } from '@supabase/ui'
import { useState } from 'react'

const comparisons = [
  'NPM for NodeJs',
  'Cargo for Rust',
  'Hex for Elixir',
  'pip for Python',
  'Gem for Ruby',
]
const rand = Math.random() * comparisons.length
const asInt = parseInt(rand.toFixed(0))
const selected = asInt % comparisons.length

export default function Hero() {
  const [similar, setSimilar] = useState<number>(selected)
  return (
    <div className="p-4 my-12">
      <h2 className="text-4xl font-bold">The Database Package Manager</h2>
      <p className="pt-4 text-lg">

          Like{' '}
          <a
            href="#"
            className="border rounded p-1 border-gray-300 bg-gray-50 font-mono"
            onClick={(e) => {
              e.preventDefault()
              if (similar == comparisons.length - 1) setSimilar(0)
              else setSimilar(similar + 1)
            }}
          >
            {comparisons[similar]}
          </a>.
      </p>
    </div>
  )
}
