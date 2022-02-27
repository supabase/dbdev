import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'
import { definitions } from '../../types/database'
import { apiSuccess, apiNotFound, apiServerError } from '../../lib/helpers'

/**
 * TYPES
 *  Note that these aren't strictly accurate as the we haven't "Pick<>"ed the values
 */

export type PackageSummary = definitions['packages'] & {
  slug: string
}
const summaryFields = `
    id, slug, username, name
`
export type PackageDetail = definitions['packages'] & {
  versions: definitions['package_versions'][]
  slug: string
}
const detailFields = `
    id, slug, username, 
    versions: package_versions (
        id, version, object_id, object_key
    )
`

/**
 * API ENTRY
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method == 'GET') {
      const data = await packages()
      return apiSuccess(res, data)
    } else {
      return apiNotFound(res)
    }
  } catch (error: unknown) {
    const e = error as Error
    return apiServerError(res, e.message)
  }
}

/**
 * API METHODS
 */

export async function packages() {
  return supabase.from<PackageSummary>('packages').select(summaryFields)
}

export async function packagesByOwner(username: string) {
  return supabase.from<PackageSummary>('packages').select(detailFields).eq('username', username)
}

export async function packageBySlug(slug: string) {
  return supabase
    .from<PackageDetail>('packages')
    .select(detailFields)
    .eq('slug', slug)
    .single()
}
