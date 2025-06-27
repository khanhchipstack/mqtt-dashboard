const express = require('express');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(
    '/api/mqtt',
    createProxyMiddleware({
      target: 'ws://haproxy:8083',
      changeOrigin: true,
      ws: true,
    })
  );

  server.all('*', (req, res) => handle(req, res));

  const httpServer = http.createServer(server);

  httpServer.listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});
