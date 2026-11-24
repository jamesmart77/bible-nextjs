import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire, Module } from 'node:module';
import { renderToStaticMarkup } from 'react-dom/server';
import { build } from 'esbuild';

const bundled = await build({
  entryPoints: [new URL('./assistedHtml.tsx', import.meta.url).pathname],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'plain-link', setup(builder) {
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'link', namespace: 'stub' }));
    builder.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default "a";' }));
  }}],
});
const compiled = new Module(import.meta.filename);
compiled.filename = import.meta.filename;
compiled.paths = Module._nodeModulePaths(new URL('.', import.meta.url).pathname);
compiled.require = createRequire(import.meta.url);
compiled._compile(bundled.outputFiles[0].text, import.meta.filename);
const render = html => renderToStaticMarkup(compiled.exports.parseAssistedHtml(html));

test('assisted HTML strips executable tags, source attributes, and embedded content', () => {
  assert.equal(render('<script>alert(1)</script><style>body{display:none}</style><svg><a href="javascript:alert(1)">bad</a></svg><iframe src="https://evil.test"></iframe><p onclick="alert(1)" style="position:fixed"><strong>Safe</strong><img src=x onerror="alert(1)"></p>'), '<p><strong>Safe</strong></p>');
});

test('assisted links reject executable, external, protocol-relative, and non-scripture URLs', () => {
  for (const href of ['javascript:alert(1)', 'data:text/html,test', '//evil.test/passages/John/1', 'https://www.justscripture.app.evil.test/passages/John/1', '/api/user', 'https://evil.test']) {
    assert.equal(render(`<a href="${href}"><em>Verse</em></a>`), '<em>Verse</em>');
  }
});

test('assisted HTML retains supported formatting and normalizes scripture links', () => {
  const result = render('<h3>Answer</h3><p><a href="https://www.justscripture.app/passages/John/3/16?tracking=1" target="_blank" onclick="bad()"><strong>John 3:16</strong></a></p>');
  assert.ok(result.includes('href="/passages/John/3/16"'));
  assert.ok(result.includes('<strong>John 3:16</strong>'));
  assert.ok(!/tracking|onclick|target/.test(result));
});
