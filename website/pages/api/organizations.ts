import type { NextApiRequest, NextApiResponse } from 'next'
import { definitions } from '../../types/database'
import { apiSuccess, apiNotFound, apiServerError } from '../../lib/helpers'

/**
 * TYPES
 *  Note that these aren't strictly accurate as the we haven't "Pick<>"ed the values
 */
export type OrgSummary = definitions['organizations']
const summaryFields = `
    id, username, display_name, bio
`

/**
 * API ENTRY
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // @TODO: supabase.setUser() using the Auth Bearer token? Or should we use some sort of access keys?
    return apiNotFound(res)
  } catch (error: unknown) {
    const e = error as Error
    return apiServerError(res, e.message)
  }
}
