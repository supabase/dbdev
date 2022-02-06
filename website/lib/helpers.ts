import type { NextApiResponse } from 'next'

export function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function apiSuccess(res: NextApiResponse, data: any) {
  return res.status(200).json(data)
}

export function apiNotFound(res: NextApiResponse) {
  return res.status(404).json({
    status: 404,
    message: 'Not found.',
    error: 'Not found.',
  })
}

export function apiServerError(res: NextApiResponse, message: string) {
  return res.status(500).json({
    status: 500,
    message,
    error: message,
  })
}
