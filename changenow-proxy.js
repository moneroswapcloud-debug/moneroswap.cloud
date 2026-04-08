const http = require('http');
const https = require('https');

const PORT = 3002;
const ALLOWED_HOST = 'api.changenow.io';

http.createServer((req, res) => {
  const params = new URL(req.url, `http://localhost:${PORT}`);
  const target = params.searchParams.get('url');

  if (!target || !target.startsWith(`https://${ALLOWED_HOST}`)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const options = new URL(target);
  const reqOptions = {
    hostname: options.hostname,
    path: options.pathname + options.search,
    method: req.method,
    headers: { 'Content-Type': 'application/json' }
  };

  const proxy = https.request(reqOptions, (apiRes) => {
    res.writeHead(apiRes.statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    apiRes.pipe(res);
  });

  if (req.method === 'POST') req.pipe(proxy);
  else proxy.end();

  proxy.on('error', () => { res.writeHead(502); res.end('Bad Gateway'); });
}).listen(PORT, '127.0.0.1', () => console.log(`Proxy running on port ${PORT}`));
