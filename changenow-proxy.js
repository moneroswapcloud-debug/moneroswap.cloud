const http = require('http');
const https = require('https');

const PORT = 3002;
const ALLOWED_HOST = 'api.changenow.io';

const rateLimit = {};
const LIMIT = 60;
const WINDOW = 60 * 1000;

http.createServer((req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!rateLimit[ip]) rateLimit[ip] = [];
  rateLimit[ip] = rateLimit[ip].filter(t => now - t < WINDOW);
  
  if (rateLimit[ip].length >= LIMIT) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Too Many Requests' }));
  }
  rateLimit[ip].push(now);

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
    headers: { 
      'Content-Type': 'application/json',
      'x-changenow-api-key': '353e12df6ccc210ab17c8cc917aad2aa47b84cd76e764c8dd27944dfb150f60d'
    }
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
