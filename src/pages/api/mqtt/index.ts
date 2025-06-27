import { createProxyMiddleware } from 'http-proxy-middleware'
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

const wsProxy = createProxyMiddleware({
  target: 'ws://haproxy:8083',
  changeOrigin: true,
  ws: true,
})

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return wsProxy(req, res)
}
