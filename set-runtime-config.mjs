import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outputDirectory = process.argv[2] ?? 'dist/bm-frontend';
const apiBaseUrl = (process.env.BACKEND_URL ?? '').trim().replace(/\/$/, '');

if (apiBaseUrl && !/^https?:\/\//i.test(apiBaseUrl) && !apiBaseUrl.startsWith('/')) {
  throw new Error('BACKEND_URL must be empty, an absolute http(s) URL, or a root-relative path.');
}

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  join(outputDirectory, 'runtime-config.js'),
  `window.__BM_RUNTIME_CONFIG__ = ${JSON.stringify({ apiBaseUrl })};\n`,
  'utf8',
);
