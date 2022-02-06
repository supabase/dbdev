import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'
import { definitions } from '../../lib/databaseDefinitions'
import { apiSuccess, apiNotFound, apiServerError } from '../../lib/helpers'

export type PackageSummary = definitions['packages']
const summaryFields = `
    id, slug: package_name, owner: handle, name: partial_name
`
export type PackageDetail = definitions['packages']
const detailFields = `
    id, slug: package_name, owner: handle, 
    package_versions (
        id, version, object_id, object_key
    )
`

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

export async function packages() {
  return supabase.from<PackageSummary>('packages').select(summaryFields)
}

export async function packagesByOwner(handle: string) {
  return supabase.from<PackageSummary>('packages').select(detailFields).eq('handle', handle)
}

export async function packageBySlug(slug: string) {
  return supabase
    .from<PackageDetail>('packages')
    .select(detailFields)
    .eq('package_name', slug)
    .single()
}
