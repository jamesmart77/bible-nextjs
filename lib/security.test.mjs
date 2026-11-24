import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

async function load(relativePath) {
  const bundled = await build({
    entryPoints: [new URL(relativePath, import.meta.url).pathname],
    bundle: true, write: false, platform: 'node', format: 'esm',
    plugins: [{ name: 'security-boundaries', setup(builder) {
      builder.onResolve({ filter: /^(next\/server|jose|@\/supabase\/utils\/searchHistory)$/ }, args => ({ path: args.path, namespace: 'stub' }));
      builder.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents:
        args.path === 'next/server'
          ? 'export class NextResponse extends Response { static next(options) { return { requestHeaders: options.request.headers, headers: new Headers() }; } static json(body) { return Response.json(body); } }'
          : args.path === 'jose'
            ? 'export async function jwtDecrypt() { if (!globalThis.securityTest.payload) throw new Error("invalid"); return { payload: globalThis.securityTest.payload }; }'
            : 'export async function warmUpDb() { globalThis.securityTest.warmed = true; }'
      }));
    }}],
  });
  return import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
}
const { proxy } = await load('../proxy.ts');
const { GET } = await load('../app/api/cron/route.ts');

test('proxy strips spoofed identity headers for absent and invalid sessions', async () => {
  globalThis.securityTest = {};
  for (const cookie of [undefined, 'invalid']) {
    const result = await proxy({ headers: new Headers({'x-user-id':'999', 'x-user-email':'victim@example.com'}), cookies: { get: () => cookie ? { value: cookie } : undefined } });
    assert.equal(result.requestHeaders.get('x-user-id'), null);
    assert.equal(result.requestHeaders.get('x-user-email'), null);
    if (cookie) assert.match(result.headers.get('set-cookie'), /Max-Age=0/);
  }
  delete globalThis.securityTest;
});

test('proxy forwards identity only from a verified session', async () => {
  globalThis.securityTest = { payload: { id: 1, email: 'reader@example.com' } };
  const result = await proxy({ headers: new Headers({'x-user-id':'999'}), cookies: { get: () => ({ value:'valid' }) } });
  assert.equal(result.requestHeaders.get('x-user-id'), '1');
  assert.equal(result.requestHeaders.get('x-user-email'), 'reader@example.com');
  delete globalThis.securityTest;
});

test('cron rejects Bearer undefined when its secret is missing', async t => {
  const original = process.env.CRON_SECRET;
  t.after(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
    delete globalThis.securityTest;
  });
  t.mock.method(console, 'error', () => {});
  delete process.env.CRON_SECRET;
  globalThis.securityTest = { warmed: false };
  const result = await GET(new Request('https://example.test/api/cron', { headers: { Authorization: 'Bearer undefined' } }));
  assert.equal(result.status, 401);
  assert.equal(globalThis.securityTest.warmed, false);
});
