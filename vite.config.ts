import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function netlifyFunctionsPlugin(): Plugin {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const fnName = req.url.replace('/api/', '').split('?')[0];
        const validFunctions = ['voice', 'scan', 'check'];
        if (!validFunctions.includes(fnName)) {
          return next();
        }

        try {
          // Read request body buffer
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const bodyBuffer = Buffer.concat(chunks);

          const protocol = req.headers['x-forwarded-proto'] || 'http';
          const host = req.headers.host || 'localhost:5173';
          const fullUrl = `${protocol}://${host}${req.url}`;

          // Create standard Web Request
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value) {
              if (Array.isArray(value)) {
                value.forEach(v => headers.append(key, v));
              } else {
                headers.set(key, value);
              }
            }
          }

          const webReq = new Request(fullUrl, {
            method: req.method,
            headers,
            body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : bodyBuffer,
          });

          // Dynamically load the TypeScript function module
          const mod = await server.ssrLoadModule(`./netlify/functions/${fnName}.ts`);
          const webRes: Response = await mod.default(webReq, {});

          res.statusCode = webRes.status;
          webRes.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });

          const arrayBuffer = await webRes.arrayBuffer();
          res.end(Buffer.from(arrayBuffer));
        } catch (err: any) {
          console.error(`Error in local function /api/${fnName}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), netlifyFunctionsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
