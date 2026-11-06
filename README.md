# Pitchside
Next.js 15 · TypeScript · Tailwind · Framer Motion. No accounts, no API keys.

    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

Security: strict CSP (frames only from strmfree.st / streamfree.top), HSTS, nosniff, frame-ancestors none;
upstream responses validated and host-allow-listed server-side; inputs regex-checked; per-IP rate limit on /api;
upstream cached via Next data cache (60s list, 15s single stream). Embeds are intentionally not sandboxed, per the API docs.
The in-memory rate limiter is per instance; use a WAF or Upstash for multi-instance deployments.
