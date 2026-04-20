const http = require('http');
const https = require('https');

const PORT = 3003;
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
  const reqHeaders = { 
    'Content-Type': 'application/json',
    'x-changenow-api-key': process.env.CHANGENOW_API_KEY,
    'x-changenow-apikey': process.env.CHANGENOW_API_KEY
  };

  const startProxy = (method, path, headers, body = null) => {
    const reqOptions = {
      hostname: options.hostname,
      path: path,
      method: method,
      headers: headers
    };

    const proxy = https.request(reqOptions, (apiRes) => {
      res.writeHead(apiRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      apiRes.pipe(res);
    });

    proxy.on('error', (err) => {
      console.error(`[ERROR] Proxy a ${target}: ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(502);
        res.end('Bad Gateway');
      }
    });

    if (body !== null) {
      proxy.write(body);
      proxy.end();
    } else if (req.method === 'POST') {
      req.pipe(proxy);
    } else {
      proxy.end();
    }
  };

  req.on('error', (err) => console.error(`[ERROR] Petición cliente: ${err.message}`));

  if (req.method === 'POST' && options.pathname && options.pathname.includes('/v2/exchange')) {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', () => {
      let finalBody = bodyData;
      let injected = false;
      try {
        const parsed = JSON.parse(bodyData);
        parsed.ref_id = 'acd06cc';
        finalBody = JSON.stringify(parsed);
        injected = true;
      } catch (e) {
        console.error(`[ERROR] Error parsing JSON: ${e.message}`);
      }
      
      reqHeaders['Content-Length'] = Buffer.byteLength(finalBody);
      console.log(`[${new Date().toISOString()}] POST ${target} - ref_id inyectado: ${injected}`);
      startProxy('POST', options.pathname + options.search, reqHeaders, finalBody);
    });
  } else {
    console.log(`[${new Date().toISOString()}] ${req.method} ${target}`);
    startProxy(req.method, options.pathname + options.search, reqHeaders);
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Proxy running on port ${PORT}`));
