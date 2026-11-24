import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Exercise the real action with isolated session and provider boundaries.
const bundled = await build({
  entryPoints: [new URL('./gemini.ts', import.meta.url).pathname],
  bundle: true, write: false, platform: 'node', format: 'esm',
  plugins: [{ name: 'search-boundaries', setup(builder) {
    builder.onResolve({ filter: /^(@google\/genai|@\/lib\/session)$/ }, args => ({ path: args.path, namespace: 'stub' }));
    builder.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: args.path === '@google/genai'
      ? 'export class GoogleGenAI { constructor(options) { globalThis.searchTest.create(options); } models = { generateContent: options => globalThis.searchTest.generate(options) }; }'
      : 'export async function getServerSession() { return globalThis.searchTest.session; }' }));
  }}],
});
const { default: askGemini } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

test('assisted search returns serializable results across the server action boundary', async t => {
  const originalKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    delete globalThis.searchTest;
  });
  function setup() {
    process.env.GEMINI_API_KEY = 'test-key';
    globalThis.searchTest = {
      session: { id: 1, email: 'reader@example.com' },
      create() {},
      generate: async () => ({ text: '<p>John 1:29</p>' }),
    };
  }
  await t.test('returns HTML and a fully interpolated scripture URL instruction', async () => {
    setup();
    globalThis.searchTest.generate = async options => {
      assert.ok(options.config.systemInstruction.includes('https://'));
      assert.ok(!options.config.systemInstruction.includes('${domain}'));
      return { text: '<p>John 1:29</p>' };
    };
    assert.deepEqual(await askGemini('Behold the lamb of God'), { ok: true, html: '<p>John 1:29</p>' });
  });
  await t.test('requires server authentication before calling the provider', async () => {
    setup();
    globalThis.searchTest.session = null;
    globalThis.searchTest.create = () => assert.fail('Must not contact provider');
    const result = await askGemini('John 1');
    assert.equal(result.ok, false);
    assert.equal(result.requiresSignIn, true);
  });
  await t.test('handles missing configuration without constructing the provider', async t => {
    setup();
    t.mock.method(console, 'error', () => {});
    delete process.env.GEMINI_API_KEY;
    globalThis.searchTest.create = () => assert.fail('Must not construct provider');
    assert.match((await askGemini('John 1')).message, /not configured/);
  });
  for (const [status, expected] of [[429, /usage limit/], [400, /configuration/], [403, /configuration/], [404, /configuration/], [503, /temporarily unavailable/], [undefined, /temporarily unavailable/]]) {
    await t.test(`provider failure ${status} returns a safe error instead of throwing`, async t => {
      setup();
      const log = t.mock.method(console, 'error', () => {});
      globalThis.searchTest.generate = async () => { throw Object.assign(new Error('Private provider details'), { status }); };
      const result = JSON.parse(JSON.stringify(await askGemini('John 1')));
      assert.equal(result.ok, false);
      assert.match(result.message, expected);
      assert.ok(!result.message.includes('Private provider details'));
      assert.equal(log.mock.callCount(), 1);
    });
  }
  await t.test('empty provider output is an actionable failure', async () => {
    setup();
    globalThis.searchTest.generate = async () => ({ text: undefined });
    assert.match((await askGemini('John 1')).message, /rephrasing/);
  });
  await t.test('blank input does not contact the provider', async () => {
    setup();
    globalThis.searchTest.create = () => assert.fail('Must not contact provider');
    assert.equal((await askGemini('  ')).ok, false);
  });
});
